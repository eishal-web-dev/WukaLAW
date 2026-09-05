"""Platform admin endpoints. Every route here requires role == 'admin'.

Only ``admin@gmail.com`` can pass this gate. The account is provisioned from
the private ``ADMIN_BOOTSTRAP_PASSWORD`` server environment variable; there
is no public or self-service admin registration.
"""

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.auth import require_admin
from app.db import get_db
from app.models import Case, Document, User
from app.schemas import AdminStatsOut, AdminUserOut

router = APIRouter(prefix="/admin", tags=["admin"])


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
