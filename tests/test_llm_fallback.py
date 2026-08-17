"""Tests for FallbackLLMProvider: the automatic provider-to-provider
fallback used by /api/rag/query when RAG_LLM_PROVIDER=auto."""
import pytest

from ai.rag.llm_provider import FallbackLLMProvider, LLMProvider
from ai.rag.rag_pipeline import RagPipeline


class _StubProvider(LLMProvider):
    """Deterministic stub: either raises or returns a fixed response,
    and records every prompt it was called with."""

    def __init__(self, name, *, fails=False, response="ok"):
        self.name = name
        self.fails = fails
        self.response = response
        self.calls = 0

    def generate(self, prompt):
        self.calls += 1
        if self.fails:
            raise RuntimeError(f"{self.name} is unavailable")
        return self.response


class _StaticRetriever:
    def __init__(self, results):
        self._results = results

    def search(self, query):
        return self._results


def test_uses_first_provider_when_it_succeeds():
    first = _StubProvider("groq", response="from groq")
    second = _StubProvider("gemini", response="from gemini")
    chain = FallbackLLMProvider([("groq", first), ("gemini", second)])

    result = chain.generate("question")

    assert result == "from groq"
    assert chain.last_used == "groq"
    assert first.calls == 1
    assert second.calls == 0


def test_falls_back_to_next_provider_on_failure():
    first = _StubProvider("groq", fails=True)
    second = _StubProvider("gemini", response="from gemini")
    chain = FallbackLLMProvider([("groq", first), ("gemini", second)])

    result = chain.generate("question")

    assert result == "from gemini"
    assert chain.last_used == "gemini"
    assert first.calls == 1
    assert second.calls == 1
    assert "groq" in chain.last_errors[0]


def test_falls_through_multiple_failures_to_a_working_provider():
    first = _StubProvider("groq", fails=True)
    second = _StubProvider("gemini", fails=True)
    third = _StubProvider("openai", response="from openai")
    chain = FallbackLLMProvider([("groq", first), ("gemini", second), ("openai", third)])

    result = chain.generate("question")

    assert result == "from openai"
    assert chain.last_used == "openai"
    assert len(chain.last_errors) == 2


def test_raises_with_all_provider_errors_when_every_provider_fails():
    first = _StubProvider("groq", fails=True)
    second = _StubProvider("gemini", fails=True)
    chain = FallbackLLMProvider([("groq", first), ("gemini", second)])

    with pytest.raises(RuntimeError) as exc_info:
        chain.generate("question")

    assert "groq" in str(exc_info.value)
    assert "gemini" in str(exc_info.value)
    assert chain.last_used is None


def test_empty_provider_list_is_rejected_at_construction():
    with pytest.raises(ValueError):
        FallbackLLMProvider([])


def test_pipeline_surfaces_which_provider_answered():
    """RagPipeline should report which provider actually generated the
    answer, and note any providers that failed before it, on the result —
    this is what /api/rag/query returns as `llm_provider`."""
    first = _StubProvider("groq", fails=True)
    second = _StubProvider("gemini", response="INSUFFICIENT_EVIDENCE")
    chain = FallbackLLMProvider([("groq", first), ("gemini", second)])

    from ai.retrieval.models import LegalSearchResult

    result_obj = LegalSearchResult(
        1, 0.9, "c1", ["c1"], "doc-1", "Example v State", "case.txt", "dataset-a",
        "judgment", "Supreme Court", "national", "constitutional", "ABC/2020",
        "paragraph", None, None, "14", "en", "some retrieved passage", None,
        ["2020 SCMR 1"], ["Constitution"], [], ["14"], [], {}, [],
    )

    pipeline = RagPipeline(
        _StaticRetriever([result_obj]),
        chain,
        intelligence_analyzer=lambda q: _NoIntelligence(),
    )

    result = pipeline.run("What does the document say?", {}, use_legal_intelligence=False)

    assert result.llm_provider == "gemini"
    assert result.pipeline_warnings
    assert any("groq" in w for w in result.pipeline_warnings)


class _NoIntelligence:
    def to_dict(self):
        return {}
