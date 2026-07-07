from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ai.qa import rag
from ai.retrieval import index as vector_index
from app.auth import get_current_user
from app.config import settings
from app.db import get_db
from app.models import User
from app.routers.search import OVERFETCH_FACTOR, chunks_to_sources
from app.schemas import AskRequest, AskResponse

router = APIRouter(tags=["qa"])


@router.post("/ask", response_model=AskResponse)
def ask(
    request: AskRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    hits = vector_index.search(request.question, settings.top_k * OVERFETCH_FACTOR)
    sources = chunks_to_sources(db, hits, user, settings.top_k)
    answer_text, level, reason, model = rag.answer(
        request.question, [(source.text, source.score) for source in sources]
    )
    if answer_text == rag.NOT_ENOUGH:
        # a refusal must not present weakly-related passages as "sources"
        sources = []
    return {
        "answer": answer_text,
        "confidence": {"level": level, "reason": reason},
        "sources": sources,
        "model": model,
    }
