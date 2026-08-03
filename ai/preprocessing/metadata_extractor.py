"""Rule-only legal metadata extraction for TASK-003."""

from __future__ import annotations

import re
from datetime import datetime
from pathlib import Path
from typing import Any

from ai.preprocessing.dataset_loader import (
    _title_from_text,
    infer_case_category,
    infer_case_number,
    infer_court,
    infer_decision_date,
    infer_judge_names,
)

_DATE = r"(?:\d{1,2}[./-]\d{1,2}[./-]\d{2,4}|\d{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]+\s+\d{4})"
_HEARING = re.compile(rf"\b(?:date\s+of\s+hearing|heard\s+on|hearing\s+date)\s*[:\-]?\s*({_DATE})", re.I)
_DECISION = re.compile(rf"\b(?:date\s+of\s+(?:decision|judgment)|decided\s+on|decision\s+date)\s*[:\-]?\s*({_DATE})", re.I)
_LAW = re.compile(r"\b(?:the\s+)?([A-Z][A-Za-z&'()\- ]{2,100}\s+(?:Act|Ordinance|Code|Order|Rules?|Regulations?|Constitution)(?:,?\s*\d{4})?)\b")
_SECTION = re.compile(r"\b(?:sections?|ss?\.)\s+([0-9]+(?:-[A-Za-z0-9]+|[A-Za-z])?(?:\s*\([^)]+\))?(?:\s*(?:,|and|to|-)\s*[0-9]+(?:-[A-Za-z0-9]+|[A-Za-z])?(?:\s*\([^)]+\))?)*)", re.I)
_ARTICLE = re.compile(r"\b(?:articles?|arts?\.)\s+([0-9]+[A-Za-z]?(?:\s*\([^)]+\))?(?:\s*(?:,|and|to|-)\s*[0-9]+[A-Za-z]?(?:\s*\([^)]+\))?)*)", re.I)
_CITATIONS = [
    re.compile(r"\b(?:PLD|SCMR|CLC|YLR|MLD|PCrLJ|NLR)\s+\d{4}\s+[A-Z][A-Z. ]{0,20}\s+\d+\b", re.I),
    re.compile(r"\b\d{4}\s+(?:SC|SCC|SCMR|CLC|YLR|MLD|PCrLJ)\s+\d+\b", re.I),
]
_OUTCOME = re.compile(
    r"\b(?:appeal|petition|application|revision|reference|suit)\s+(?:is\s+|stands\s+)?"
    r"(?:allowed|dismissed|disposed\s+of|accepted|rejected|withdrawn)|"
    r"\b(?:conviction|sentence)\s+(?:is\s+|stands\s+)?(?:set\s+aside|upheld|maintained)\b",
    re.I,
)


def _unique(values: list[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for value in values:
        value = re.sub(r"\s+", " ", value).strip(" ,.;:")
        if value and value.casefold() not in seen:
            seen.add(value.casefold())
            result.append(value)
    return result


def _clean_judges(values: list[str]) -> list[str]:
    cleaned: list[str] = []
    for value in values:
        value = re.sub(r"^\s*(?:present\s*:\s*)?", "", value, flags=re.I)
        value = re.sub(
            r"^(?:hon(?:ou)?rable\s+)?(?:mr\.?|mrs\.?)?\s*(?:chief\s+)?justice\s+",
            "",
            value,
            flags=re.I,
        )
        value = re.sub(r",?\s*(?:hcj|cj|j)\.?$", "", value, flags=re.I)
        if value.strip():
            cleaned.append(value.strip(" ,:;-"))
    return _unique(cleaned)


def _iso_date(value: str | None) -> str | None:
    if not value:
        return None
    value = re.sub(r"(\d)(?:st|nd|rd|th)\b", r"\1", value, flags=re.I)
    for fmt in ("%d/%m/%Y", "%d-%m-%Y", "%d.%m.%Y", "%d %B %Y", "%d %b %Y"):
        try:
            return datetime.strptime(value, fmt).date().isoformat()
        except ValueError:
            continue
    return value


def _explicit_date(pattern: re.Pattern[str], text: str) -> str | None:
    match = pattern.search(text[:200_000])
    return _iso_date(match.group(1)) if match else None


def extract_metadata(text: str, record: dict[str, Any] | None = None) -> dict[str, Any]:
    """Extract deterministic metadata; never infer a win/loss label."""
    record = record or {}
    source_path = str(record.get("source_path") or "")
    document_type = str(record.get("document_type") or "")
    court = infer_court(source_path, text) or record.get("court")
    category = record.get("case_category")
    if not category:
        category, _ = infer_case_category(Path(source_path or "."), Path("."), text, labeled=False)
    decisions = _explicit_date(_DECISION, text) or infer_decision_date(text)
    outcomes = _unique([match.group(0) for match in _OUTCOME.finditer(text[-200_000:])])
    laws = _unique([match.group(1) for match in _LAW.finditer(text[:500_000])])
    sections = _unique([match.group(1) for match in _SECTION.finditer(text[:500_000])])
    articles = _unique([match.group(1) for match in _ARTICLE.finditer(text[:500_000])])
    citations = _unique([m.group(0) for pattern in _CITATIONS for m in pattern.finditer(text[:500_000])])
    jurisdiction = record.get("jurisdiction") or ("Pakistan" if court or "Pakistan" in text[:50_000] else None)
    fallback = str(record.get("source_file_name") or source_path or "document")
    return {
        "court": court,
        "jurisdiction": jurisdiction,
        "case_category": category,
        "case_number": infer_case_number(text) or record.get("case_number"),
        "title": record.get("title") or _title_from_text(text, fallback),
        "judges": _clean_judges(infer_judge_names(text) or list(record.get("judge_names") or [])),
        "hearing_date": _explicit_date(_HEARING, text),
        "decision_date": decisions or record.get("decision_date"),
        "laws_cited": laws,
        "sections_cited": sections,
        "articles_cited": articles,
        "legal_citations": citations,
        "explicit_outcome_phrases": outcomes,
        "outcome_label": None,
    }
