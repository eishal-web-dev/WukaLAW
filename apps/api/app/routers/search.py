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
    allowed_document_ids: set[int] | None = None,
) -> list[Source]:
    """Converts raw vector-search hits into citable sources, enforcing access.

    Default behaviour (lawyers): a chunk is included only if its document's
    owner_id matches the requesting user -- unchanged from before.

    When allowed_document_ids is given (client requests, see qa.py): a chunk
    is included only if its document_id is in that explicit set, regardless
    of who technically owns the underlying Document row. This is how a
    client can search within a lawyer-owned case's documents without ever
    being able to see that lawyer's other, unrelated cases -- the vector
    index itself is only ever queried scoped to the case's actual owner, and
    this second filter narrows the results back down to just that one case.
    """
    sources: list[Source] = []
    for chunk_id, score in hits:
        if score < min_score:
            continue
        chunk = db.get(Chunk, chunk_id)
        if chunk is None:
            continue
        if allowed_document_ids is not None:
            if chunk.document_id not in allowed_document_ids:
                continue
        elif chunk.document.owner_id != user.id:
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
            db, hits, user, request.top_k, min_score=settings.min_answerable
        )
    }
