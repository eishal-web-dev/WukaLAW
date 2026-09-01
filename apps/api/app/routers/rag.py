"""Grounded RAG endpoint with optional Legal Intelligence analysis."""
from __future__ import annotations

import os
from functools import lru_cache
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ai.embeddings.model_provider import create_provider
from ai.rag.llm_provider import (
    FallbackLLMProvider,
    GeminiProvider,
    GroqProvider,
    LLMProvider,
    LocalLlamaProvider,
    OllamaProvider,
    OpenAIProvider,
)
from ai.rag.rag_pipeline import RagPipeline
from ai.retrieval import (
    CrossEncoderReranker,
    HybridRetriever,
    LegalRetriever,
    LexicalOverlapReranker,
    RerankingRetriever,
)
from ai.vectorstore.config import QdrantSettings
from ai.vectorstore.qdrant_client import get_shared_qdrant_client

router = APIRouter(prefix="/api/rag", tags=["rag"])

DEFAULT_FALLBACK_ORDER = ("groq", "gemini", "openai", "ollama")


class ChatTurnModel(BaseModel):
    role: str = Field(pattern="^(user|ai|assistant)$")
    content: str = Field(min_length=1, max_length=10000)


class RagQueryRequest(BaseModel):
    question: str = Field(min_length=1, max_length=10000)
    top_k: int = Field(default=10, ge=1, le=100)
    score_threshold: float | None = None
    filters: dict[str, Any] = Field(default_factory=dict)
    use_legal_intelligence: bool = True
    history: list[ChatTurnModel] = Field(default_factory=list, max_length=40)


class RagQueryResponse(BaseModel):
    answer: str
    confidence: str
    validation_status: str
    citations: list[dict[str, Any]]
    retrieved_chunks: list[dict[str, Any]]
    original_question: str
    retrieval_query: str
    legal_intelligence: dict[str, Any] | None
    applied_filters: dict[str, Any]
    pipeline_warnings: list[str]
    processing_time_ms: float
    llm_provider: str | None = None


def _build_named_provider(name: str) -> LLMProvider:
    if name == "groq":
        return GroqProvider(
            model=os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile"),
            api_key=os.getenv("GROQ_API_KEY"),
        )
    if name == "gemini":
        return GeminiProvider(
            model=os.getenv("GEMINI_MODEL", "gemini-3.6-flash"),
            api_key=os.getenv("GEMINI_API_KEY"),
        )
    if name == "openai":
        return OpenAIProvider(os.getenv("OPENAI_MODEL", "gpt-4.1-mini"))
    if name in {"local", "local_llama", "llama"}:
        return LocalLlamaProvider(model=os.getenv("LOCAL_LLAMA_MODEL", "local-llama"))
    if name == "ollama":
        return OllamaProvider(
            os.getenv("OLLAMA_MODEL", "llama3.1"),
            os.getenv("OLLAMA_BASE_URL", "http://localhost:11434"),
        )
    raise RuntimeError(f"Unsupported RAG_LLM_PROVIDER: {name}")


def _has_credentials(name: str) -> bool:
    """Ollama/local don't need a key; the hosted APIs do. Skipping providers
    with no configured key avoids a guaranteed-to-fail attempt in the chain."""
    if name == "groq":
        return bool(os.getenv("GROQ_API_KEY"))
    if name == "gemini":
        return bool(os.getenv("GEMINI_API_KEY"))
    if name == "openai":
        return bool(os.getenv("OPENAI_API_KEY"))
    return True


def _provider() -> LLMProvider:
    """Selects the LLM provider for /api/rag/query.

    RAG_LLM_PROVIDER=<name> (groq/gemini/openai/ollama/local) — legacy
    behavior: use exactly that one provider, no fallback.

    RAG_LLM_PROVIDER=auto — build a fallback chain from
    RAG_LLM_FALLBACK_ORDER (comma-separated, default "groq,gemini,openai,
    ollama"), skipping any hosted provider with no API key configured. If a
    provider fails at generation time (rate limit, quota, network error),
    the next one in the chain is tried automatically.
    """
    name = os.getenv("RAG_LLM_PROVIDER", "groq").casefold()

    if name != "auto":
        return _build_named_provider(name)

    order = [
        part.strip().casefold()
        for part in os.getenv("RAG_LLM_FALLBACK_ORDER", ",".join(DEFAULT_FALLBACK_ORDER)).split(",")
        if part.strip()
    ]
    chain = [(n, _build_named_provider(n)) for n in order if _has_credentials(n)]
    if not chain:
        raise RuntimeError(
            "RAG_LLM_PROVIDER=auto but no provider in RAG_LLM_FALLBACK_ORDER has credentials configured "
            "(set GROQ_API_KEY/GEMINI_API_KEY/OPENAI_API_KEY, or include 'ollama' for a free local option)"
        )
    return FallbackLLMProvider(chain)


@lru_cache(maxsize=1)
def get_pipeline():
    settings = QdrantSettings.from_env()
    client = get_shared_qdrant_client(settings)
    embeddings = create_provider(
        os.getenv("EMBEDDING_MODEL", "BAAI/bge-m3"),
        os.getenv("EMBEDDING_DEVICE", "auto"),
    )
    dense = LegalRetriever(client, settings.collection, embeddings)
    return RagPipeline(
        _build_retriever(dense),
        _provider(),
    )


def _build_retriever(dense: LegalRetriever):
    """Wraps the plain dense retriever with hybrid fusion and/or reranking,
    per docs/STRATIFIED_RETRIEVAL_REPORT.md's recommendation, based on
    environment configuration. Both default to off — a fresh deployment
    keeps today's plain-dense behavior until explicitly opted in.

    RETRIEVAL_MODE=hybrid enables HybridRetriever (issue #47): dense
    retrieval fused with a lexical relevance score computed over the
    retrieved candidate pool. RETRIEVAL_HYBRID_DENSE_WEIGHT (default 0.6)
    controls the fusion balance.

    RAG_RERANKER=lexical|cross_encoder enables a reranking pass (issue
    #46) on top of whichever retriever RETRIEVAL_MODE selected.
    'cross_encoder' needs the sentence-transformers package and
    network/cache access to a model on first use; if that's unavailable
    the request fails clearly (503) rather than silently degrading, since
    a silent fallback would hide a misconfiguration in production. Use
    'lexical' if that dependency isn't available.
    """
    retriever = dense
    if os.getenv("RETRIEVAL_MODE", "dense").casefold() == "hybrid":
        retriever = HybridRetriever(
            retriever,
            dense_weight=float(os.getenv("RETRIEVAL_HYBRID_DENSE_WEIGHT", "0.6")),
        )

    reranker_name = os.getenv("RAG_RERANKER", "").casefold()
    if reranker_name == "lexical":
        retriever = RerankingRetriever(retriever, LexicalOverlapReranker())
    elif reranker_name == "cross_encoder":
        retriever = RerankingRetriever(
            retriever,
            CrossEncoderReranker(os.getenv("CROSS_ENCODER_MODEL", "BAAI/bge-reranker-base")),
        )
    elif reranker_name not in {"", "none"}:
        raise RuntimeError(f"Unsupported RAG_RERANKER: {reranker_name}")

    return retriever


@router.post("/query", response_model=RagQueryResponse)
def query_rag(request: RagQueryRequest):
    try:
        result = get_pipeline().run(
            request.question,
            request.filters,
            top_k=request.top_k,
            score_threshold=request.score_threshold,
            use_legal_intelligence=request.use_legal_intelligence,
            history=[turn.model_dump() for turn in request.history],
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=f"RAG service unavailable: {exc}") from exc

    data = result.to_dict()
    return RagQueryResponse(
        answer=data["answer"],
        confidence=data["confidence"],
        validation_status=data["validation"]["status"],
        citations=data["citations"],
        retrieved_chunks=data["retrieved_chunks"],
        original_question=data["original_question"],
        retrieval_query=data["retrieval_query"],
        legal_intelligence=data["legal_intelligence"],
        applied_filters=data["applied_filters"],
        pipeline_warnings=data["pipeline_warnings"],
        processing_time_ms=data["processing_time_ms"],
        llm_provider=data.get("llm_provider"),
    )
