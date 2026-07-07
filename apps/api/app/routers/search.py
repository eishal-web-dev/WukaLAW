from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ai.retrieval import index as vector_index
from app.auth import get_current_user
from app.config import settings
from app.db import get_db
from app.models import Chunk, User
from app.schemas import SimilarRequest, SimilarResponse, Source

router = APIRouter(tags=["search"])

# the FAISS index is shared, so over-fetch then keep only the caller's documents
OVERFETCH_FACTOR = 4


def chunks_to_sources(
    db: Session,
    hits: list[tuple[int, float]],
    user: User,
    limit: int,
    min_score: float = 0.0,
) -> list[Source]:
    sources: list[Source] = []
    for chunk_id, score in hits:
        if score < min_score:
            continue  # hits are sorted desc, but keep the guard simple and total
        chunk = db.get(Chunk, chunk_id)
        if chunk is None or chunk.document.owner_id != user.id:
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
    hits = vector_index.search(request.query, request.top_k * OVERFETCH_FACTOR)
    return {
        "results": chunks_to_sources(
            db, hits, user, request.top_k, min_score=settings.min_answerable
        )
    }
