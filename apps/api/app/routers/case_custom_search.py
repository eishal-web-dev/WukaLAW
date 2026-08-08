"""Focused custom precedent search over WukaLAW's indexed Pakistani judgment corpus.

This endpoint uses the same deterministic retrieval/ranking pipeline as automatic
Similar Cases. It does not call an LLM. User-selected focus tags are appended to
the retrieval seed so Qdrant/embeddings search for the requested fact pattern.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from ai.similar_cases import SimilarCaseRequest
from app.auth import get_current_user
from app.db import get_db
from app.models import Case, Document, User
from app.routers.cases import _similar_case_seed

router = APIRouter(prefix="/cases", tags=["case-custom-search"])


def _owned_case(db: Session, case_id: int, user: User) -> Case:
    case = db.get(Case, case_id)
    if case is None or case.owner_id != user.id:
        raise HTTPException(status_code=404, detail="Case not found.")
    return case


@router.get("/{case_id}/similar-custom")
def case_similar_custom(
    case_id: int,
    focus: str = Query(min_length=2, max_length=1200),
    top_k: int = Query(default=8, ge=1, le=20),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Search precedents using explicit user-selected legal/factual focus tags."""
    case = _owned_case(db, case_id, user)
    documents = db.scalars(
        select(Document).where(Document.case_id == case.id).order_by(Document.created_at.desc())
    ).all()

    situation = (
        _similar_case_seed(case, list(documents))
        + "\nUser-selected custom precedent focus: "
        + focus.strip()
    )

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
        "search_mode": "custom",
        "focus": focus.strip(),
    }
    return result
