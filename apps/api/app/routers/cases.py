from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ai.analysis.contradictions import find_contradictions
from ai.similar_cases import SimilarCaseRequest
from ai.timeline.extract import extract_events
from app.auth import get_current_user
from app.db import get_db
from app.models import Case, Chunk, Document, User
from app.schemas import (
    CaseCreate,
    CaseList,
    CaseOut,
    CaseUpdate,
    ContradictionsResponse,
    DocumentList,
    TimelineResponse,
)
from app.services.notification_service import create_notification

router = APIRouter(prefix="/cases", tags=["cases"])

ALLOWED_STATUS = {"Active", "Review", "On Hold", "Closed"}
ALLOWED_PRIORITY = {"Low", "Medium", "High", "Critical"}

# Case-management labels provide only a BROAD legal-domain hint. Specific
# sub-issues must come from the user's facts/documents or explicit custom focus.
CASE_TYPE_HINTS = {
    "family": "Pakistani family-law dispute ordinarily heard under the family-court framework",
    "criminal": "Pakistani criminal-law matter governed by criminal procedure and penal law",
    "civil": "Pakistani civil litigation governed by civil procedure and substantive civil law",
    "constitutional": "Pakistani constitutional-law matter involving constitutional jurisdiction",
    "property": "Pakistani civil property-law dispute",
    "tax": "Pakistani tax and revenue-law dispute",
    "corporate": "Pakistani company and corporate-law dispute",
    "labour": "Pakistani labour and employment-law dispute",
    "employment": "Pakistani labour and employment-law dispute",
}


def _get_owned_case(db: Session, case_id: int, user: User) -> Case:
    case = db.get(Case, case_id)
    if case is None or case.owner_id != user.id:
        raise HTTPException(status_code=404, detail="Case not found.")
    return case


def _case_out(db: Session, case: Case) -> dict:
    docs = db.scalar(select(func.count()).where(Document.case_id == case.id)) or 0
    return {
        "id": case.id,
        "case_number": case.case_number,
        "title": case.title,
        "case_type": case.case_type,
        "status": case.status,
        "priority": case.priority,
        "description": case.description,
        "deadline": case.deadline,
        "num_documents": docs,
        "created_at": case.created_at,
    }


def _validate(status: str | None, priority: str | None) -> None:
    if status is not None and status not in ALLOWED_STATUS:
        raise HTTPException(status_code=422, detail=f"status must be one of {sorted(ALLOWED_STATUS)}")
    if priority is not None and priority not in ALLOWED_PRIORITY:
        raise HTTPException(status_code=422, detail=f"priority must be one of {sorted(ALLOWED_PRIORITY)}")


def _case_type_hint(case_type: str) -> str:
    normalized = (case_type or "").strip().casefold()
    for key, hint in CASE_TYPE_HINTS.items():
        if key in normalized:
            return hint
    return f"Pakistani legal dispute classified by the user as {case_type.strip()}"


def _similar_case_seed(case: Case, documents: list[Document], focus: str | None = None) -> str:
    """Build a focused legal/factual profile of a user's case for precedent retrieval."""
    parts = [
        "Jurisdiction: Pakistan",
        f"Case title: {case.title}",
        f"Case type: {case.case_type}",
        f"Legal domain hint: {_case_type_hint(case.case_type)}",
    ]
    if case.description and case.description.strip():
        parts.append(f"Case facts and issues: {case.description.strip()}")
    if focus and focus.strip():
        # Custom focus is deliberately explicit and high in the seed so the
        # retriever/ranker prioritises the user's chosen fact pattern.
        parts.append(f"USER-SELECTED SEARCH FOCUS: {focus.strip()}")

    for document in documents[:4]:
        text = " ".join((document.text or "").split())
        if text:
            parts.append(f"Evidence/document {document.title}: {text[:2200]}")

    return "\n".join(parts)


def _run_similar_search(
    *,
    case: Case,
    documents: list[Document],
    top_k: int,
    focus: str | None = None,
) -> dict:
    situation = _similar_case_seed(case, documents, focus=focus)
    try:
        from app.routers.similar_cases import get_similar_case_pipeline

        result = get_similar_case_pipeline().run(
            SimilarCaseRequest(
                situation=situation,
                top_k=top_k,
                jurisdiction="Pakistan",
                include_outcomes=True,
            )
        ).to_dict()
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=f"Similar-case service unavailable: {exc}") from exc

    result["source_case"] = {
        "id": case.id,
        "case_number": case.case_number,
        "title": case.title,
        "case_type": case.case_type,
        "documents_used": min(len(documents), 4),
        "search_mode": "custom" if focus else "auto",
        "focus": focus or None,
    }
    return result


@router.post("", response_model=CaseOut, status_code=201)
def create_case(request: CaseCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _validate(request.status, request.priority)
    year = __import__("datetime").date.today().year
    count = db.scalar(select(func.count()).where(Case.owner_id == user.id)) or 0
    case = Case(
        owner_id=user.id,
        case_number=f"WL-{year}-{count + 1:03d}",
        title=request.title.strip(),
        case_type=request.case_type.strip(),
        status=request.status or "Active",
        priority=request.priority or "Medium",
        description=request.description or "",
        deadline=request.deadline,
    )
    db.add(case)
    db.flush()
    create_notification(
        db,
        user_id=user.id,
        notification_type="case",
        title="Case created",
        body=f"{case.case_number} · {case.title} was added to your workspace.",
        action_url=f"/cases/{case.id}",
    )
    db.commit()
    db.refresh(case)
    return _case_out(db, case)


@router.get("", response_model=CaseList)
def list_cases(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    cases = db.scalars(select(Case).where(Case.owner_id == user.id).order_by(Case.created_at.desc())).all()
    return {"items": [_case_out(db, case) for case in cases], "total": len(cases)}


@router.get("/{case_id}", response_model=CaseOut)
def get_case(case_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return _case_out(db, _get_owned_case(db, case_id, user))


@router.patch("/{case_id}", response_model=CaseOut)
def update_case(
    case_id: int,
    request: CaseUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    case = _get_owned_case(db, case_id, user)
    _validate(request.status, request.priority)
    changes: list[str] = []
    for field in ("title", "case_type", "status", "priority", "description", "deadline"):
        value = getattr(request, field)
        if value is not None and value != getattr(case, field):
            setattr(case, field, value)
            if field != "description":
                changes.append(field.replace("_", " "))
    if changes:
        create_notification(
            db,
            user_id=user.id,
            notification_type="case",
            title="Case updated",
            body=f"{case.case_number} · {case.title}: {', '.join(changes)} updated.",
            action_url=f"/cases/{case.id}",
        )
    db.commit()
    db.refresh(case)
    return _case_out(db, case)


@router.delete("/{case_id}", status_code=204)
def delete_case(case_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    case = _get_owned_case(db, case_id, user)
    case_label = f"{case.case_number} · {case.title}"
    for document in db.scalars(select(Document).where(Document.case_id == case.id)):
        document.case_id = None
    db.delete(case)
    create_notification(
        db,
        user_id=user.id,
        notification_type="case",
        title="Case deleted",
        body=f"{case_label} was removed. Its documents remain in your document library.",
        action_url="/cases",
    )
    db.commit()


@router.get("/{case_id}/timeline", response_model=TimelineResponse)
def case_timeline(case_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    case = _get_owned_case(db, case_id, user)
    documents = db.scalars(select(Document).where(Document.case_id == case.id)).all()
    events = []
    for document in documents:
        for event in extract_events(document.text):
            events.append({**event.__dict__, "document_id": document.id, "document_title": document.title})
    events.sort(key=lambda event: event["date"])
    return {"events": events}


@router.get("/{case_id}/similar")
def case_similar_judgments(
    case_id: int,
    top_k: int = Query(default=8, ge=1, le=20),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Automatically search historical Pakistani judgments using the user's case record."""
    case = _get_owned_case(db, case_id, user)
    documents = list(db.scalars(
        select(Document).where(Document.case_id == case.id).order_by(Document.created_at.desc())
    ).all())
    return _run_similar_search(case=case, documents=documents, top_k=top_k)


@router.get("/{case_id}/similar-custom")
def case_similar_judgments_custom(
    case_id: int,
    focus: str = Query(min_length=2, max_length=1600),
    top_k: int = Query(default=8, ge=1, le=20),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Search the same corpus while prioritising user-selected legal/factual filters."""
    case = _get_owned_case(db, case_id, user)
    documents = list(db.scalars(
        select(Document).where(Document.case_id == case.id).order_by(Document.created_at.desc())
    ).all())
    clean_focus = " ".join(focus.split())
    return _run_similar_search(
        case=case,
        documents=documents,
        top_k=top_k,
        focus=clean_focus,
    )


@router.post("/{case_id}/contradictions", response_model=ContradictionsResponse)
def case_contradictions(
    case_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)
):
    case = _get_owned_case(db, case_id, user)
    documents = db.scalars(select(Document).where(Document.case_id == case.id)).all()
    pairs = find_contradictions([(d.id, d.title, d.text) for d in documents])
    return {
        "pairs": pairs,
        "documents_analyzed": len(documents),
        "disclaimer": (
            "Automated contradiction detection is a prototype: it flags clearly "
            "conflicting statements and may miss subtle inconsistencies. Verify "
            "against the original documents."
        ),
    }


@router.get("/{case_id}/documents", response_model=DocumentList)
def case_documents(case_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    case = _get_owned_case(db, case_id, user)
    documents = db.scalars(
        select(Document).where(Document.case_id == case.id).order_by(Document.created_at.desc())
    ).all()
    counts = dict(db.execute(select(Chunk.document_id, func.count()).group_by(Chunk.document_id)).all())
    from app.routers.documents import _meta

    return {
        "items": [_meta(document, counts.get(document.id, 0)) for document in documents],
        "total": len(documents),
    }
