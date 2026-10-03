from datetime import datetime, timezone
import logging
from math import sqrt

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ai.analysis.contradictions import find_contradictions
from ai.similar_cases import SimilarCaseRequest
from ai.timeline.extract import extract_events
from app.auth import get_current_user
from app.db import get_db
from app.models import Case, CaseEvent, Chunk, Document, User
from app.schemas import (
    CaseCreate,
    CaseList,
    CaseOut,
    CaseRequestCreate,
    CaseUpdate,
    CaseEventCreate,
    CaseEventUpdate,
    ContradictionsResponse,
    DocumentList,
    TimelineResponse,
)
from app.services.case_intelligence_service import (
    build_case_pathway_guidance,
    build_case_intelligence_profile,
    render_case_intelligence_profile,
)
from app.services.notification_service import create_notification

router = APIRouter(prefix="/cases", tags=["cases"])
logger = logging.getLogger(__name__)

ALLOWED_STATUS = {
    # Current, user-friendly case stages.
    "Started",
    "Currently Going On",
    "Case Complete",
    # Legacy values remain valid so existing case records can still be edited.
    "Active",
    "Review",
    "On Hold",
    "Closed",
}
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


MIN_OUTCOME_SAMPLE = 5


def _wilson_interval(successes: int, total: int, z: float = 1.96) -> tuple[int, int] | None:
    """Return a rounded 95% Wilson interval for a real binomial sample."""
    if total < 1:
        return None
    proportion = successes / total
    denominator = 1 + (z * z / total)
    centre = (proportion + (z * z / (2 * total))) / denominator
    margin = (
        z
        * sqrt((proportion * (1 - proportion) / total) + (z * z / (4 * total * total)))
        / denominator
    )
    return round(max(0, centre - margin) * 100), round(min(1, centre + margin) * 100)


def _historical_outcome_summary(results: list[dict]) -> dict:
    """Summarise explicit dispositions without claiming a personal win probability."""
    buckets = {"favourable": 0, "unfavourable": 0, "partial_or_mixed": 0, "unclear": 0}
    seen: set[str] = set()
    favourable_rows: list[dict] = []
    for row in results:
        document_id = str(row.get("document_id") or row.get("canonical_chunk_id") or "")
        if document_id and document_id in seen:
            continue
        if document_id:
            seen.add(document_id)
        outcome = str(row.get("explicit_outcome_phrase") or "").casefold()
        if not outcome:
            buckets["unclear"] += 1
        elif any(term in outcome for term in ("partly allowed", "partially allowed", "partly decreed", "modified")):
            buckets["partial_or_mixed"] += 1
        elif any(term in outcome for term in (
            "dismissed", "rejected", "refused", "declined", "disallowed",
            "upheld", "maintained", "affirmed",
        )):
            buckets["unfavourable"] += 1
        elif any(term in outcome for term in (
            "allowed", "accepted", "decreed", "granted", "set aside",
        )):
            buckets["favourable"] += 1
            favourable_rows.append(row)
        else:
            buckets["unclear"] += 1

    known = buckets["favourable"] + buckets["unfavourable"] + buckets["partial_or_mixed"]
    signals: list[str] = []
    for row in favourable_rows:
        for factor in row.get("matching_factors") or []:
            label, value = str(factor.get("factor") or ""), str(factor.get("value") or "")
            if label == "same_specific_issue" and value:
                signals.append(f"The same specific legal issue: {value.replace('_', ' ')}")
            elif label == "shared_section" and value:
                signals.append(f"A shared statutory reference: Section {value}")
        for law in (row.get("laws_cited") or [])[:2]:
            signals.append(f"Law appearing in a favourable matched judgment: {law}")

    observed_ratio = round((buckets["favourable"] / known) * 100) if known else None
    interval = _wilson_interval(buckets["favourable"], known)
    score_available = known >= MIN_OUTCOME_SAMPLE
    return {
        "matched_cases": len(seen) if seen else len(results),
        "outcomes_available": known,
        **buckets,
        # Never expose a percentage for a tiny sample. Consumers can still
        # show the auditable raw counts below the minimum.
        "favourable_ratio": observed_ratio if score_available else None,
        "score_available": score_available,
        "minimum_sample": MIN_OUTCOME_SAMPLE,
        "confidence_interval_low": interval[0] if interval and score_available else None,
        "confidence_interval_high": interval[1] if interval and score_available else None,
        "successful_case_signals": list(dict.fromkeys(signals))[:6],
        "meaning": (
            "Observed share of outcome-known matched judgments favourable to the plaintiff, petitioner or appellant. "
            "It is a historical benchmark, not this user's probability of winning."
        ),
    }


def _fallback_case_assessment(case: Case, profile: dict, pathway: dict) -> str:
    """Give a useful full assessment even when no generation provider is online."""
    description = (profile.get("client_account") or "").strip()
    verified_count = len(profile.get("verified_documents") or [])
    timeline_count = len(profile.get("timeline") or [])
    evidence_count = len(profile.get("evidence_inventory") or [])
    missing = profile.get("readiness", {}).get("missing_information") or []

    overview = (
        f"This is a {pathway['matter'].lower()} matter recorded as {pathway['case_stage']}. "
        + (f"The saved case account says: {description}" if description else "A detailed case account has not yet been saved.")
    )
    record = (
        f"The current record contains {verified_count} verified searchable document(s), "
        f"{timeline_count} dated timeline update(s), and {evidence_count} additional evidence file(s). "
        "Verified documents can support analysis; timeline statements and inventory-only evidence still need to be checked against originals."
    )
    dispute = (
        "The outcome will depend on which disputed facts are proved, whether the documents are authentic and admissible, "
        "how the opposing party answers the allegations, and what the latest court order requires. The saved record alone "
        "does not establish that the client's account has been accepted by the court."
    )
    gaps = (
        "The main items still needing attention are: " + "; ".join(missing)
        if missing else
        "The basic case record is populated, but counsel should still verify the latest order, disputed facts, originals, and applicable law."
    )
    return "\n\n".join((
        f"Case overview\n{overview}",
        f"What the current record supports\n{record}",
        f"What may affect the outcome\n{dispute}",
        f"What should be strengthened\n{gaps}",
    ))


def _case_preparation_score(profile: dict) -> dict:
    """Score record completeness, never merits or probability of success."""
    description_ready = bool((profile.get("client_account") or "").strip())
    documents = profile.get("verified_documents") or []
    timeline = profile.get("timeline") or []
    evidence = profile.get("evidence_inventory") or []
    pending_ocr = profile.get("documents_pending_ocr_review") or []
    deadline_ready = bool(profile.get("case", {}).get("deadline"))
    linked_events = sum(1 for event in timeline if event.get("linked_document_id"))

    components = [
        {
            "key": "case_account",
            "label": "Clear case account",
            "earned": 15 if description_ready else 0,
            "maximum": 15,
            "action": "Add a clear account of what happened, what is disputed, and the relief you want.",
        },
        {
            "key": "verified_documents",
            "label": "Verified searchable documents",
            "earned": min(25, round((len(documents) / 4) * 25)),
            "maximum": 25,
            "action": "Upload and verify the key pleadings, orders, agreements, receipts, and official records.",
        },
        {
            "key": "timeline",
            "label": "Dated chronology",
            "earned": min(15, round((len(timeline) / 3) * 15)),
            "maximum": 15,
            "action": "Record at least three important dated events in the case timeline.",
        },
        {
            "key": "linked_proof",
            "label": "Timeline linked to proof",
            "earned": min(15, round((linked_events / 3) * 15)),
            "maximum": 15,
            "action": "Link each important timeline event to the document that supports it.",
        },
        {
            "key": "evidence_inventory",
            "label": "Evidence inventory",
            "earned": min(10, round((len(evidence) / 5) * 10)),
            "maximum": 10,
            "action": "Add the most important evidence files and preserve their originals and dates.",
        },
        {
            "key": "deadline",
            "label": "Next hearing or deadline",
            "earned": 10 if deadline_ready else 0,
            "maximum": 10,
            "action": "Record the next hearing, filing date, or deadline from the latest court order.",
        },
        {
            "key": "ocr_review",
            "label": "OCR review complete",
            "earned": 10 if not pending_ocr else 0,
            "maximum": 10,
            "action": "Review and verify all OCR text before relying on scanned documents.",
        },
    ]
    score = sum(item["earned"] for item in components)
    actions = [
        {
            "label": item["action"],
            "possible_points": item["maximum"] - item["earned"],
            "category": item["label"],
        }
        for item in components
        if item["earned"] < item["maximum"]
    ]
    actions.sort(key=lambda item: item["possible_points"], reverse=True)
    return {
        "score": score,
        "maximum": 100,
        "label": "Case preparation score",
        "level": "Strong record" if score >= 80 else "Developing record" if score >= 50 else "More preparation needed",
        "components": components,
        "priority_actions": actions,
        "meaning": "How complete and review-ready the saved case record is based on information available in wukaLAW.",
        "warning": "This is not a probability of winning. A complete file can still lose, and an incomplete file can still succeed after proper legal preparation.",
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
    corpus_unavailable: str | None = None
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
    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except RuntimeError as exc:
        message = str(exc)
        if any(token in message.lower() for token in ("collection", "corpus", "supabase")):
            corpus_unavailable = message
        else:
            raise HTTPException(status_code=503, detail=f"Similar-case service unavailable: {exc}") from exc
    except Exception as exc:
        if "not found" in str(exc).lower() and "collection" in str(exc).lower():
            corpus_unavailable = str(exc)
        if "connection" in str(exc).lower() or "refused" in str(exc).lower():
            raise HTTPException(status_code=503, detail="Cannot reach the legal corpus. Set QDRANT_LOCAL_PATH to your indexed local collection or start the configured Qdrant server.") from exc
        if corpus_unavailable is None:
            raise

    if corpus_unavailable is not None:
        lowered_error = corpus_unavailable.casefold()
        if "authentication failed" in lowered_error:
            corpus_status = "authentication_failed"
            warning = "The Supabase legal-corpus service-role key was rejected."
        elif "rpc/table was not found" in lowered_error:
            corpus_status = "migration_missing"
            warning = "The Supabase legal-index migration or Data API exposure is unavailable."
        elif "request configuration is invalid" in lowered_error:
            corpus_status = "configuration_invalid"
            warning = "The Supabase URL or service-role key has invalid formatting."
        elif "dns lookup failed" in lowered_error:
            corpus_status = "dns_failed"
            warning = "The Supabase project hostname is not available in public DNS."
        elif "tls verification failed" in lowered_error:
            corpus_status = "tls_failed"
            warning = "The Supabase HTTPS certificate could not be verified on this computer."
        elif "timed out" in lowered_error:
            corpus_status = "connection_timeout"
            warning = "The Supabase HTTPS request timed out."
        elif "credential" in lowered_error or "configuration is incomplete" in lowered_error:
            corpus_status = "configuration_missing"
            warning = "The backend Supabase legal-corpus connection is not fully configured."
        elif "supabase" in lowered_error:
            corpus_status = "connection_failed"
            warning = "The backend could not reach the Supabase Pakistani-judgment index."
        else:
            corpus_status = "index_unavailable"
            warning = "The configured Pakistani-judgment index is unavailable."
        logger.warning("Similar-case corpus unavailable [%s]: %s", corpus_status, corpus_unavailable)
        # Missing infrastructure is not a malformed client case. Return a
        # stable empty state so the pathway remains useful and the UI does not
        # expose Qdrant collection names or configuration instructions.
        result = {
            "normalized_query": situation,
            "total_candidates": 0,
            "results": [],
            "warnings": [warning],
            "processing_time_ms": 0,
            "corpus_available": False,
            "corpus_status": corpus_status,
        }
    else:
        result["corpus_available"] = True

    result["historical_outcomes"] = _historical_outcome_summary(result.get("results") or [])

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
        status="Started",
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
        if request.model_fields_set - {"description"}:
            raise HTTPException(status_code=403, detail="Clients may edit their case description only; a lawyer manages case status and deadlines.")
        if request.description is None:
            raise HTTPException(status_code=422, detail="Provide a case description to update.")
        case.description = request.description.strip()
        db.commit()
        db.refresh(case)
        return _case_out(db, case)
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
    for entry in db.scalars(select(CaseEvent).where(CaseEvent.case_id == case.id)):
        linked = db.get(Document, entry.document_id) if entry.document_id else None
        events.append({"date": entry.event_date, "date_text": entry.event_date, "text": entry.text,
                       "document_id": linked.id if linked and linked.case_id == case.id else None,
                       "document_title": linked.title if linked and linked.case_id == case.id else None,
                       "event_id": entry.id})
    events.sort(key=lambda event: event["date"])
    return {"events": events}


def _event_document(db: Session, case_id: int, document_id: int | None) -> None:
    if document_id is not None:
        document = db.get(Document, document_id)
        if document is None or document.case_id != case_id:
            raise HTTPException(status_code=422, detail="Choose a document from this case.")


@router.post("/{case_id}/events", status_code=201)
def create_case_event(case_id: int, request: CaseEventCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    case = _get_owned_case(db, case_id, user)
    if user.role == "client" and case.client_id != user.id:
        raise HTTPException(status_code=404, detail="Case not found.")
    _event_document(db, case.id, request.document_id)
    entry = CaseEvent(case_id=case.id, author_id=user.id, event_date=request.date.isoformat(),
                      text=request.text.strip(), document_id=request.document_id)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return {"id": entry.id}


@router.put("/{case_id}/events/{event_id}")
def update_case_event(case_id: int, event_id: int, request: CaseEventUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _get_owned_case(db, case_id, user)
    entry = db.get(CaseEvent, event_id)
    if entry is None or entry.case_id != case_id or entry.author_id != user.id:
        raise HTTPException(status_code=404, detail="Event not found.")
    _event_document(db, case_id, request.document_id)
    entry.event_date = request.date.isoformat()
    entry.text = request.text.strip()
    entry.document_id = request.document_id
    db.commit()
    return {"id": entry.id}


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
    """Evidence assessment plus an auditable benchmark from matched judgments."""
    case = _get_owned_case(db, case_id, user)
    profile = build_case_intelligence_profile(db, case)
    pathway = build_case_pathway_guidance(case)
    documents = db.scalars(
        select(Document).where(Document.case_id == case.id).order_by(Document.created_at.desc())
    ).all()
    verified = [
        document for document in documents
        if not document.ocr_used or document.ocr_review_status == "verified"
    ]
    contexts = [
        f"Document: {document.title}\nVerified excerpt: {' '.join((document.text or '').split())[:3000]}"
        for document in verified[:4]
        if (document.text or "").strip()
    ]

    try:
        similar = _run_similar_search(case=case, documents=verified, top_k=20)
    except Exception:
        # The evidence assessment must remain available when the independent
        # precedent service is offline or not configured.
        similar = {
            "corpus_available": False,
            "historical_outcomes": _historical_outcome_summary([]),
        }
    historical_outlook = similar["historical_outcomes"]

    from ai.qa import rag as qa_rag

    generated, model = qa_rag._generate_answer(
        (
            "Write a detailed, client-friendly assessment of this case without giving a win percentage. Use the headings "
            "Case overview, What supports your position, What the other side may dispute, Evidence gaps, Likely next stages, "
            "and What to prepare now. Explain the reasoning rather than copying documents. Distinguish the client's account "
            "from verified material. Do not invent Pakistani law, court orders, facts or outcomes."
        ),
        contexts,
        render_case_intelligence_profile(profile),
        [],
    )

    supporting_factors = []
    if profile["verified_documents"]:
        supporting_factors.append(
            f"{len(profile['verified_documents'])} verified searchable document(s) are available for analysis."
        )
    if profile["timeline"]:
        supporting_factors.append(f"{len(profile['timeline'])} dated timeline update(s) provide chronology.")
    if profile["evidence_inventory"]:
        supporting_factors.append(
            f"{len(profile['evidence_inventory'])} additional evidence file(s) are recorded but their contents are not yet verified."
        )
    if case.deadline:
        supporting_factors.append(f"The next recorded deadline is {case.deadline}.")

    return {
        "available": True,
        "assessment_type": "ai_scenario_analysis" if generated else "procedural_guidance",
        "model": model,
        "assessment": generated or _fallback_case_assessment(case, profile, pathway),
        "generated_at": datetime.now(timezone.utc).isoformat(),
        # Kept null: the historical outcome rate below is not a calibrated
        # personal probability and must not be consumed as one by older UIs.
        "probability": None,
        "historical_outlook": {
            **historical_outlook,
            "corpus_available": similar.get("corpus_available", True),
            "label": "Historical outcome benchmark",
            "method": (
                "Deduplicated Pakistani judgments matched to the saved case description and up to four verified "
                "case documents. Only explicit allowed/granted/decreed and dismissed/rejected dispositions are counted."
            ),
            "warning": (
                "This is not a personal win probability. It does not know the user's procedural side, judicial "
                "discretion, evidence credibility, settlement, later precedent or unrecorded facts."
            ),
        },
        "case_preparation": _case_preparation_score(profile),
        "factors": [],
        "supporting_factors": supporting_factors,
        "missing_information": profile["readiness"]["missing_information"],
        "readiness": profile["readiness"]["ready_for_assisted_analysis"],
        **pathway,
        "disclaimer": (
            "Decision-support only, not legal advice or a court prediction. Any historical percentage is an observed "
            "rate in the displayed matched judgments, not a validated personal probability of winning. Verify the "
            "judgments, law, citations and strategy with a qualified lawyer."
        ),
    }


@router.get("/{case_id}/intelligence-profile")
def case_intelligence_profile(
    case_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Return the labelled, auditable input used for assisted case analysis.

    This is deliberately a profile, not a court-outcome prediction. Ownership
    is enforced before any private case material is assembled.
    """
    case = _get_owned_case(db, case_id, user)
    return build_case_intelligence_profile(db, case)
