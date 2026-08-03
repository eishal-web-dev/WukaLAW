"""Unicode-range language detection without external models."""
from __future__ import annotations
import re
from .models import Language

_URDU = re.compile(r"[\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff]")
_LATIN = re.compile(r"[A-Za-z]")


def detect_language(text: str) -> Language:
    if not isinstance(text, str) or not text.strip():
        return Language.UNKNOWN
    urdu = len(_URDU.findall(text))
    latin = len(_LATIN.findall(text))
    if urdu and urdu >= latin:
        return Language.URDU
    if latin:
        return Language.ENGLISH
    return Language.UNKNOWN
