from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ai.qa import rag
from ai.retrieval import index as vector_index
from app.config import settings
from app.db import get_db
from app.routers.search import chunks_to_sources
from app.schemas import AskRequest, AskResponse

router = APIRouter(tags=["qa"])


@router.post("/ask", response_model=AskResponse)
def ask(request: AskRequest, db: Session = Depends(get_db)):
    hits = vector_index.search(request.question, settings.top_k)
    sources = chunks_to_sources(db, hits)
    answer_text, level, reason, model = rag.answer(
        request.question, [(source.text, source.score) for source in sources]
    )
    return {
        "answer": answer_text,
        "confidence": {"level": level, "reason": reason},
        "sources": sources,
        "model": model,
    }
