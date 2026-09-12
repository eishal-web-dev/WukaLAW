from fastapi import APIRouter, Depends, HTTPException
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


def _documents_containing_terms(
    db: Session, phrase: str, search_owner_id: int, allowed_document_ids: set[int] | None
) -> list[str]:
    """Titles of the accessible documents whose text contains every content term."""
    terms = sorted(rag._content_terms(phrase))
    if not terms:
        return []
    conditions = [Document.text.ilike(f"%{term}%") for term in terms]
    if allowed_document_ids is not None:
        scope = Document.id.in_(allowed_document_ids)
    else:
        scope = Document.owner_id == search_owner_id
    rows = db.scalars(
        select(Document.title)
        .where(and_(scope, *conditions))
        .order_by(Document.created_at.desc())
    ).all()
    return list(rows)


def _resolve_search_scope(db: Session, user: User, case_id: int | None) -> tuple[set[int], set[int] | None]:
    """Returns (owner_ids_to_search_as, allowed_document_ids).

    Lawyers search their own indexed vectors directly with no extra
    filtering (allowed_document_ids=None means 'use the owner_id check').

    Clients must specify a case_id. Documents on a case can be indexed
    under EITHER owner_id: the case's lawyer (if they uploaded it) or the
    client themselves (if they uploaded it via /client/upload -- clients
    have been able to do this since the Upload Documents feature, but this
    function originally assumed only a lawyer ever uploads, which was true
    when it was first written and became wrong later without this being
    updated). A still-unclaimed case (owner_id is None) has no lawyer
    index to search at all -- only the client's own. Returns both
    plausible owner_ids so the caller can search across whichever ones
    actually indexed something for this case, then chunks_to_sources()
    narrows the merged results down to only this one case's documents, so
    a client can never see another case's material even though the
    underlying search may run across a lawyer's full index.
    """
    if user.role != "client":
        return {user.id}, None

    if case_id is None:
        raise HTTPException(status_code=400, detail="case_id is required for client questions.")

    from app.routers.cases import _get_owned_case

    case = _get_owned_case(db, case_id, user)
    document_ids = set(db.scalars(select(Document.id).where(Document.case_id == case.id)).all())
    owner_ids = {user.id}
    if case.owner_id is not None:
        owner_ids.add(case.owner_id)
    return owner_ids, document_ids


@router.post("/ask", response_model=AskResponse)
def ask(
    request: AskRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    search_owner_ids, allowed_document_ids = _resolve_search_scope(db, user, request.case_id)

    if rag.is_library_question(request.question):
        return _library_answer(db, user, allowed_document_ids)

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

    # A case's documents can be indexed under more than one owner_id (see
    # _resolve_search_scope) -- search each one that's actually relevant
    # and merge. Most of the time this is a single search (one lawyer, no
    # client uploads yet), but never fewer than needed, and never crashes
    # on an unclaimed case the way a bare owner_id=None search would.
    hits: list[tuple[int, float]] = []
    for owner_id in search_owner_ids:
        hits.extend(
            vector_index.search(
                request.question,
                settings.top_k * OVERFETCH_FACTOR,
                owner_id=owner_id,
            )
        )
    hits.sort(key=lambda item: item[1], reverse=True)
    sources = chunks_to_sources(db, hits, user, settings.top_k, allowed_document_ids=allowed_document_ids)

    if kind == "lookup":
        phrase = request.question.strip().strip("?.,")
        documents = _documents_containing_terms(db, phrase, next(iter(search_owner_ids)), allowed_document_ids)
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


def _library_answer(db: Session, user: User, allowed_document_ids: set[int] | None) -> dict:
    """Answer questions about the document collection itself from the database."""
    if allowed_document_ids is not None:
        documents = db.scalars(
            select(Document).where(Document.id.in_(allowed_document_ids)).order_by(Document.created_at.desc())
        ).all()
    else:
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
