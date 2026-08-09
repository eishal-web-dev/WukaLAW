"""Observed timing between procedural stages in retrieved historical judgments.

Only explicit dates tied to stage language are used. The output is descriptive
corpus evidence, not an ETA or forecast for the active case.
"""
from __future__ import annotations

from datetime import date
from statistics import median
from typing import Iterable

from ai.timeline.extract import extract_events
from .stage_detector import STAGES, _hits, _normalize


_STAGE_INDEX = {stage["key"]: index for index, stage in enumerate(STAGES)}
_STAGE_LABEL = {stage["key"]: stage["label"] for stage in STAGES}
_STAGE_TERMS = {stage["key"]: stage["terms"] for stage in STAGES}


def _result_text(result: dict) -> str:
    parts = [
        result.get("title") or "",
        result.get("case_number") or "",
        result.get("text_preview") or "",
        result.get("explicit_outcome_phrase") or "",
        result.get("explanation") or "",
    ]
    parts.extend(result.get("differences") or [])
    return "\n".join(str(part) for part in parts if part)


def _stage_for_event(text: str) -> str | None:
    """Return the latest procedural stage explicitly mentioned in one dated event."""
    normalized = _normalize(text)
    matches = [key for key, terms in _STAGE_TERMS.items() if _hits(normalized, terms)]
    if not matches:
        return None
    return max(matches, key=lambda key: _STAGE_INDEX[key])


def _dated_stage_events(result: dict) -> list[tuple[str, date, str]]:
    rows: list[tuple[str, date, str]] = []
    for event in extract_events(_result_text(result)):
        stage_key = _stage_for_event(event.text)
        if not stage_key:
            continue
        rows.append((stage_key, date.fromisoformat(event.date), event.text))
    rows.sort(key=lambda row: row[1])
    return rows


def _transition_days(current_stage_key: str, result: dict) -> tuple[str, int] | None:
    """Find the earliest explicit dated transition after the current stage.

    We require a dated event for the current stage and a later dated event for a
    later stage in the same historical record. Negative/zero intervals and very
    long gaps (>15 years) are rejected as likely context/date-association noise.
    """
    if current_stage_key not in _STAGE_INDEX:
        return None

    events = _dated_stage_events(result)
    current_dates = [when for key, when, _ in events if key == current_stage_key]
    if not current_dates:
        return None

    # Use the latest occurrence of the current stage, then the earliest later
    # stage after it. This handles adjourned/repeated hearings conservatively.
    start = max(current_dates)
    later = [
        (key, when)
        for key, when, _ in events
        if _STAGE_INDEX[key] > _STAGE_INDEX[current_stage_key] and when > start
    ]
    if not later:
        return None
    later.sort(key=lambda row: (row[1], _STAGE_INDEX[row[0]]))
    next_key, end = later[0]
    days = (end - start).days
    if days <= 0 or days > 365 * 15:
        return None
    return next_key, days


def _percentile(values: list[int], p: float) -> float:
    if not values:
        return 0.0
    ordered = sorted(values)
    if len(ordered) == 1:
        return float(ordered[0])
    position = (len(ordered) - 1) * p
    lower = int(position)
    upper = min(lower + 1, len(ordered) - 1)
    fraction = position - lower
    return ordered[lower] + (ordered[upper] - ordered[lower]) * fraction


def analyze_historical_timing(current_stage_key: str, similar_results: Iterable[dict], *, minimum_sample: int = 3) -> dict:
    """Summarize explicit observed timing from current stage to later stages."""
    reviewed = 0
    observations: list[dict] = []

    if current_stage_key not in _STAGE_INDEX:
        return {
            "available": False,
            "reason": "WukaLAW needs a reliably detected current stage before comparing historical timing.",
            "current_stage_key": current_stage_key,
            "records_reviewed": 0,
            "dated_transitions_found": 0,
            "minimum_sample": minimum_sample,
            "median_days": None,
            "typical_low_days": None,
            "typical_high_days": None,
            "observations": [],
            "disclaimer": "Historical timing describes explicit dated records; it is not an ETA for this case.",
        }

    for result in similar_results:
        reviewed += 1
        transition = _transition_days(current_stage_key, result)
        if not transition:
            continue
        next_key, days = transition
        observations.append({
            "document_id": result.get("document_id"),
            "title": result.get("title") or result.get("case_number") or "Pakistani judgment",
            "court": result.get("court"),
            "next_stage_key": next_key,
            "next_stage_label": _STAGE_LABEL[next_key],
            "days": days,
        })

    values = [item["days"] for item in observations]
    enough = len(values) >= minimum_sample
    med = round(float(median(values)), 1) if enough else None
    low = round(_percentile(values, 0.25), 1) if enough else None
    high = round(_percentile(values, 0.75), 1) if enough else None

    return {
        "available": enough,
        "reason": (
            None
            if enough
            else f"Only {len(values)} comparable record(s) had explicit dates tied to both stages; at least {minimum_sample} are required."
        ),
        "current_stage_key": current_stage_key,
        "current_stage_label": _STAGE_LABEL[current_stage_key],
        "records_reviewed": reviewed,
        "dated_transitions_found": len(values),
        "minimum_sample": minimum_sample,
        "median_days": med,
        "typical_low_days": low,
        "typical_high_days": high,
        "observations": sorted(observations, key=lambda item: item["days"])[:12],
        "disclaimer": (
            "These are observed gaps between explicit dated procedural events in retrieved historical records. "
            "They do not predict when this case will reach the next stage."
        ),
    }
