"""Explicit Pakistan jurisdiction detection."""
from __future__ import annotations
import re
from .models import Jurisdiction

_RULES = [
    (Jurisdiction.GILGIT_BALTISTAN, ("gilgit baltistan", "gilgit-baltistan", "gb")),
    (Jurisdiction.BALOCHISTAN, ("balochistan", "quetta")),
    (Jurisdiction.PUNJAB, ("punjab", "lahore", "rawalpindi", "multan", "faisalabad")),
    (Jurisdiction.SINDH, ("sindh", "karachi", "hyderabad")),
    (Jurisdiction.KPK, ("kpk", "kp", "khyber pakhtunkhwa", "peshawar")),
    (Jurisdiction.ICT, ("ict", "islamabad capital territory", "islamabad")),
    (Jurisdiction.AJK, ("ajk", "azad jammu and kashmir", "azad kashmir")),
    (Jurisdiction.PAKISTAN, ("pakistan", "federal")),
]


def detect_jurisdiction(text: str) -> Jurisdiction:
    lowered = text.casefold()
    for jurisdiction, terms in _RULES:
        if any(re.search(r"\b" + re.escape(term) + r"\b", lowered) for term in terms):
            return jurisdiction
    return Jurisdiction.UNKNOWN
