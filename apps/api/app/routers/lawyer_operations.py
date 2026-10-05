import httpx

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.db import get_db
from app.models import (
    Case, CaseMessage, CaseStrategy, Document, GeneratedReport,
    LawyerBillingProfile, LawyerTeamMember, User,
)
from app.schemas import (
    BillingProfileOut, BillingProfileWrite, CaseMessageCreate, CaseMessageOut,
    CaseStrategyOut, CaseStrategyWrite, EmailDeliveryOut, TeamMemberCreate,
    TeamMemberEmailCreate, TeamMemberOut,
)
from app.services.email_service import EmailNotConfigured, send_email

router = APIRouter(prefix="/lawyer-operations", tags=["lawyer-operations"])


def _lawyer(user: User) -> None:
    if user.role != "lawyer":
        raise HTTPException(status_code=403, detail="This workspace is available to lawyers only.")


def _owned_case(db: Session, case_id: int, user: User) -> Case:
    _lawyer(user)
    case = db.scalar(select(Case).where(Case.id == case_id, Case.owner_id == user.id))
    if case is None:
        raise HTTPException(status_code=404, detail="Case not found in your workspace.")
    return case


def _message_case(db: Session, case_id: int, user: User) -> Case:
    case = db.get(Case, case_id)
    if case is None:
        raise HTTPException(status_code=404, detail="Case not found.")
    allowed = case.owner_id == user.id or (user.role == "client" and case.client_id == user.id)
    if not allowed:
        raise HTTPException(status_code=404, detail="Case not found.")
    return case


def _strategy_out(item: CaseStrategy | None, case: Case) -> dict:
    return {
        "id": item.id if item else None,
        "case_id": case.id,
        "case_number": case.case_number,
        "case_title": case.title,
        "objective": item.objective if item else "",
        "case_theory": item.case_theory if item else "",
        "strengths": item.strengths if item else [],
        "risks": item.risks if item else [],
        "next_actions": item.next_actions if item else [],
        "updated_at": item.updated_at if item else None,
    }


@router.get("/cases/{case_id}/strategy", response_model=CaseStrategyOut)
def get_strategy(case_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    case = _owned_case(db, case_id, user)
    item = db.scalar(select(CaseStrategy).where(CaseStrategy.case_id == case.id, CaseStrategy.owner_id == user.id))
    return _strategy_out(item, case)


@router.put("/cases/{case_id}/strategy", response_model=CaseStrategyOut)
def save_strategy(payload: CaseStrategyWrite, case_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    case = _owned_case(db, case_id, user)
    item = db.scalar(select(CaseStrategy).where(CaseStrategy.case_id == case.id, CaseStrategy.owner_id == user.id))
    if item is None:
        item = CaseStrategy(owner_id=user.id, case_id=case.id)
        db.add(item)
    for key, value in payload.model_dump().items():
        setattr(item, key, value)
    db.commit(); db.refresh(item)
    return _strategy_out(item, case)


def _message_out(db: Session, item: CaseMessage) -> dict:
    case, sender = db.get(Case, item.case_id), db.get(User, item.sender_id)
    return {
        "id": item.id, "case_id": item.case_id,
        "case_number": case.case_number if case else "—", "case_title": case.title if case else "Deleted case",
        "sender_id": item.sender_id, "sender_name": sender.name if sender else "Unknown user",
        "sender_role": sender.role if sender else "unknown", "body": item.body, "created_at": item.created_at,
    }


@router.get("/messages", response_model=list[CaseMessageOut])
def list_messages(case_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _message_case(db, case_id, user)
    items = db.scalars(select(CaseMessage).where(CaseMessage.case_id == case_id).order_by(CaseMessage.created_at)).all()
    return [_message_out(db, item) for item in items]


@router.post("/messages", response_model=CaseMessageOut, status_code=201)
def send_message(payload: CaseMessageCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _message_case(db, payload.case_id, user)
    body = payload.body.strip()
    if not body:
        raise HTTPException(status_code=422, detail="Message cannot be empty.")
    item = CaseMessage(case_id=payload.case_id, sender_id=user.id, body=body)
    db.add(item); db.commit(); db.refresh(item)
    return _message_out(db, item)


@router.get("/team", response_model=list[TeamMemberOut])
def list_team(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _lawyer(user)
    return db.scalars(select(LawyerTeamMember).where(LawyerTeamMember.owner_id == user.id).order_by(LawyerTeamMember.created_at)).all()


@router.post("/team", response_model=TeamMemberOut, status_code=201)
def add_team_member(payload: TeamMemberCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _lawyer(user)
    duplicate = db.scalar(select(LawyerTeamMember).where(LawyerTeamMember.owner_id == user.id, func.lower(LawyerTeamMember.email) == payload.email.strip().lower()))
    if duplicate:
        raise HTTPException(status_code=409, detail="This email is already in your team directory.")
    item = LawyerTeamMember(owner_id=user.id, **payload.model_dump())
    db.add(item); db.commit(); db.refresh(item)
    return item


@router.delete("/team/{member_id}", status_code=204)
def remove_team_member(member_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _lawyer(user)
    item = db.scalar(select(LawyerTeamMember).where(LawyerTeamMember.id == member_id, LawyerTeamMember.owner_id == user.id))
    if item is None:
        raise HTTPException(status_code=404, detail="Team member not found.")
    db.delete(item); db.commit()
    return Response(status_code=204)


@router.post("/team/{member_id}/email", response_model=EmailDeliveryOut)
def email_team_member(payload: TeamMemberEmailCreate, member_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _lawyer(user)
    item = db.scalar(select(LawyerTeamMember).where(LawyerTeamMember.id == member_id, LawyerTeamMember.owner_id == user.id))
    if item is None:
        raise HTTPException(status_code=404, detail="Team member not found.")
    try:
        provider_message_id = send_email(recipient=item.email, subject=payload.subject.strip(), body=payload.body.strip())
    except EmailNotConfigured as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail="The email provider could not deliver this message.") from exc
    return {"delivered": True, "recipient": item.email, "provider_message_id": provider_message_id}


def _billing_out(db: Session, user: User, item: LawyerBillingProfile | None) -> dict:
    case_ids = select(Case.id).where(Case.owner_id == user.id)
    usage = {
        "cases": db.scalar(select(func.count(Case.id)).where(Case.owner_id == user.id)) or 0,
        "documents": db.scalar(select(func.count(Document.id)).where(Document.case_id.in_(case_ids))) or 0,
        "reports": db.scalar(select(func.count(GeneratedReport.id)).where(GeneratedReport.requested_by_id == user.id)) or 0,
    }
    return {
        "business_name": item.business_name if item else "",
        "currency": item.currency if item else "PKR",
        "hourly_rate": item.hourly_rate if item else 0,
        "invoice_notes": item.invoice_notes if item else "",
        "plan": "Workspace",
        "payment_status": "No payment provider configured",
        "usage": usage,
        "updated_at": item.updated_at if item else None,
    }


@router.get("/billing", response_model=BillingProfileOut)
def get_billing(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _lawyer(user)
    item = db.scalar(select(LawyerBillingProfile).where(LawyerBillingProfile.owner_id == user.id))
    return _billing_out(db, user, item)


@router.put("/billing", response_model=BillingProfileOut)
def save_billing(payload: BillingProfileWrite, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _lawyer(user)
    item = db.scalar(select(LawyerBillingProfile).where(LawyerBillingProfile.owner_id == user.id))
    if item is None:
        item = LawyerBillingProfile(owner_id=user.id)
        db.add(item)
    for key, value in payload.model_dump().items():
        setattr(item, key, value)
    db.commit(); db.refresh(item)
    return _billing_out(db, user, item)
