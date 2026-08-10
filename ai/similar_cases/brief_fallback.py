"""Deterministic extractive precedent brief used when an optional LLM is unavailable."""
from __future__ import annotations
import re
from typing import Any, Iterable

_SENTENCE = re.compile(r"(?<=[.!?])\s+")
_OUTCOME = re.compile(r"\b(?:petition|appeal|application|revision|suit|bail)\s+(?:is\s+|was\s+)?(?:allowed|dismissed|granted|refused|decreed)\b|\bconviction\s+(?:maintained|upheld|set aside)\b", re.I)
_ISSUE = re.compile(r"\b(issue|question|whether|controversy|dispute)\b", re.I)
_PROCEDURE = re.compile(r"\b(trial court|family court|appeal|petition|filed|instituted|evidence|arguments|judgment|order)\b", re.I)
_REASON = re.compile(r"\b(held|found|observed|reason|because|therefore|concluded)\b", re.I)
_LAW = re.compile(r"\b(?:section|article|rule)\s+\d+[A-Za-z-]*\b|\b[A-Z][A-Za-z ]{2,45}(?:Act|Ordinance|Code),?\s*(?:18|19|20)\d{2}\b")

def _sentences(text: str) -> list[str]:
    return [item.strip() for item in _SENTENCE.split(" ".join((text or "").split())) if len(item.strip()) >= 24]

def _pick(sentences: list[str], pattern: re.Pattern[str], limit: int) -> list[str]:
    return list(dict.fromkeys(item for item in sentences if pattern.search(item)))[:limit]

def build_extractive_brief(historical_record: str, chunks: Iterable[Any], *, has_substantive_client_issue: bool) -> dict:
    sentences = _sentences(historical_record)
    outcome = next((item for item in sentences if _OUTCOME.search(item)), None)
    procedures = _pick(sentences, _PROCEDURE, 5)
    issues = _pick(sentences, _ISSUE, 4)
    reasoning = _pick(sentences, _REASON, 5)
    laws: list[str] = []
    for item in sentences:
        laws.extend(match.group(0) for match in _LAW.finditer(item))
    overview = " ".join((procedures or sentences[:2])[:2]) or "Not available in the supplied judgment record."
    return {
        "case_overview": overview,
        "background_facts": sentences[:4],
        "procedural_history": procedures,
        "legal_issues": issues,
        "court_reasoning": reasoning,
        "ratio_or_principle": reasoning[:2],
        "final_decision": outcome or "Not available in the supplied judgment record.",
        "relief_or_order": outcome or "Not available in the supplied judgment record.",
        "similarities_to_client": [],
        "important_differences": ["Client-specific comparison requires facts present in both records."],
        "how_it_may_help": [],
        "client_effect": "insufficient_client_facts",
        "research_strength": "limited",
        "research_strength_reason": "This brief is extracted from supplied passages without an AI-generated synthesis.",
        "argument_to_consider": [],
        "opponent_distinction": [],
        "next_verification_steps": ["Verify the official judgment, complete procedural history, ratio, and later treatment before reliance."],
        "key_laws": list(dict.fromkeys(laws))[:10],
        "evidence_limitations": "Extractive fallback: sentences are copied from available judgment passages; missing context is not inferred.",
        "brief_source": "extractive",
    }
