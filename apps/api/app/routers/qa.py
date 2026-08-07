from fastapi import APIRouter, Depends
from sqlalchemy import and_, select
from sqlalchemy.orm import Session

from ai.qa import rag
from ai.retrieval import index as vector_index
from app.auth import get_current_user
from app.config import settings
from app.db import get_db
from app.models import Chunk, Document, User
from app.routers.search import OVERFETCH_FACTOR, chunks_to_sources
from app.schemas import AskRequest, AskResponse

router = APIRouter(tags=["qa"])


def _documents_containing_terms(db: Session, user: User, phrase: str) -> list[str]:
    """Titles of the user's documents whose text contains every content term."""
    terms = sorted(rag._content_terms(phrase))
    if not terms:
        return []
    conditions = [Document.text.ilike(f"%{term}%") for term in terms]
    rows = db.scalars(
        select(Document.title)
        .where(and_(Document.owner_id == user.id, *conditions))
        .order_by(Document.created_at.desc())
    ).all()
    return list(rows)


@router.post("/ask", response_model=AskResponse)
def ask(
    request: AskRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if rag.is_library_question(request.question):
        return _library_answer(db, user)

    kind = rag.classify_query(request.question)

    if kind == "vague":
        return {
            "answer": rag.VAGUE_MESSAGE,
            "confidence": {
                "level": "low",
                "reason": "The query is too short or vague to search reliably.",
            },
            "sources": [],
            "model": "none",
        }

    hits = vector_index.search(
        request.question,
        settings.top_k * OVERFETCH_FACTOR,
        owner_id=user.id,
    )
    sources = chunks_to_sources(db, hits, user, settings.top_k)

    if kind == "lookup":
        phrase = request.question.strip().strip("?.,")
        documents = _documents_containing_terms(db, user, phrase)
        if not documents:
            return {
                "answer": (
                    f'"{phrase}" does not appear in any of your uploaded documents. '
                    "Upload a document that mentions it, or check the spelling."
                ),
                "confidence": {"level": "low", "reason": "No document contains these terms."},
                "sources": [],
                "model": "none",
            }
        matching = [s for s in sources if any(t in _lower(s.text) for t in rag._content_terms(phrase))]
        best = rag.best_matching_sentences(phrase, [s.text for s in (matching or sources)])
        return {
            "answer": rag.lookup_overview(phrase, documents, best),
            "confidence": {
                "level": "medium",
                "reason": f"Keyword lookup — found literal mentions in {len(documents)} document(s).",
            },
            "sources": (matching or sources)[:3],
            "model": "lookup",
        }

    answer_text, level, reason, model = rag.answer(
        request.question, [(source.text, source.score) for source in sources]
    )
    if answer_text == rag.NOT_ENOUGH:
        sources = []
    return {
        "answer": answer_text,
        "confidence": {"level": level, "reason": reason},
        "sources": sources,
        "model": model,
    }


def _lower(text: str) -> str:
    return text.lower()


def _library_answer(db: Session, user: User) -> dict:
    """Answer questions about the document collection itself from the database."""
    documents = db.scalars(
        select(Document).where(Document.owner_id == user.id).order_by(Document.created_at.desc())
    ).all()
    if not documents:
        answer = "You have no documents uploaded yet. Use the Upload page to add your first one."
    else:
        lines = []
        for document in documents:
            if document.summary and document.summary.get("short_summary"):
                about = rag._truncate_words(document.summary["short_summary"], 25)
            else:
                about = rag._truncate_words(document.text, 25) + " (not summarized yet)"
            lines.append(f"• {document.title} — {about}")
        plural = "s" if len(documents) != 1 else ""
        answer = f"You have {len(documents)} document{plural} uploaded:\n\n" + "\n".join(lines)
    return {
        "answer": answer,
        "confidence": {"level": "high", "reason": "Answered directly from your document library."},
        "sources": [],
        "model": "library",
    }
