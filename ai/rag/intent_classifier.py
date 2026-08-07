"""Deterministic legal-query intent classification."""
from __future__ import annotations

import re
from .models import Intent


_RULES: list[tuple[Intent, tuple[str, ...]]] = [
    (Intent.DOCUMENT_GENERATION, (r"\b(draft|write|prepare|generate|create)\b.{0,40}\b(contract|agreement|petition|motion|notice|affidavit|legal document|letter)\b",)),
    (Intent.SIMILAR_CASE, (r"\b(similar|comparable|analogous)\b.{0,25}\b(case|decision|judgment)s?\b", r"\bprecedents?\b")),
    (Intent.DOCUMENT_EXPLANATION, (r"\b(explain|summari[sz]e|interpret)\b.{0,35}\b(this|the|my)\b.{0,20}\b(document|judgment|contract|order|clause)\b",)),
    (Intent.LEGAL_PROCEDURE, (r"\b(how (do|can|should)|procedure|process|steps?|deadline|file|appeal)\b.{0,45}\b(court|claim|case|petition|appeal|complaint|motion)\b",)),
    (Intent.LEGAL_ADVICE, (r"\b(should i|what should i do|advise me|legal advice|do i have a case|can i sue|my rights)\b",)),
    (Intent.LAW_LOOKUP, (r"\b(article|section|statute|act|code|regulation|law)\b",)),
    (Intent.GENERAL_LEGAL, (r"\b(court|judge|legal|law|case|appeal|contract|crime|liability|jurisdiction)\b",)),
]


def classify_intent(question: str) -> Intent:
    text = question.casefold().strip()
    if not text:
        return Intent.UNKNOWN
    for intent, patterns in _RULES:
        if any(re.search(pattern, text, re.IGNORECASE) for pattern in patterns):
            return intent
    return Intent.UNKNOWN
