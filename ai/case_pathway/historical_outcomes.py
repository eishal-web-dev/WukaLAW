"""Conservative explicit-outcome aggregation for comparable judgments."""
from __future__ import annotations
import re
from typing import Iterable
_SIGNALS = (
    ("partial_or_mixed", re.compile(r"\b(partly|partially)\s+(allowed|accepted|decreed)|\bmodified\b|\bto the extent\b", re.I)),
    ("allowed", re.compile(r"\b(petition|appeal|application|revision|suit)\s+(?:is\s+|was\s+)?allowed\b|\bsuit\s+(?:is\s+|was\s+)?decreed\b|\bbail\s+(?:is\s+|was\s+)?granted\b", re.I)),
    ("dismissed", re.compile(r"\b(petition|appeal|application|revision|suit|bail)\s+(?:is\s+|was\s+)?(?:dismissed|refused)\b", re.I)),
    ("conviction_set_aside", re.compile(r"\bconviction\s+(?:is\s+|was\s+)?set aside\b|\bacquitted\b", re.I)),
    ("conviction_maintained", re.compile(r"\bconviction\s+(?:is\s+|was\s+)?(?:maintained|upheld)\b", re.I)),
)
def _explicit_outcome(result):
    text = " ".join(str(v) for v in (result.get("explicit_outcome_phrase"), result.get("text_preview")) if v)
    for label, pattern in _SIGNALS:
        match = pattern.search(text)
        if match: return label, match.group(0)
    return None, None
def analyze_historical_outcomes(similar_results: Iterable[dict], relevant_side: str | None = None) -> dict:
    reviewed = usable = 0
    counts = {"favorable": 0, "partial_or_mixed": 0, "unfavorable": 0, "unclear": 0}
    recorded, examples = {}, []
    side = (relevant_side or "").strip().casefold()
    alignment_available = side in {"appellant", "petitioner", "applicant", "plaintiff", "accused"}
    for result in similar_results:
        reviewed += 1
        disposition, phrase = _explicit_outcome(result)
        if not disposition: continue
        usable += 1
        recorded[disposition] = recorded.get(disposition, 0) + 1
        aligned = "partial_or_mixed" if disposition == "partial_or_mixed" else "unclear"
        if alignment_available and disposition != "partial_or_mixed": aligned = "favorable" if disposition in {"allowed", "conviction_set_aside"} else "unfavorable"
        counts[aligned] += 1
        if len(examples) < 8: examples.append({"document_id": result.get("document_id"), "title": result.get("title") or result.get("case_number") or "Pakistani judgment", "recorded_outcome": disposition, "evidence_phrase": phrase, "client_alignment": aligned if alignment_available else "unclear"})
    return {"available": usable > 0, "comparable_cases_reviewed": reviewed, "usable_outcomes": usable, **counts, "client_alignment_available": alignment_available, "recorded_outcomes": [{"outcome": key, "count": value} for key, value in sorted(recorded.items())], "examples": examples, "reason": None if usable else "No explicit enough outcome language was found in the comparable passages.", "disclaimer": "Observed historical outcomes are not a prediction of this case."}
