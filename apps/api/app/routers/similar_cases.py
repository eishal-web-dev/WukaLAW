"""Similar Pakistani judgment search API."""
from __future__ import annotations

import os
from functools import lru_cache

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, model_validator

from ai.embeddings.model_provider import create_provider
from ai.retrieval import LegalRetriever
from ai.similar_cases import SimilarCasePipeline, SimilarCaseRequest
from ai.vectorstore.config import QdrantSettings, resolve_legal_collection
from ai.vectorstore.qdrant_client import get_shared_qdrant_client
from app.config import settings as app_settings

router = APIRouter(prefix="/api/cases", tags=["similar-cases"])


class SimilarCasesRequest(BaseModel):
    situation: str | None = None
    top_k: int = Field(10, ge=1, le=50)
    court: str | None = None
    jurisdiction: str | None = "Pakistan"
    case_category: str | None = None
    include_outcomes: bool = True
    document_id: str | None = None
    case_number: str | None = None

    @model_validator(mode="after")
    def source_required(self):
        if not any(
            isinstance(value, str) and value.strip()
            for value in (self.situation, self.document_id, self.case_number)
        ):
            raise ValueError("situation, document_id, or case_number is required")
        return self


@lru_cache(maxsize=8)
def get_similar_case_pipeline(collection: str | None = None):
    backend = app_settings.legal_retrieval_backend.strip().casefold()
    if backend not in {"auto", "supabase", "qdrant"}:
        raise RuntimeError("LEGAL_RETRIEVAL_BACKEND must be auto, supabase, or qdrant.")
    if backend in {"auto", "supabase"} and bool(app_settings.supabase_url) != bool(app_settings.supabase_service_role_key):
        raise RuntimeError(
            "Supabase legal corpus configuration is incomplete; both SUPABASE_URL "
            "and SUPABASE_SERVICE_ROLE_KEY are required."
        )
    if backend in {"auto", "supabase"} and app_settings.supabase_url and app_settings.supabase_service_role_key:
        from ai.retrieval.supabase_retriever import SupabaseLegalRetriever

        provider = create_provider(app_settings.embedding_model, app_settings.embedding_device)
        return SimilarCasePipeline(SupabaseLegalRetriever(
            app_settings.supabase_url,
            app_settings.supabase_service_role_key,
            provider,
        ))
    if backend == "supabase":
        raise RuntimeError("Supabase legal corpus credentials are not configured.")

    settings = QdrantSettings.from_env()
    client = get_shared_qdrant_client(settings)
    resolved_collection = collection or resolve_legal_collection(client, settings)[0]
    provider = create_provider(
        os.getenv("EMBEDDING_MODEL", "BAAI/bge-m3"),
        os.getenv("EMBEDDING_DEVICE", "auto"),
    )
    return SimilarCasePipeline(
        LegalRetriever(client, resolved_collection, provider)
    )


@router.post("/similar")
def similar_cases(request: SimilarCasesRequest):
    try:
        return get_similar_case_pipeline().run(
            SimilarCaseRequest(**request.model_dump())
        ).to_dict()
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(
            status_code=503,
            detail=f"Similar-case service unavailable: {exc}",
        ) from exc
