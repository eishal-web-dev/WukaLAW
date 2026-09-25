"""API for explainable Case Pathway Intelligence (phase 1)."""
from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from ai.case_pathway import analyze_case_pathway
from app.auth import get_current_user
from app.db import get_db
from app.models import Document, User
from app.routers.cases import _get_owned_case

router = APIRouter(prefix="/cases", tags=["case-pathway"])


@router.get("/{case_id}/pathway-intelligence")
def pathway_intelligence(
    case_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    # Was a locally-defined ownership check here that only ever allowed
    # case.owner_id == user.id -- meaning a client could never view this
    # for their own assigned case (owner_id is the lawyer, not the
    # client). Reuses the real _get_owned_case from cases.py, which
    # already correctly allows both the owning lawyer and the assigned
    # client, same as every other case-scoped endpoint.
    case = _get_owned_case(db, case_id, user)
    documents = db.scalars(
        select(Document).where(Document.case_id == case.id).order_by(Document.created_at.asc())
    ).all()

    result = analyze_case_pathway(
        case_type=case.case_type,
        # The title often contains the clearest issue label (for example
        # "Haq meher case"), so it must participate in issue detection.
        description="\n".join(part for part in (case.title, case.description) if part),
        documents=[{"title": document.title, "text": document.text or ""} for document in documents],
    )
    if result["current_stage"]["key"] == "unknown" and case.status in {
        "Active", "Review", "Currently Going On",
    }:
        result["current_stage"] = {
            "key": "ongoing_unconfirmed",
            "label": "Currently Going On — exact court stage needs confirmation",
            "progress": 0,
            "evidence_terms": [f"case status: {case.status}"],
        }
        result["next_generic_stage"] = {
            "key": "confirm_latest_order",
            "label": "Check the latest court order and next hearing",
        }
        result["stage_confidence"] = "moderate"
        result["warnings"] = [
            warning for warning in result["warnings"]
            if not warning.startswith("No reliable procedural-stage phrase")
        ]
        result["warnings"].append(
            "The case is marked as ongoing, but the precise court stage must be confirmed from the latest order."
        )
    result["source_case"] = {
        "id": case.id,
        "case_number": case.case_number,
        "title": case.title,
        "case_type": case.case_type,
        "status": case.status,
    }
    return result
