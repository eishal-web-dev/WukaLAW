from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ai.analysis.contradictions import find_contradictions
from ai.similar_cases import SimilarCaseRequest
from ai.timeline.extract import extract_events
from app.auth import get_current_user
from app.db import get_db
from app.models import Case, CaseTimelineEntry, Chunk, Document, User
from app.schemas import (
    CaseCreate,
    CaseList,
    CaseOut,
    CaseRequestCreate,
    CaseUpdate,
    ContradictionsResponse,
    DocumentList,
    TimelineEntryCreate,
    TimelineEntryOut,
    TimelineEntryUpdate,
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
    """A case is accessible to the lawyer who owns it, the client it is
    assigned to, or -- for a still-unclaimed client case request -- any
    lawyer, so they can review it before deciding whether to claim it.
    Any other caller (including a different client) gets a 404, not a
    403 -- this avoids leaking whether a given case ID even exists to
    someone who has no business knowing that."""
    case = db.get(Case, case_id)
    if case is None:
        raise HTTPException(status_code=404, detail="Case not found.")
    if case.owner_id == user.id:
        return case
    if user.role == "client" and case.client_id == user.id:
        return case
    if user.role != "client" and case.owner_id is None:
        return case
    raise HTTPException(status_code=404, detail="Case not found.")


def _case_out(db: Session, case: Case) -> dict:
    docs = db.scalar(select(func.count()).where(Document.case_id == case.id)) or 0
    owner = db.get(User, case.owner_id) if case.owner_id is not None else None
    client = db.get(User, case.client_id) if case.client_id else None
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
        "client_id": case.client_id,
        "client_name": client.name if client else None,
        "lawyer_name": owner.name if owner else None,
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
    if user.role == "client":
        cases = db.scalars(select(Case).where(Case.client_id == user.id).order_by(Case.created_at.desc())).all()
    else:
        # A lawyer sees cases they own, plus any still-unclaimed client case
        # requests -- these show up so any lawyer can review and claim one,
        # same idea as a shared intake queue.
        cases = db.scalars(
            select(Case)
            .where((Case.owner_id == user.id) | (Case.owner_id.is_(None)))
            .order_by(Case.created_at.desc())
        ).all()
    return {"items": [_case_out(db, case) for case in cases], "total": len(cases)}


@router.post("/request", response_model=CaseOut, status_code=201)
def request_case(
    request: CaseRequestCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """A client submits a request for a new case. It's created with no
    lawyer assigned yet (owner_id=None) and status 'Review' -- any lawyer
    can see it in their case list and claim it (POST /cases/{id}/claim),
    at which point they become its owner and can edit it normally."""
    if user.role != "client":
        raise HTTPException(status_code=403, detail="Only clients can request a new case.")
    year = __import__("datetime").date.today().year
    count = db.scalar(select(func.count()).where(Case.client_id == user.id)) or 0
    case = Case(
        owner_id=None,
        client_id=user.id,
        case_number=f"WL-{year}-{count + 1:03d}",
        title=request.title.strip(),
        case_type=request.case_type.strip(),
        status="Review",
        priority="Medium",
        description=request.description.strip(),
    )
    db.add(case)
    db.commit()
    db.refresh(case)
    return _case_out(db, case)


@router.post("/{case_id}/claim", response_model=CaseOut)
def claim_case(case_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """A lawyer claims an unassigned client case request, becoming its
    owner. Fails if it's already claimed by someone else -- first to
    claim wins, avoiding two lawyers both thinking they own the same
    request."""
    if user.role == "client":
        raise HTTPException(status_code=403, detail="Clients cannot claim cases.")
    case = db.get(Case, case_id)
    if case is None:
        raise HTTPException(status_code=404, detail="Case not found.")
    if case.owner_id is not None:
        raise HTTPException(status_code=409, detail="This case has already been claimed by another lawyer.")
    case.owner_id = user.id
    db.commit()
    db.refresh(case)
    if case.client_id:
        create_notification(
            db,
            user_id=case.client_id,
            notification_type="case",
            title="A lawyer has taken your case",
            body=f"{case.case_number} · {case.title} has been assigned to a lawyer.",
            action_url=f"/client/cases/{case.id}",
        )
        db.commit()
    return _case_out(db, case)


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
    if user.role == "client":
        raise HTTPException(status_code=403, detail="Clients cannot modify case details.")
    _validate(request.status, request.priority)
    changes: list[str] = []
    for field in ("title", "case_type", "status", "priority", "description", "deadline"):
        value = getattr(request, field)
        if value is not None and value != getattr(case, field):
            setattr(case, field, value)
            if field != "description":
                changes.append(field.replace("_", " "))
    if request.client_id is not None and request.client_id != case.client_id:
        client = db.get(User, request.client_id)
        if client is None or client.role != "client":
            raise HTTPException(status_code=422, detail="client_id must reference an existing client account.")
        case.client_id = request.client_id
        changes.append("assigned client")
    if changes:
        create_notification(
            db,
            user_id=user.id,
            notification_type="case",
            title="Case updated",
            body=f"{case.case_number} · {case.title}: {', '.join(changes)} updated.",
            action_url=f"/cases/{case.id}",
        )
        if case.client_id:
            create_notification(
                db,
                user_id=case.client_id,
                notification_type="case",
                title="Your case was updated",
                body=f"{case.case_number} · {case.title}: {', '.join(changes)} updated.",
                action_url=f"/client/cases/{case.id}",
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


def _entry_out(entry: CaseTimelineEntry) -> dict:
    return {
        "id": entry.id,
        "case_id": entry.case_id,
        "date": entry.date,
        "title": entry.title,
        "source": entry.source,
        "created_at": entry.created_at,
    }


@router.get("/{case_id}/timeline-entries", response_model=list[TimelineEntryOut])
def list_timeline_entries(case_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Real, persisted timeline entries (custom or guided-question answers)
    for a case -- distinct from the read-only events extracted live from
    document text by GET /{case_id}/timeline. These are actual database
    rows a user added or edited themselves."""
    case = _get_owned_case(db, case_id, user)
    entries = db.scalars(
        select(CaseTimelineEntry).where(CaseTimelineEntry.case_id == case.id).order_by(CaseTimelineEntry.date)
    ).all()
    return [_entry_out(e) for e in entries]


@router.post("/{case_id}/timeline-entries", response_model=TimelineEntryOut, status_code=201)
def create_timeline_entry(
    case_id: int,
    request: TimelineEntryCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    case = _get_owned_case(db, case_id, user)
    if request.source not in ("custom", "guided"):
        raise HTTPException(status_code=422, detail="source must be 'custom' or 'guided'.")
    entry = CaseTimelineEntry(
        case_id=case.id,
        created_by_id=user.id,
        date=request.date.strip(),
        title=request.title.strip(),
        source=request.source,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return _entry_out(entry)


def _get_owned_entry(db: Session, case_id: int, entry_id: int, user: User) -> CaseTimelineEntry:
    """A timeline entry is only editable/deletable within a case the
    caller can already access -- reuses the same case-level ownership
    check as everything else, rather than trusting entry_id alone."""
    _get_owned_case(db, case_id, user)
    entry = db.get(CaseTimelineEntry, entry_id)
    if entry is None or entry.case_id != case_id:
        raise HTTPException(status_code=404, detail="Timeline entry not found.")
    return entry


@router.patch("/{case_id}/timeline-entries/{entry_id}", response_model=TimelineEntryOut)
def update_timeline_entry(
    case_id: int,
    entry_id: int,
    request: TimelineEntryUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    entry = _get_owned_entry(db, case_id, entry_id, user)
    if request.date is not None:
        entry.date = request.date.strip()
    if request.title is not None:
        entry.title = request.title.strip()
    db.commit()
    db.refresh(entry)
    return _entry_out(entry)


@router.delete("/{case_id}/timeline-entries/{entry_id}", status_code=204)
def delete_timeline_entry(
    case_id: int,
    entry_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    entry = _get_owned_entry(db, case_id, entry_id, user)
    db.delete(entry)
    db.commit()
    return None


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


@router.get("/{case_id}/prediction")
def case_prediction(case_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Court-outcome prediction contract for a case.

    There is no prediction engine implemented anywhere in this codebase --
    no model, no training data, no scoring logic. This endpoint exists so
    the frontend has a real, honest contract to call rather than showing a
    fabricated percentage: available is always false right now, and the
    frontend must render that as 'Not generated', never a fake number.
    When a real prediction engine is built, this is the endpoint it should
    populate -- the shape (available, generated_at, probability, factors,
    disclaimer) is what a real result would look like.
    """
    _get_owned_case(db, case_id, user)  # enforces the same ownership/visibility rules
    return {
        "available": False,
        "generated_at": None,
        "probability": None,
        "factors": [],
        "disclaimer": (
            "Court outcome prediction has not been generated for this case. "
            "This feature estimates a rough likelihood based on case documents "
            "and is not legal advice -- when available, always treat it as one "
            "input among many, not a determination of how your case will go."
        ),
    }
