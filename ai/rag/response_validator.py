"""Conservative validation of claims against supplied evidence."""
from __future__ import annotations

import re
from .models import ContextItem, ValidationResult, ValidationStatus

_CITATION = re.compile(r"\[(C\d+)\]")
_CASE = re.compile(r"\b(?:case|appeal|petition|suit|writ)\s*(?:no\.?|number|#)?\s*([A-Z0-9][A-Z0-9./-]{2,})", re.I)
_ARTICLE = re.compile(r"\barticle\s+([0-9]+(?:\([A-Za-z0-9]+\))*)", re.I)
_SECTION = re.compile(r"\b(?:section|sec\.)\s+([0-9]+[A-Za-z]?(?:\([A-Za-z0-9]+\))*)", re.I)
_LAW = re.compile(r"\b([A-Z][A-Za-z&' -]{2,60}\s(?:Act|Code|Ordinance|Regulation|Rules?|Constitution))\b")


def _claims(pattern: re.Pattern[str], text: str) -> set[str]:
    return {match.group(1).strip().casefold() for match in pattern.finditer(text)}


def validate_response(answer: str, context: list[ContextItem], minimum_score: float = 0.25) -> ValidationResult:
    if not context or not answer.strip() or "INSUFFICIENT_EVIDENCE" in answer.upper():
        return ValidationResult(ValidationStatus.INSUFFICIENT_EVIDENCE, ["No answerable evidence was available."])
    evidence_text = "\n".join(item.text for item in context)
    valid_ids = {item.citation.id for item in context}
    cited = set(_CITATION.findall(answer))
    reasons: list[str] = []
    unknown = cited - valid_ids
    if unknown:
        reasons.append("Unknown citations: " + ", ".join(sorted(unknown)))
    for label, pattern in (("case numbers", _CASE), ("articles", _ARTICLE), ("sections", _SECTION), ("laws", _LAW)):
        unsupported = _claims(pattern, answer) - _claims(pattern, evidence_text)
        if unsupported:
            reasons.append(f"Unsupported {label}: " + ", ".join(sorted(unsupported)))
    if reasons:
        return ValidationResult(ValidationStatus.INSUFFICIENT_EVIDENCE, reasons)
    if not cited or max(item.score for item in context) < minimum_score:
        return ValidationResult(ValidationStatus.LOW_CONFIDENCE, ["Answer has no valid inline citation or retrieval score is weak."])
    return ValidationResult(ValidationStatus.PASS, [])
