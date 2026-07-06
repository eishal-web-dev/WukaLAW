from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ai.retrieval import index as vector_index
from app.db import get_db
from app.models import Chunk
from app.schemas import SimilarRequest, SimilarResponse, Source

router = APIRouter(tags=["search"])


def chunks_to_sources(db: Session, hits: list[tuple[int, float]]) -> list[Source]:
    sources: list[Source] = []
    for chunk_id, score in hits:
        chunk = db.get(Chunk, chunk_id)
        if chunk is None:  # index can be ahead of DB if files were deleted manually
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
    return sources


@router.post("/similar-cases", response_model=SimilarResponse)
def similar_cases(request: SimilarRequest, db: Session = Depends(get_db)):
    hits = vector_index.search(request.query, request.top_k)
    return {"results": chunks_to_sources(db, hits)}
