import httpx

from app.config import settings


class EmailNotConfigured(RuntimeError):
    pass


def send_email(*, recipient: str, subject: str, body: str) -> str:
    if not settings.resend_api_key or not settings.email_from:
        raise EmailNotConfigured(
            "Email delivery is not configured. Set RESEND_API_KEY and EMAIL_FROM on the backend."
        )
    response = httpx.post(
        "https://api.resend.com/emails",
        headers={"Authorization": f"Bearer {settings.resend_api_key}"},
        json={"from": settings.email_from, "to": [recipient], "subject": subject, "text": body},
        timeout=15,
    )
    response.raise_for_status()
    message_id = response.json().get("id")
    if not message_id:
        raise RuntimeError("The email provider did not return a delivery identifier.")
    return str(message_id)
