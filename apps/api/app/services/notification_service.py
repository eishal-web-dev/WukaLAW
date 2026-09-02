from sqlalchemy.orm import Session

from app.models import Notification, User


ALLOWED_NOTIFICATION_TYPES = {"ai", "case", "system"}


def create_notification(
    db: Session,
    *,
    user_id: int,
    notification_type: str,
    title: str,
    body: str,
    action_url: str | None = None,
) -> Notification | None:
    """Queue a persisted in-app notification when the user has them enabled.

    The caller owns the transaction so the notification can be committed with
    the business event that produced it.
    """
    if notification_type not in ALLOWED_NOTIFICATION_TYPES:
        raise ValueError(f"Unsupported notification type: {notification_type}")

    user = db.get(User, user_id)
    if user is None or not user.notifications_enabled:
        return None

    notification = Notification(
        user_id=user_id,
        type=notification_type,
        title=title.strip(),
        body=body.strip(),
        action_url=action_url,
    )
    db.add(notification)
    return notification
