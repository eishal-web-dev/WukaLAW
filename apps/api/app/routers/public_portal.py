from __future__ import annotations

from datetime import datetime, timezone
from email.message import EmailMessage
import smtplib

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.config import settings
from app.db import get_db
from app.models import ContactSubmission, ConsultationRequest, User
from app.schemas import (
    ConsultationRequestCreate,
    ConsultationRequestOut,
    ContactSubmissionCreate,
    ContactSubmissionOut,
    LawyerProfileUpdate,
    PublicLawyerOut,
)
from app.services.notification_service import create_notification

router = APIRouter(prefix="/public", tags=["public"])


def _lawyer_out(user: User) -> dict:
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "profile_image": user.profile_image,
        "lawyer_title": user.lawyer_title or "Lawyer",
        "specialization": user.specialization or "General Practice",
        "city": user.city or "",
        "years_experience": user.years_experience or 0,
        "consultation_fee": user.consultation_fee or 0,
        "lawyer_bio": user.lawyer_bio or "",
        "accepting_consultations": bool(user.accepting_consultations),
    }


def _send_email(subject: str, body: str, reply_to: str, recipient: str) -> bool:
    if not settings.smtp_host or not settings.smtp_username or not settings.smtp_password:
        return False
    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = settings.smtp_sender_email or settings.smtp_username
    message["To"] = recipient
    message["Reply-To"] = reply_to
    message.set_content(body)
    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=20) as smtp:
            if settings.smtp_use_tls:
                smtp.starttls()
            smtp.login(settings.smtp_username, settings.smtp_password)
            smtp.send_message(message)
        return True
    except (OSError, smtplib.SMTPException):
        return False


@router.get("/lawyers", response_model=list[PublicLawyerOut])
def list_public_lawyers(db: Session = Depends(get_db)):
    lawyers = db.scalars(
        select(User).where(User.role == "lawyer").order_by(User.name)
    ).all()
    return [_lawyer_out(user) for user in lawyers]


@router.get("/lawyers/{lawyer_id}", response_model=PublicLawyerOut)
def get_public_lawyer(lawyer_id: int, db: Session = Depends(get_db)):
    lawyer = db.scalar(select(User).where(User.id == lawyer_id, User.role == "lawyer"))
    if lawyer is None:
        raise HTTPException(status_code=404, detail="Lawyer profile not found.")
    return _lawyer_out(lawyer)


@router.put("/lawyer-profile", response_model=PublicLawyerOut)
def update_lawyer_profile(
    payload: LawyerProfileUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if user.role != "lawyer":
        raise HTTPException(status_code=403, detail="Only lawyers can publish a lawyer profile.")
    image = payload.profile_image
    if image and not image.startswith("data:image/"):
        raise HTTPException(status_code=422, detail="Profile photo must be an uploaded image.")
    for key, value in payload.model_dump().items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return _lawyer_out(user)


@router.post("/contact", response_model=ContactSubmissionOut, status_code=201)
def submit_contact(payload: ContactSubmissionCreate, db: Session = Depends(get_db)):
    item = ContactSubmission(
        name=payload.name.strip(),
        email=payload.email.lower().strip(),
        subject=payload.subject.strip(),
        message=payload.message.strip(),
    )
    db.add(item)
    db.flush()
    body = (
        f"New WukaLAW website message\n\n"
        f"Name: {item.name}\nEmail: {item.email}\nSubject: {item.subject}\n\n"
        f"{item.message}\n"
    )
    item.email_delivered = _send_email(
        f"WukaLAW contact: {item.subject}",
        body,
        item.email,
        settings.contact_recipient_email,
    )
    db.commit()
    db.refresh(item)
    return {"id": item.id, "received": True, "email_delivered": item.email_delivered}


@router.post("/consultations", response_model=ConsultationRequestOut, status_code=201)
def request_consultation(payload: ConsultationRequestCreate, db: Session = Depends(get_db)):
    lawyer = db.scalar(select(User).where(User.id == payload.lawyer_id, User.role == "lawyer"))
    if lawyer is None:
        raise HTTPException(status_code=404, detail="Lawyer profile not found.")
    if not lawyer.accepting_consultations:
        raise HTTPException(status_code=409, detail="This lawyer is not currently accepting consultation requests.")
    requested_at = payload.requested_at
    if requested_at.tzinfo is None:
        requested_at = requested_at.replace(tzinfo=timezone.utc)
    if requested_at <= datetime.now(timezone.utc):
        raise HTTPException(status_code=422, detail="Choose a future consultation time.")
    item = ConsultationRequest(
        lawyer_id=lawyer.id,
        client_name=payload.client_name.strip(),
        client_email=payload.client_email.lower().strip(),
        client_phone=payload.client_phone.strip(),
        requested_at=requested_at,
        notes=payload.notes.strip(),
    )
    db.add(item)
    db.flush()
    create_notification(
        db,
        user_id=lawyer.id,
        notification_type="case",
        title="New consultation request",
        body=f"{item.client_name} requested a consultation for {requested_at.isoformat()}.",
        action_url="/notifications",
    )
    body = (
        f"New WukaLAW consultation request\n\n"
        f"Client: {item.client_name}\nEmail: {item.client_email}\n"
        f"Phone: {item.client_phone or 'Not provided'}\n"
        f"Requested time: {requested_at.isoformat()}\n\n"
        f"Notes: {item.notes or 'None'}\n"
    )
    _send_email(
        "New WukaLAW consultation request",
        body,
        item.client_email,
        lawyer.email,
    )
    db.commit()
    db.refresh(item)
    return item
