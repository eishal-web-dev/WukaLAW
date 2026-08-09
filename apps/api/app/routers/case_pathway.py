"""API for explainable Case Pathway Intelligence (phase 1)."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ai.case_pathway import analyze_case_pathway
from app.auth import get_current_user
from app.db import get_db
from app.models import Case, Document, User

router = APIRouter(prefix="/cases", tags=["case-pathway"])


def _owned_case(db: Session, case_id: int, user: User) -> Case:
    case = db.get(Case, case_id)
    if case is None or case.owner_id != user.id:
        raise HTTPException(status_code=404, detail="Case not found.")
    return case


@router.get("/{case_id}/pathway-intelligence")
def pathway_intelligence(
    case_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    case = _owned_case(db, case_id, user)
    documents = db.scalars(
        select(Document).where(Document.case_id == case.id).order_by(Document.created_at.asc())
    ).all()

    result = analyze_case_pathway(
        case_type=case.case_type,
        description=case.description or "",
        documents=[{"title": document.title, "text": document.text or ""} for document in documents],
    )
    result["source_case"] = {
        "id": case.id,
        "case_number": case.case_number,
        "title": case.title,
        "case_type": case.case_type,
        "status": case.status,
    }
    return result
