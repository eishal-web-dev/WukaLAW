"""Grounded RAG endpoint using the repository orchestration layer."""
from __future__ import annotations

import os
from functools import lru_cache
from typing import Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ai.embeddings.model_provider import create_provider
from ai.rag.llm_provider import LocalLlamaProvider, OllamaProvider, OpenAIProvider
from ai.rag.rag_pipeline import RagPipeline
from ai.retrieval import LegalRetriever
from ai.vectorstore.config import QdrantSettings
from ai.vectorstore.qdrant_client import WakuQdrantClient

router = APIRouter(prefix="/api/rag", tags=["rag"])


class RagQueryRequest(BaseModel):
    question: str = Field(min_length=1, max_length=10000)
    filters: dict[str, Any] | None = None


class RagQueryResponse(BaseModel):
    answer: str
    confidence: str
    citations: list[dict[str, Any]]
    retrieved_chunks: list[dict[str, Any]]
    processing_time: float


def _provider():
    name = os.getenv("RAG_LLM_PROVIDER", "ollama").casefold()
    if name == "openai":
        return OpenAIProvider(os.getenv("OPENAI_MODEL", "gpt-4.1-mini"))
    if name in {"local", "local_llama", "llama"}:
        return LocalLlamaProvider(model=os.getenv("LOCAL_LLAMA_MODEL", "local-llama"))
    if name == "ollama":
        return OllamaProvider(os.getenv("OLLAMA_MODEL", "llama3.1"), os.getenv("OLLAMA_BASE_URL", "http://localhost:11434"))
    raise RuntimeError(f"Unsupported RAG_LLM_PROVIDER: {name}")


@lru_cache(maxsize=1)
def get_pipeline() -> RagPipeline:
    settings = QdrantSettings.from_env()
    client = WakuQdrantClient(settings)
    embeddings = create_provider(os.getenv("EMBEDDING_MODEL", "BAAI/bge-m3"), os.getenv("EMBEDDING_DEVICE", "auto"))
    return RagPipeline(LegalRetriever(client, settings.collection, embeddings), _provider())


@router.post("/query", response_model=RagQueryResponse)
def query_rag(request: RagQueryRequest):
    try:
        result = get_pipeline().run(request.question, request.filters)
    except (RuntimeError, ValueError) as exc:
        raise HTTPException(status_code=503, detail=f"RAG service unavailable: {exc}") from exc
    data = result.to_dict()
    return RagQueryResponse(
        answer=data["answer"], confidence=data["confidence"], citations=data["citations"],
        retrieved_chunks=data["retrieved_chunks"], processing_time=data["processing_time_ms"],
    )
