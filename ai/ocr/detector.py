"""Deterministic OCR detection, language, and quality heuristics."""
import re

_URDU = re.compile(r"[\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff]")
_LATIN = re.compile(r"[A-Za-z]")

def meaningful_ratio(text: str) -> float:
    return 0.0 if not text else sum(c.isalnum() or c.isspace() or c in ".,;:()[]/-'\"" for c in text) / len(text)

def native_page_usable(text: str) -> bool:
    text = " ".join((text or "").split())
    return len(text) >= 40 and meaningful_ratio(text) >= .45

def detect_language(text: str) -> str:
    urdu, latin = bool(_URDU.search(text or "")), bool(_LATIN.search(text or ""))
    return "eng+urd" if urdu and latin else "urd" if urdu else "eng" if latin else "unknown"

def quality_status(text: str, confidence: float | None, failures: int = 0) -> str:
    ratio = meaningful_ratio(text)
    if not text.strip() or ratio < .35 or confidence is not None and confidence < 35: return "poor"
    if failures or len(text.strip()) < 80 or ratio < .65 or confidence is not None and confidence < 60: return "review_recommended"
    if confidence is not None and confidence >= 88 and ratio >= .85: return "excellent"
    return "good"
