"""Hybrid dense + lexical retrieval, plus pluggable reranking.

docs/STRATIFIED_RETRIEVAL_REPORT.md ran a 600-chunk stratified evaluation
of dense BGE-M3 retrieval alone and found a simple lexical baseline beating
it at every cutoff (Recall@10 0.7368 vs 0.5263, MRR 0.5577 vs 0.4467), with
dense semantic queries especially weak. Its recommendation was: "hybrid
dense + lexical retrieval, metadata filtering, and reranking." This module
implements that — issue #47 (hybrid search) and #46 (reranker).

Both pieces are pure post-processing over whatever a dense Retriever (e.g.
LegalRetriever) returns, so they compose with it via the same
`.search(query) -> list[LegalSearchResult]` shape used by ai/rag/rag_pipeline.py,
and don't require any change to the underlying Qdrant collection.
"""
from __future__ import annotations

import math
import re
from dataclasses import replace
from typing import Protocol

from .models import LegalSearchQuery, LegalSearchResult

_TOKEN_RE = re.compile(r"[a-z0-9]+")


def _tokenize(text: str) -> list[str]:
    return _TOKEN_RE.findall((text or "").casefold())


class Retriever(Protocol):
    def search(self, query: LegalSearchQuery) -> list[LegalSearchResult]: ...


def lexical_score(query_tokens: list[str], candidate_tokens: list[str]) -> float:
    """A small BM25-flavoured relevance score computed over a single
    candidate, not the full corpus: live retrieval over Qdrant doesn't have
    cheap access to corpus-wide document-frequency stats the way the
    offline evaluator's `lexical_evaluate` does, so this scores term
    frequency in the candidate (log-dampened, like BM25's TF term),
    weighted by how much of the query's vocabulary the candidate covers,
    and normalized by candidate length so long chunks don't win purely by
    containing more words. Zero if there's no term overlap at all.
    """
    if not query_tokens or not candidate_tokens:
        return 0.0
    query_set = set(query_tokens)
    candidate_counts: dict[str, int] = {}
    for token in candidate_tokens:
        candidate_counts[token] = candidate_counts.get(token, 0) + 1
    overlap_terms = query_set & candidate_counts.keys()
    if not overlap_terms:
        return 0.0
    length_norm = math.sqrt(len(candidate_tokens))
    raw = sum(1 + math.log(candidate_counts[t]) for t in overlap_terms)
    coverage = len(overlap_terms) / len(query_set)
    return (raw / length_norm) * coverage


def _normalize(values: list[float]) -> list[float]:
    """Min-max normalize to [0, 1] so dense cosine scores and lexical
    scores (which live on different scales) can be fused with simple
    weighted addition. A pool with no spread at all normalizes to all
    zeros rather than dividing by zero."""
    if not values:
        return []
    lo, hi = min(values), max(values)
    if hi - lo < 1e-9:
        return [0.0 for _ in values]
    return [(v - lo) / (hi - lo) for v in values]


class HybridRetriever:
    """Wraps a dense Retriever and fuses its results with a lexical score
    computed over the retrieved candidate pool (issue #47).

    Overfetches from the dense retriever (top_k * overfetch_multiplier,
    capped at max_overfetch) so there's a wide-enough pool for lexical
    rescoring to actually be able to change the final order — rescoring
    only the caller's requested top_k would just re-sort a list that's
    already been narrowed by the weaker dense signal.
    """

    def __init__(
        self,
        dense: Retriever,
        *,
        overfetch_multiplier: int = 4,
        dense_weight: float = 0.6,
        max_overfetch: int = 100,
    ):
        if not 0.0 <= dense_weight <= 1.0:
            raise ValueError("dense_weight must be between 0 and 1")
        if overfetch_multiplier < 1:
            raise ValueError("overfetch_multiplier must be at least 1")
        self.dense = dense
        self.overfetch_multiplier = overfetch_multiplier
        self.dense_weight = dense_weight
        self.max_overfetch = max_overfetch

    def search(self, query: LegalSearchQuery) -> list[LegalSearchResult]:
        requested_top_k = query.top_k
        overfetch_k = min(requested_top_k * self.overfetch_multiplier, self.max_overfetch)
        wide_query = replace(query, top_k=max(overfetch_k, requested_top_k))
        candidates = self.dense.search(wide_query)
        if not candidates:
            return candidates

        query_tokens = _tokenize(query.query)
        dense_scores = [c.score for c in candidates]
        lexical_scores = [lexical_score(query_tokens, _tokenize(c.text_preview)) for c in candidates]

        norm_dense = _normalize(dense_scores)
        norm_lexical = _normalize(lexical_scores)
        fused = [
            self.dense_weight * d + (1 - self.dense_weight) * l
            for d, l in zip(norm_dense, norm_lexical)
        ]

        order = sorted(range(len(candidates)), key=lambda i: -fused[i])[:requested_top_k]
        return [
            replace(candidates[i], rank=new_rank + 1, score=fused[i])
            for new_rank, i in enumerate(order)
        ]


# ---------------------------------------------------------------------------
# Reranking (#46)
# ---------------------------------------------------------------------------


class RerankerUnavailableError(RuntimeError):
    """Raised when a reranker needs a dependency or model that isn't
    available (e.g. CrossEncoderReranker without network/model access)."""


class Reranker(Protocol):
    def rerank(self, query: str, results: list[LegalSearchResult], top_k: int | None = None) -> list[LegalSearchResult]: ...


class LexicalOverlapReranker:
    """Free, always-available reranker: re-scores already-retrieved results
    by exact-term overlap with the query, using the same `lexical_score`
    HybridRetriever uses for fusion. No network, no model download —
    usable as the default reranker or as a fallback if a heavier reranker
    (e.g. CrossEncoderReranker) is unavailable.
    """

    def rerank(
        self, query: str, results: list[LegalSearchResult], top_k: int | None = None
    ) -> list[LegalSearchResult]:
        if not results:
            return results
        query_tokens = _tokenize(query)
        scored = [(r, lexical_score(query_tokens, _tokenize(r.text_preview))) for r in results]
        scored.sort(key=lambda pair: -pair[1])
        limit = top_k if top_k is not None else len(results)
        return [replace(r, rank=i + 1) for i, (r, _) in enumerate(scored[:limit])]


class CrossEncoderReranker:
    """Higher-quality reranker using a sentence-transformers CrossEncoder
    (e.g. `BAAI/bge-reranker-base`). Needs the `sentence-transformers`
    package and network/cache access to load model weights on first use.

    Deliberately lazy: the model is only loaded on the first `rerank`
    call, and any failure (missing package, no network, bad model name)
    is normalized into `RerankerUnavailableError` so callers can catch it
    and fall back to `LexicalOverlapReranker` instead of crashing a
    request — the same pattern used by `ai/preprocessing/ocr.py` for
    tesseract availability.
    """

    def __init__(self, model_name: str = "BAAI/bge-reranker-base"):
        self.model_name = model_name
        self._model = None

    def _load(self):
        if self._model is not None:
            return self._model
        try:
            from sentence_transformers import CrossEncoder
        except ImportError as exc:
            raise RerankerUnavailableError("sentence-transformers is not installed") from exc
        try:
            self._model = CrossEncoder(self.model_name)
        except Exception as exc:
            raise RerankerUnavailableError(
                f"Could not load cross-encoder model '{self.model_name}': {exc}"
            ) from exc
        return self._model

    def rerank(
        self, query: str, results: list[LegalSearchResult], top_k: int | None = None
    ) -> list[LegalSearchResult]:
        if not results:
            return results
        model = self._load()
        pairs = [(query, r.text_preview) for r in results]
        try:
            scores = model.predict(pairs)
        except Exception as exc:
            raise RerankerUnavailableError(f"Cross-encoder inference failed: {exc}") from exc

        order = sorted(range(len(results)), key=lambda i: -float(scores[i]))
        limit = top_k if top_k is not None else len(results)
        return [replace(results[i], rank=new_rank + 1) for new_rank, i in enumerate(order[:limit])]


class RerankingRetriever:
    """Wraps a Retriever and applies a Reranker to its results as a final
    pass — composable with HybridRetriever (#47) or usable directly over
    a plain dense retriever, e.g.:

        RerankingRetriever(HybridRetriever(dense), LexicalOverlapReranker())
        RerankingRetriever(dense, CrossEncoderReranker())
    """

    def __init__(self, inner: Retriever, reranker: Reranker):
        self.inner = inner
        self.reranker = reranker

    def search(self, query: LegalSearchQuery) -> list[LegalSearchResult]:
        results = self.inner.search(query)
        return self.reranker.rerank(query.query, results, query.top_k)
