"""AI subscription status and Lemon Squeezy webhook integration."""

import hashlib
import hmac
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.config import settings
from app.db import get_db
from app.models import User

router = APIRouter(prefix="/billing", tags=["billing"])


def _checkout_url(user: User) -> str | None:
    if not settings.lemon_squeezy_checkout_url:
        return None
    parts = urlsplit(settings.lemon_squeezy_checkout_url)
    query = dict(parse_qsl(parts.query, keep_blank_values=True))
    query["checkout[custom][user_id]"] = str(user.id)
    query["checkout[email]"] = user.email
    return urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(query), parts.fragment))


@router.get("/subscription")
def subscription(user: User = Depends(get_current_user)):
    limit = settings.ai_free_token_limit
    return {
        "status": user.subscription_status,
        "ai_tokens_used": user.ai_tokens_used,
        "free_token_limit": limit,
        "free_tokens_remaining": max(0, limit - user.ai_tokens_used),
        "monthly_price": 1500,
        "currency": "PKR",
        "checkout_url": _checkout_url(user),
    }


@router.post("/lemon-squeezy/webhook")
async def lemon_squeezy_webhook(request: Request, db: Session = Depends(get_db)):
    secret = settings.lemon_squeezy_webhook_secret.encode()
    if not secret:
        raise HTTPException(status_code=503, detail="Lemon Squeezy webhook is not configured.")
    body = await request.body()
    signature = request.headers.get("X-Signature", "")
    expected = hmac.new(secret, body, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(signature, expected):
        raise HTTPException(status_code=401, detail="Invalid webhook signature.")
    payload = await request.json()
    event = payload.get("meta", {}).get("event_name", "")
    custom = payload.get("meta", {}).get("custom_data", {}) or {}
    user_id = custom.get("user_id")
    user = db.get(User, int(user_id)) if str(user_id).isdigit() else None
    if user is None:
        return {"received": True}
    attributes = payload.get("data", {}).get("attributes", {}) or {}
    external_status = str(attributes.get("status", ""))
    if event in {"subscription_created", "subscription_updated", "subscription_resumed"}:
        user.subscription_status = "active" if external_status in {"active", "on_trial"} else external_status or "active"
        user.lemon_subscription_id = str(payload.get("data", {}).get("id", "")) or None
    elif event in {"subscription_cancelled", "subscription_expired"}:
        user.subscription_status = "cancelled"
    db.commit()
    return {"received": True}
