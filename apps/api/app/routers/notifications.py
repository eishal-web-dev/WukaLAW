from datetime import timezone

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy import func, select, update
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.db import get_db
from app.models import Notification, User, utcnow
from app.schemas import (
    NotificationList,
    NotificationOut,
    NotificationPreferences,
    NotificationPreferencesUpdate,
    NotificationUnreadCount,
)

router = APIRouter(prefix="/notifications", tags=["notifications"])


def _owned_notification(db: Session, notification_id: int, user: User) -> Notification:
    notification = db.get(Notification, notification_id)
    if notification is None or notification.user_id != user.id:
        raise HTTPException(status_code=404, detail="Notification not found.")
    return notification


def _out(notification: Notification) -> dict:
    created_at = notification.created_at
    if created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=timezone.utc)
    return {
        "id": notification.id,
        "type": notification.type,
        "title": notification.title,
        "body": notification.body,
        "action_url": notification.action_url,
        "read": notification.read_at is not None,
        "created_at": created_at,
    }


def _unread_count(db: Session, user_id: int) -> int:
    return db.scalar(
        select(func.count()).where(
            Notification.user_id == user_id,
            Notification.read_at.is_(None),
        )
    ) or 0


@router.get("", response_model=NotificationList)
def list_notifications(
    notification_type: str | None = Query(default=None, alias="type", pattern=r"^(ai|case|system)$"),
    unread_only: bool = False,
    limit: int = Query(default=100, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    filters = [Notification.user_id == user.id]
    if notification_type is not None:
        filters.append(Notification.type == notification_type)
    if unread_only:
        filters.append(Notification.read_at.is_(None))

    total = db.scalar(select(func.count()).select_from(Notification).where(*filters)) or 0
    items = db.scalars(
        select(Notification)
        .where(*filters)
        .order_by(Notification.created_at.desc(), Notification.id.desc())
        .offset(offset)
        .limit(limit)
    ).all()
    return {
        "items": [_out(notification) for notification in items],
        "total": total,
        "unread": _unread_count(db, user.id),
    }


@router.get("/unread-count", response_model=NotificationUnreadCount)
def unread_count(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return {"unread": _unread_count(db, user.id)}


@router.get("/preferences", response_model=NotificationPreferences)
def get_preferences(user: User = Depends(get_current_user)):
    return {"in_app_enabled": user.notifications_enabled}


@router.patch("/preferences", response_model=NotificationPreferences)
def update_preferences(
    request: NotificationPreferencesUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    user.notifications_enabled = request.in_app_enabled
    db.commit()
    return {"in_app_enabled": user.notifications_enabled}


@router.patch("/{notification_id}/read", response_model=NotificationOut)
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    notification = _owned_notification(db, notification_id, user)
    if notification.read_at is None:
        notification.read_at = utcnow()
        db.commit()
        db.refresh(notification)
    return _out(notification)


@router.post("/read-all", response_model=NotificationUnreadCount)
def mark_all_notifications_read(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    db.execute(
        update(Notification)
        .where(Notification.user_id == user.id, Notification.read_at.is_(None))
        .values(read_at=utcnow())
    )
    db.commit()
    return {"unread": 0}


@router.delete("/{notification_id}", status_code=204)
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    notification = _owned_notification(db, notification_id, user)
    db.delete(notification)
    db.commit()
    return Response(status_code=204)
