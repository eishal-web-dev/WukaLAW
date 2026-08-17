"""Tests for RETRIEVAL_MODE / RAG_RERANKER env-var wiring in
apps/api/app/routers/rag.py — _build_retriever composes HybridRetriever
and/or RerankingRetriever around the plain dense retriever based on
configuration, defaulting to off (today's plain-dense behavior) unless
explicitly opted in."""
import pytest

from ai.retrieval.hybrid import CrossEncoderReranker, HybridRetriever, RerankingRetriever
from apps.api.app.routers import rag


class _FakeDenseRetriever:
    def search(self, query):
        return []


def test_default_is_plain_dense_no_wrapping(monkeypatch):
    monkeypatch.delenv("RETRIEVAL_MODE", raising=False)
    monkeypatch.delenv("RAG_RERANKER", raising=False)
    dense = _FakeDenseRetriever()

    retriever = rag._build_retriever(dense)

    assert retriever is dense


def test_hybrid_mode_wraps_in_hybrid_retriever(monkeypatch):
    monkeypatch.setenv("RETRIEVAL_MODE", "hybrid")
    monkeypatch.delenv("RAG_RERANKER", raising=False)
    dense = _FakeDenseRetriever()

    retriever = rag._build_retriever(dense)

    assert isinstance(retriever, HybridRetriever)
    assert retriever.dense is dense


def test_hybrid_dense_weight_is_configurable(monkeypatch):
    monkeypatch.setenv("RETRIEVAL_MODE", "hybrid")
    monkeypatch.setenv("RETRIEVAL_HYBRID_DENSE_WEIGHT", "0.25")
    monkeypatch.delenv("RAG_RERANKER", raising=False)

    retriever = rag._build_retriever(_FakeDenseRetriever())

    assert retriever.dense_weight == 0.25


def test_lexical_reranker_wraps_plain_dense(monkeypatch):
    monkeypatch.delenv("RETRIEVAL_MODE", raising=False)
    monkeypatch.setenv("RAG_RERANKER", "lexical")
    dense = _FakeDenseRetriever()

    retriever = rag._build_retriever(dense)

    assert isinstance(retriever, RerankingRetriever)
    assert retriever.inner is dense


def test_hybrid_and_reranker_compose_together(monkeypatch):
    monkeypatch.setenv("RETRIEVAL_MODE", "hybrid")
    monkeypatch.setenv("RAG_RERANKER", "lexical")

    retriever = rag._build_retriever(_FakeDenseRetriever())

    assert isinstance(retriever, RerankingRetriever)
    assert isinstance(retriever.inner, HybridRetriever)


def test_cross_encoder_reranker_selection(monkeypatch):
    monkeypatch.delenv("RETRIEVAL_MODE", raising=False)
    monkeypatch.setenv("RAG_RERANKER", "cross_encoder")
    monkeypatch.setenv("CROSS_ENCODER_MODEL", "some/model")

    retriever = rag._build_retriever(_FakeDenseRetriever())

    assert isinstance(retriever, RerankingRetriever)
    assert isinstance(retriever.reranker, CrossEncoderReranker)
    assert retriever.reranker.model_name == "some/model"


def test_unsupported_reranker_name_raises_clear_error(monkeypatch):
    monkeypatch.setenv("RAG_RERANKER", "not-a-real-reranker")

    with pytest.raises(RuntimeError, match="Unsupported RAG_RERANKER"):
        rag._build_retriever(_FakeDenseRetriever())


def test_reranker_none_is_equivalent_to_unset(monkeypatch):
    monkeypatch.setenv("RAG_RERANKER", "none")
    dense = _FakeDenseRetriever()

    retriever = rag._build_retriever(dense)

    assert retriever is dense
