"""Platform admin endpoints. Every route here requires role == 'admin'.

Only ``admin@gmail.com`` can pass this gate. The account is provisioned from
the private ``ADMIN_BOOTSTRAP_PASSWORD`` server environment variable; there
is no public or self-service admin registration.
"""

import os

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.auth import require_admin
from app.config import settings
from app.db import engine, get_db
from app.models import BillingPlan, Case, Chunk, CmsPost, Document, SupportTicket, User
from app.schemas import (
    AdminActivityOut,
    AdminCaseOut,
    AdminDocumentOut,
    AdminRoleUpdate,
    AdminStatsOut,
    AdminSystemOut,
    AdminUserOut,
    BillingPlanOut,
    BillingPlanWrite,
    CmsPostOut,
    CmsPostWrite,
    SupportTicketOut,
    SupportTicketWrite,
)

router = APIRouter(prefix="/admin", tags=["admin"])


def _save(db: Session, item, payload):
    for key, value in payload.model_dump().items():
        setattr(item, key, value)
    db.add(item); db.commit(); db.refresh(item)
    return item


@router.get("/billing-plans", response_model=list[BillingPlanOut])
def list_billing_plans(db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    return db.scalars(select(BillingPlan).order_by(BillingPlan.created_at.desc())).all()


@router.post("/billing-plans", response_model=BillingPlanOut, status_code=201)
def create_billing_plan(payload: BillingPlanWrite, db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    if db.scalar(select(BillingPlan).where(func.lower(BillingPlan.name) == payload.name.casefold())):
        raise HTTPException(status_code=409, detail="A plan with this name already exists.")
    return _save(db, BillingPlan(), payload)


@router.put("/billing-plans/{item_id}", response_model=BillingPlanOut)
def update_billing_plan(item_id: int, payload: BillingPlanWrite, db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    item = db.get(BillingPlan, item_id)
    if item is None: raise HTTPException(status_code=404, detail="Billing plan not found.")
    return _save(db, item, payload)


@router.get("/support-tickets", response_model=list[SupportTicketOut])
def list_support_tickets(db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    return db.scalars(select(SupportTicket).order_by(SupportTicket.created_at.desc())).all()


@router.post("/support-tickets", response_model=SupportTicketOut, status_code=201)
def create_support_ticket(payload: SupportTicketWrite, db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    return _save(db, SupportTicket(), payload)


@router.put("/support-tickets/{item_id}", response_model=SupportTicketOut)
def update_support_ticket(item_id: int, payload: SupportTicketWrite, db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    item = db.get(SupportTicket, item_id)
    if item is None: raise HTTPException(status_code=404, detail="Support ticket not found.")
    return _save(db, item, payload)


@router.get("/cms-posts", response_model=list[CmsPostOut])
def list_cms_posts(db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    return db.scalars(select(CmsPost).order_by(CmsPost.updated_at.desc())).all()


@router.post("/cms-posts", response_model=CmsPostOut, status_code=201)
def create_cms_post(payload: CmsPostWrite, db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    if db.scalar(select(CmsPost).where(CmsPost.slug == payload.slug)):
        raise HTTPException(status_code=409, detail="This post slug is already in use.")
    return _save(db, CmsPost(), payload)


@router.put("/cms-posts/{item_id}", response_model=CmsPostOut)
def update_cms_post(item_id: int, payload: CmsPostWrite, db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    item = db.get(CmsPost, item_id)
    if item is None: raise HTTPException(status_code=404, detail="CMS post not found.")
    return _save(db, item, payload)


@router.get("/stats", response_model=AdminStatsOut)
def get_stats(db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    total_users = db.scalar(select(func.count()).select_from(User)) or 0
    total_cases = db.scalar(select(func.count()).select_from(Case)) or 0
    total_documents = db.scalar(select(func.count()).select_from(Document)) or 0
    active_cases = db.scalar(select(func.count()).select_from(Case).where(Case.status == "Active")) or 0
    return {
        "total_users": total_users,
        "total_cases": total_cases,
        "total_documents": total_documents,
        "active_cases": active_cases,
    }


@router.get("/users", response_model=list[AdminUserOut])
def list_users(db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    users = db.scalars(select(User).order_by(User.created_at.desc())).all()
    result = []
    for u in users:
        case_count = db.scalar(select(func.count()).select_from(Case).where(Case.owner_id == u.id)) or 0
        doc_count = db.scalar(select(func.count()).select_from(Document).where(Document.owner_id == u.id)) or 0
        result.append({
            "id": u.id,
            "email": u.email,
            "name": u.name,
            "role": u.role,
            "created_at": u.created_at.isoformat(),
            "case_count": case_count,
            "document_count": doc_count,
        })
    return result


@router.patch("/users/{user_id}/role", response_model=AdminUserOut)
def update_user_role(
    user_id: int,
    request: AdminRoleUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found.")
    if user.id == admin.id or user.role == "admin":
        raise HTTPException(status_code=422, detail="The protected administrator role cannot be changed here.")
    user.role = request.role
    db.commit()
    db.refresh(user)
    case_count = db.scalar(select(func.count()).select_from(Case).where(Case.owner_id == user.id)) or 0
    doc_count = db.scalar(select(func.count()).select_from(Document).where(Document.owner_id == user.id)) or 0
    return {
        "id": user.id, "email": user.email, "name": user.name, "role": user.role,
        "created_at": user.created_at.isoformat(), "case_count": case_count, "document_count": doc_count,
    }


@router.get("/cases", response_model=list[AdminCaseOut])
def list_all_cases(db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    cases = db.scalars(select(Case).order_by(Case.created_at.desc())).all()
    result = []
    for case in cases:
        lawyer = db.get(User, case.owner_id) if case.owner_id else None
        client = db.get(User, case.client_id) if case.client_id else None
        document_count = db.scalar(select(func.count()).select_from(Document).where(Document.case_id == case.id)) or 0
        result.append({
            "id": case.id, "case_number": case.case_number, "title": case.title,
            "case_type": case.case_type, "status": case.status, "priority": case.priority,
            "lawyer_name": lawyer.name if lawyer else None, "client_name": client.name if client else None,
            "document_count": document_count, "created_at": case.created_at,
        })
    return result


@router.get("/documents", response_model=list[AdminDocumentOut])
def list_all_documents(db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    documents = db.scalars(select(Document).order_by(Document.created_at.desc()).limit(250)).all()
    result = []
    for document in documents:
        owner = db.get(User, document.owner_id)
        case = db.get(Case, document.case_id) if document.case_id else None
        result.append({
            "id": document.id, "title": document.title, "filename": document.filename,
            "owner_name": owner.name if owner else "Unknown user",
            "case_number": case.case_number if case else None, "size_bytes": document.size_bytes,
            "ocr_used": document.ocr_used, "has_summary": document.summary is not None,
            "created_at": document.created_at,
        })
    return result


@router.get("/activity", response_model=list[AdminActivityOut])
def activity(db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    events: list[dict] = []
    for user in db.scalars(select(User).order_by(User.created_at.desc()).limit(20)).all():
        events.append({"id": f"user-{user.id}", "kind": "user", "title": "Account created", "detail": f"{user.name} joined as {user.role}.", "created_at": user.created_at})
    for case in db.scalars(select(Case).order_by(Case.created_at.desc()).limit(20)).all():
        events.append({"id": f"case-{case.id}", "kind": "case", "title": "Case created", "detail": f"{case.case_number} · {case.title}", "created_at": case.created_at})
    for document in db.scalars(select(Document).order_by(Document.created_at.desc()).limit(20)).all():
        events.append({"id": f"document-{document.id}", "kind": "document", "title": "Document uploaded", "detail": document.title, "created_at": document.created_at})
    return sorted(events, key=lambda item: item["created_at"], reverse=True)[:50]


@router.get("/system", response_model=AdminSystemOut)
def system_status(db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    ai_provider = "Groq" if bool(os.getenv("GROQ_API_KEY", "").strip()) else "Ollama"
    ai_configured = bool(os.getenv("GROQ_API_KEY", "").strip()) or bool(getattr(settings, "ollama_base_url", ""))
    legal_backend = str(getattr(settings, "legal_retrieval_backend", os.getenv("LEGAL_RETRIEVAL_BACKEND", "local")))
    legal_configured = bool(
        os.getenv("SUPABASE_URL", "").strip() and os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip()
    ) or bool(os.getenv("QDRANT_URL", "").strip()) or bool(os.getenv("QDRANT_LOCAL_PATH", "").strip())
    return {
        "api_status": "healthy",
        "database_backend": engine.url.drivername,
        "storage_backend": "S3" if bool(getattr(settings, "aws_s3_bucket", "")) else "Local storage",
        "ai_provider": ai_provider,
        "ai_configured": ai_configured,
        "embedding_model": str(getattr(settings, "embedding_model", "Not configured")),
        "legal_retrieval_backend": legal_backend,
        "legal_corpus_configured": legal_configured,
        "total_chunks": db.scalar(select(func.count()).select_from(Chunk)) or 0,
        "notifications_enabled_users": db.scalar(select(func.count()).select_from(User).where(User.notifications_enabled.is_(True))) or 0,
        "billing_configured": bool(os.getenv("STRIPE_SECRET_KEY", "").strip() or os.getenv("PADDLE_API_KEY", "").strip()),
        "support_configured": bool(os.getenv("SUPPORT_EMAIL", "").strip()),
        "cms_configured": bool(os.getenv("CMS_API_URL", "").strip()),
        "backup_configured": bool(os.getenv("BACKUP_BUCKET", "").strip()),
    }
