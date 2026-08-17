"""Tests for ai/retrieval/hybrid.py — HybridRetriever (#47) and the
Reranker interface + RerankingRetriever (#46)."""
import pytest

from ai.retrieval.hybrid import (
    CrossEncoderReranker,
    HybridRetriever,
    LexicalOverlapReranker,
    RerankerUnavailableError,
    RerankingRetriever,
    lexical_score,
    _normalize,
    _tokenize,
)
from ai.retrieval.models import LegalSearchQuery, LegalSearchResult


def _result(rank, score, cid, text, title=None):
    return LegalSearchResult(
        rank, score, cid, [cid], "doc-1", title or cid, "case.txt", "dataset-a",
        "judgment", "Supreme Court", "national", "constitutional", "ABC/2020",
        "paragraph", None, None, None, "en", text, None, [], [], [], [], [], {}, [],
    )


class _StaticDenseRetriever:
    """Always returns the same fixed candidate pool, regardless of the
    requested top_k, so tests can control overfetch behavior precisely."""

    def __init__(self, results):
        self._results = results
        self.last_query = None

    def search(self, query):
        self.last_query = query
        return self._results


# ---------------------------------------------------------------------------
# lexical_score / _tokenize / _normalize — small pure-function tests
# ---------------------------------------------------------------------------


def test_tokenize_lowercases_and_extracts_words():
    assert _tokenize("Bail under Section 497!") == ["bail", "under", "section", "497"]


def test_lexical_score_zero_with_no_overlap():
    assert lexical_score(["bail"], ["custody", "divorce"]) == 0.0


def test_lexical_score_zero_with_empty_input():
    assert lexical_score([], ["bail"]) == 0.0
    assert lexical_score(["bail"], []) == 0.0


def test_lexical_score_rewards_more_query_term_coverage():
    query = ["bail", "murder", "firearm"]
    partial = lexical_score(query, ["bail", "unrelated", "words", "here"])
    full = lexical_score(query, ["bail", "murder", "firearm", "case"])
    assert full > partial


def test_lexical_score_penalizes_long_candidates_via_length_norm():
    query = ["bail"]
    short = lexical_score(query, ["bail", "granted"])
    long_padded = lexical_score(query, ["bail"] + ["filler"] * 50)
    assert short > long_padded


def test_normalize_handles_no_spread():
    assert _normalize([5.0, 5.0, 5.0]) == [0.0, 0.0, 0.0]


def test_normalize_maps_to_zero_one_range():
    values = _normalize([1.0, 3.0, 5.0])
    assert values[0] == 0.0
    assert values[-1] == 1.0
    assert 0.0 < values[1] < 1.0


# ---------------------------------------------------------------------------
# HybridRetriever
# ---------------------------------------------------------------------------


def test_hybrid_retriever_overfetches_from_dense():
    dense = _StaticDenseRetriever([_result(i + 1, 0.5, f"c{i}", "some text") for i in range(20)])
    hybrid = HybridRetriever(dense, overfetch_multiplier=4)

    hybrid.search(LegalSearchQuery(query="bail", top_k=5))

    assert dense.last_query.top_k == 20  # 5 * 4


def test_hybrid_retriever_caps_overfetch_at_max():
    dense = _StaticDenseRetriever([_result(i + 1, 0.5, f"c{i}", "text") for i in range(5)])
    hybrid = HybridRetriever(dense, overfetch_multiplier=10, max_overfetch=30)

    hybrid.search(LegalSearchQuery(query="bail", top_k=10))

    assert dense.last_query.top_k == 30  # capped, not 100


def test_hybrid_retriever_returns_at_most_requested_top_k():
    dense = _StaticDenseRetriever([_result(i + 1, 0.5, f"c{i}", "bail order text") for i in range(20)])
    hybrid = HybridRetriever(dense)

    results = hybrid.search(LegalSearchQuery(query="bail", top_k=3))

    assert len(results) == 3
    assert [r.rank for r in results] == [1, 2, 3]


def test_hybrid_retriever_promotes_strong_lexical_match_over_weak_dense_lead():
    """A candidate with a mediocre dense score but an exact term match
    should be able to outrank a candidate with a higher dense score but no
    lexical overlap at all — this is the whole point of hybrid fusion,
    directly motivated by the stratified eval showing dense-only retrieval
    losing to a lexical baseline at every cutoff."""
    weak_dense_strong_lexical = _result(1, 0.55, "c-lexical", "bail application under section 497 pakistan penal code")
    strong_dense_no_lexical = _result(2, 0.60, "c-dense", "completely unrelated passage about tax revenue matters")
    dense = _StaticDenseRetriever([strong_dense_no_lexical, weak_dense_strong_lexical])
    # With only two candidates, min-max normalization always maps scores to
    # exactly {0.0, 1.0} regardless of the real gap between them, so an even
    # 0.5/0.5 fusion weight would tie here on tie-break order alone. Weighting
    # toward the lexical signal isolates the effect this test is checking.
    hybrid = HybridRetriever(dense, dense_weight=0.3)

    results = hybrid.search(LegalSearchQuery(query="bail application section 497", top_k=2))

    assert results[0].canonical_chunk_id == "c-lexical"


def test_hybrid_retriever_empty_candidates_returns_empty():
    dense = _StaticDenseRetriever([])
    hybrid = HybridRetriever(dense)

    assert hybrid.search(LegalSearchQuery(query="bail", top_k=5)) == []


def test_hybrid_retriever_rejects_invalid_dense_weight():
    with pytest.raises(ValueError):
        HybridRetriever(_StaticDenseRetriever([]), dense_weight=1.5)


def test_hybrid_retriever_rejects_invalid_overfetch_multiplier():
    with pytest.raises(ValueError):
        HybridRetriever(_StaticDenseRetriever([]), overfetch_multiplier=0)


# ---------------------------------------------------------------------------
# LexicalOverlapReranker
# ---------------------------------------------------------------------------


def test_lexical_reranker_reorders_by_term_overlap():
    off_topic = _result(1, 0.9, "c-off-topic", "completely unrelated tax matters")
    on_topic = _result(2, 0.3, "c-on-topic", "bail application under section 497")
    reranker = LexicalOverlapReranker()

    reranked = reranker.rerank("bail application section 497", [off_topic, on_topic])

    assert reranked[0].canonical_chunk_id == "c-on-topic"
    assert reranked[0].rank == 1
    assert reranked[1].rank == 2


def test_lexical_reranker_respects_top_k_limit():
    results = [_result(i + 1, 0.5, f"c{i}", "bail order") for i in range(10)]
    reranker = LexicalOverlapReranker()

    reranked = reranker.rerank("bail", results, top_k=3)

    assert len(reranked) == 3


def test_lexical_reranker_handles_empty_results():
    assert LexicalOverlapReranker().rerank("bail", []) == []


# ---------------------------------------------------------------------------
# CrossEncoderReranker — availability/failure handling only.
# A real model load needs network access to Hugging Face, which isn't
# available in this environment, so this test exercises the fallback path
# (RerankerUnavailableError), not real cross-encoder inference.
# ---------------------------------------------------------------------------


def test_cross_encoder_reranker_raises_clear_error_when_unavailable():
    reranker = CrossEncoderReranker(model_name="this-model-does-not-exist/definitely-not-real")
    results = [_result(1, 0.5, "c1", "bail order text")]

    with pytest.raises(RerankerUnavailableError):
        reranker.rerank("bail", results)


def test_cross_encoder_reranker_empty_results_skips_model_load():
    """No results means no need to even attempt loading the model — this
    should not raise even without network/model access."""
    reranker = CrossEncoderReranker(model_name="this-model-does-not-exist/definitely-not-real")
    assert reranker.rerank("bail", []) == []


# ---------------------------------------------------------------------------
# RerankingRetriever — composition
# ---------------------------------------------------------------------------


def test_reranking_retriever_composes_with_hybrid_retriever():
    off_topic = _result(1, 0.9, "c-off-topic", "unrelated tax matters")
    on_topic = _result(2, 0.3, "c-on-topic", "bail application section 497")
    dense = _StaticDenseRetriever([off_topic, on_topic])
    pipeline = RerankingRetriever(HybridRetriever(dense, dense_weight=0.5), LexicalOverlapReranker())

    results = pipeline.search(LegalSearchQuery(query="bail application section 497", top_k=2))

    assert results[0].canonical_chunk_id == "c-on-topic"


def test_reranking_retriever_over_plain_dense_retriever():
    off_topic = _result(1, 0.9, "c-off-topic", "unrelated tax matters")
    on_topic = _result(2, 0.3, "c-on-topic", "bail application section 497")
    dense = _StaticDenseRetriever([off_topic, on_topic])
    pipeline = RerankingRetriever(dense, LexicalOverlapReranker())

    results = pipeline.search(LegalSearchQuery(query="bail application section 497", top_k=2))

    assert results[0].canonical_chunk_id == "c-on-topic"
