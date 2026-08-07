"""Explainable priority-ordered intent rules."""
from __future__ import annotations
import re
from .models import Intent, IntentResult

_RULES: list[tuple[Intent, float, tuple[str, ...]]] = [
    (Intent.DOCUMENT_GENERATION, .98, (r"\b(draft|write|prepare|generate|create)\b.{0,45}\b(notice|petition|contract|agreement|affidavit|application|legal document|letter)\b",)),
    (Intent.SIMILAR_CASE, .96, (r"\b(similar|comparable|analogous)\b.{0,30}\b(cases?|judgments?|decisions?)\b", r"\bprecedents?\b")),
    (Intent.DOCUMENT_EXPLANATION, .94, (r"\b(explain|summari[sz]e|interpret)\b.{0,40}\b(document|judgment|order|contract|clause|notice)\b",)),
    (Intent.EVIDENCE_QUESTION, .93, (r"\b(evidence|proof|witness|admissib(?:le|ility)|burden of proof)\b",)),
    (Intent.APPEAL, .92, (r"\b(appeal|challenge|set aside|review petition)\b",)),
    (Intent.SETTLEMENT, .91, (r"\b(settle|settlement|compromise|mediation|conciliation)\b",)),
    (Intent.RIGHTS, .90, (r"\b(my|our|fundamental|constitutional|legal) rights?\b", r"\bentitled to\b")),
    (Intent.OBLIGATIONS, .89, (r"\b(obligation|duty|duties|required to|must i|liable to)\b",)),
    (Intent.LEGAL_PROCEDURE, .88, (r"\b(how (do|can|should)|procedure|process|steps?|where (do|can)|deadline)\b.{0,55}\b(file|court|claim|case|petition|complaint|register|apply)\b",)),
    (Intent.LEGAL_ADVICE, .86, (r"\b(should i|what should i do|advise me|legal advice|can i sue|do i have a case)\b",)),
    (Intent.LAW_LOOKUP, .84, (r"\b(article|section|rule|act|code|ordinance|regulation|law)\b",)),
]


def classify_intent(text: str) -> IntentResult:
    for intent, confidence, patterns in _RULES:
        matches = [pattern for pattern in patterns if re.search(pattern, text, re.I)]
        if matches:
            return IntentResult(intent, confidence, matches)
    return IntentResult(Intent.UNKNOWN, 0.0, [])
