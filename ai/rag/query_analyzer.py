"""Normalize questions and extract explicit retrieval filters without guessing."""
from __future__ import annotations

import re
from typing import Any
from .intent_classifier import classify_intent
from .models import QueryAnalysis

_CASE = re.compile(r"\b(?:case|appeal|petition|suit|writ)\s*(?:no\.?|number|#)?\s*([A-Z0-9][A-Z0-9./-]{2,})", re.I)
_ARTICLE = re.compile(r"\barticle\s+([0-9]+(?:\([A-Za-z0-9]+\))*)", re.I)
_SECTION = re.compile(r"\b(?:section|sec\.)\s+([0-9]+[A-Za-z]?(?:\([A-Za-z0-9]+\))*)", re.I)
_YEAR = re.compile(r"\b((?:19|20)\d{2})\b")
_COURT = re.compile(r"\b(Supreme Court|High Court|Court of Appeal|Appeals Court|District Court|Constitutional Court|Federal Court|Magistrates? Court)\b", re.I)
_LAW = re.compile(r"\b([A-Z][A-Za-z&' -]{2,60}\s(?:Act|Code|Ordinance|Regulation|Rules?|Constitution))\b")


def _values(pattern: re.Pattern[str], text: str) -> list[str]:
    return list(dict.fromkeys(match.group(1).strip() for match in pattern.finditer(text)))


def analyze_query(question: str, supplied_filters: dict[str, Any] | None = None) -> QueryAnalysis:
    if not isinstance(question, str) or not question.strip():
        raise ValueError("question must be a non-empty string")
    normalized = " ".join(question.split())
    extracted: dict[str, Any] = {}
    for key, pattern in (("court", _COURT), ("law", _LAW), ("article", _ARTICLE), ("section", _SECTION), ("year", _YEAR), ("case_number", _CASE)):
        values = _values(pattern, normalized)
        if values:
            extracted[key] = values
    for key, value in (supplied_filters or {}).items():
        if value not in (None, "", []):
            extracted[key] = value if isinstance(value, list) else [value]
    return QueryAnalysis(question, normalized, classify_intent(normalized), extracted)
