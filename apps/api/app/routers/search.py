import re

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ai.retrieval import index as vector_index
from app.auth import get_current_user
from app.config import settings
from app.db import get_db
from app.models import Chunk, User
from app.schemas import SimilarRequest, SimilarResponse, Source

router = APIRouter(tags=["search"])

# Qdrant now filters by owner_id before returning hits. A small over-fetch keeps
# compatibility with deleted/stale DB rows without exposing another user's data.
OVERFETCH_FACTOR = 2


def chunks_to_sources(
    db: Session,
    hits: list[tuple[int, float]],
    user: User,
    limit: int,
    min_score: float = 0.0,
    query: str | None = None,
) -> list[Source]:
    sources: list[Source] = []
    for chunk_id, score in hits:
        if score < min_score:
            continue
        chunk = db.get(Chunk, chunk_id)
        if chunk is None or chunk.document.owner_id != user.id:
            continue
        if query:
            query_terms = set(re.findall(r"[a-z0-9]+", query.casefold()))
            chunk_terms = set(re.findall(r"[a-z0-9]+", chunk.text.casefold()))
            if not query_terms.intersection(chunk_terms):
                continue
        sources.append(
            Source(
                document_id=chunk.document_id,
                document_title=chunk.document.title,
                chunk_id=chunk.id,
                text=chunk.text,
                score=round(score, 4),
            )
        )
        if len(sources) >= limit:
            break
    return sources


@router.post("/similar-cases", response_model=SimilarResponse)
def similar_cases(
    request: SimilarRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    hits = vector_index.search(
        request.query,
        request.top_k * OVERFETCH_FACTOR,
        owner_id=user.id,
    )
    return {
        "results": chunks_to_sources(
            db, hits, user, request.top_k,
            min_score=0.0 if settings.fake_embeddings else settings.min_answerable,
            query=request.query,
        )
    }
