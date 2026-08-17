"""Tests for RAG_LLM_PROVIDER=auto building a fallback chain in the
/api/rag/query router, and legacy single-provider selection still working
unchanged."""
import pytest

from ai.rag.llm_provider import FallbackLLMProvider, GroqProvider
from apps.api.app.routers import rag


def test_legacy_single_provider_selection_is_unchanged(monkeypatch):
    monkeypatch.setenv("RAG_LLM_PROVIDER", "groq")
    monkeypatch.setenv("GROQ_API_KEY", "test-key")
    provider = rag._provider()
    assert isinstance(provider, GroqProvider)


def test_auto_builds_fallback_chain_skipping_providers_without_credentials(monkeypatch):
    monkeypatch.setenv("RAG_LLM_PROVIDER", "auto")
    monkeypatch.delenv("GROQ_API_KEY", raising=False)
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    monkeypatch.setenv("RAG_LLM_FALLBACK_ORDER", "groq,gemini,openai,ollama")

    provider = rag._provider()

    assert isinstance(provider, FallbackLLMProvider)
    names = [name for name, _ in provider.providers]
    # groq and openai have no key configured, so they're skipped;
    # gemini has a key, ollama never needs one.
    assert names == ["gemini", "ollama"]


def test_auto_respects_custom_fallback_order(monkeypatch):
    monkeypatch.setenv("RAG_LLM_PROVIDER", "auto")
    monkeypatch.setenv("GROQ_API_KEY", "test-key")
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")
    monkeypatch.setenv("RAG_LLM_FALLBACK_ORDER", "gemini,groq")

    provider = rag._provider()

    names = [name for name, _ in provider.providers]
    assert names == ["gemini", "groq"]


def test_auto_with_no_credentials_anywhere_raises_clear_error(monkeypatch):
    monkeypatch.setenv("RAG_LLM_PROVIDER", "auto")
    monkeypatch.delenv("GROQ_API_KEY", raising=False)
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    monkeypatch.setenv("RAG_LLM_FALLBACK_ORDER", "groq,gemini,openai")

    with pytest.raises(RuntimeError, match="no provider"):
        rag._provider()
