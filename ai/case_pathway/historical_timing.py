<<<<<<< HEAD
"""Observed timing between procedural stages in retrieved historical judgments.

Only explicit dates tied to stage language are used. The output is descriptive
corpus evidence, not an ETA or forecast for the active case.
"""
from __future__ import annotations

from datetime import date
from statistics import median
from typing import Iterable

from ai.timeline.extract import extract_events
from .stage_detector import STAGES


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


def _term_positions(text: str, term: str) -> list[tuple[int, int]]:
    value = text.lower()
    needle = term.lower()
    positions: list[tuple[int, int]] = []
    start = 0
    while True:
        index = value.find(needle, start)
        if index < 0:
            break
        positions.append((index, index + len(needle)))
        start = index + 1
    return positions


def _stage_for_event(text: str, date_text: str) -> str | None:
    """Associate an explicit date with the closest procedural-stage phrase.

    A dated sentence can mention more than one stage. We therefore choose the
    stage phrase nearest the date and reject associations farther than 90
    characters away. This is intentionally conservative.
    """
    value = text or ""
    lower = value.lower()
    date_index = lower.find((date_text or "").lower())
    if date_index < 0:
        return None
    date_mid = date_index + len(date_text or "") / 2

    candidates: list[tuple[float, int, str]] = []
    for key, terms in _STAGE_TERMS.items():
        for term in terms:
            for start, end in _term_positions(value, term):
                term_mid = (start + end) / 2
                distance = abs(term_mid - date_mid)
                if distance <= 90:
                    candidates.append((distance, -_STAGE_INDEX[key], key))

    if not candidates:
        return None
    candidates.sort()
    return candidates[0][2]


def _dated_stage_events(result: dict) -> list[tuple[str, date, str]]:
    rows: list[tuple[str, date, str]] = []
    for event in extract_events(_result_text(result)):
        stage_key = _stage_for_event(event.text, event.date_text)
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
=======
"""Explicit-date-only historical timing statistics for comparable cases."""
from __future__ import annotations
import re
from datetime import datetime
from statistics import median
from typing import Iterable
from .stage_detector import STAGES, _hits, _normalize
_DATE = re.compile(r"\b(?P<d>\d{1,2})[./-](?P<m>\d{1,2})[./-](?P<y>\d{4})\b")
_MONTH_DATE = re.compile(r"\b(?P<d>\d{1,2})\s+(?P<m>January|February|March|April|May|June|July|August|September|October|November|December)\s+(?P<y>\d{4})\b", re.I)
def _parse_dates(text: str) -> list[datetime]:
    found = []
    for match in _DATE.finditer(text):
        try: found.append(datetime(int(match["y"]), int(match["m"]), int(match["d"])))
        except ValueError: continue
    for match in _MONTH_DATE.finditer(text):
        try: found.append(datetime.strptime(match.group(0), "%d %B %Y"))
        except ValueError: continue
    return sorted(found)
def _dated_events(text: str) -> list[tuple[datetime, str, str]]:
    events = []
    for sentence in re.split(r"(?<=[.!?;])\s+", " ".join((text or "").split())):
        dates = _parse_dates(sentence)
        if not dates: continue
        normalized = _normalize(sentence)
        for stage in STAGES:
            if _hits(normalized, stage["terms"]): events.extend((date, stage["key"], sentence[:300]) for date in dates)
    return sorted(events)
def _result_text(result: dict) -> str:
    return " ".join(str(value) for value in (result.get("text_preview"), result.get("explicit_outcome_phrase"), result.get("explanation")) if value)
def analyze_historical_timing(current_stage_key: str, similar_results: Iterable[dict], minimum_sample: int = 3) -> dict:
    stage_index = {stage["key"]: index for index, stage in enumerate(STAGES)}
    labels = {stage["key"]: stage["label"] for stage in STAGES}
    reviewed = 0
    observations = []
    if current_stage_key not in stage_index: return _empty("A reliable current stage is needed before historical timing can be compared.", reviewed, minimum_sample)
    for result in similar_results:
        reviewed += 1
        events = _dated_events(_result_text(result))
        candidates = []
        for start_date, start_key, _ in events:
            if start_key != current_stage_key: continue
            for end_date, stage_key, evidence in events:
                days = (end_date - start_date).days
                if stage_index.get(stage_key, -1) > stage_index[current_stage_key] and days >= 0: candidates.append((days, stage_key, evidence))
        if not candidates: continue
        days, next_key, evidence = min(candidates, key=lambda item: (item[0], stage_index[item[1]]))
        observations.append({"document_id": result.get("document_id"), "title": result.get("title") or result.get("case_number") or "Pakistani judgment", "next_stage_key": next_key, "next_stage_label": labels[next_key], "days": days, "evidence": evidence})
    if len(observations) < minimum_sample: return _empty(f"Only {len(observations)} comparable records contained usable explicit dated stage events; at least {minimum_sample} are required.", reviewed, minimum_sample, observations)
    days = sorted(item["days"] for item in observations)
    lower, upper = median(days[:len(days)//2]), median(days[(len(days)+1)//2:])
    groups = {}
    for item in observations: groups.setdefault(item["next_stage_label"], []).append(item["days"])
    return {"available": True, "reason": None, "comparable_cases_reviewed": reviewed, "sample_size": len(days), "minimum_sample": minimum_sample, "median_days": round(float(median(days)), 1), "iqr_days": [round(float(lower), 1), round(float(upper), 1)], "by_next_stage": [{"stage_label": label, "sample_size": len(values), "median_days": round(float(median(values)), 1)} for label, values in sorted(groups.items())], "examples": observations[:5], "disclaimer": "These are observed gaps between explicit dated events in historical records, not an ETA for this case."}
def _empty(reason, reviewed, minimum, examples=None):
    return {"available": False, "reason": reason, "comparable_cases_reviewed": reviewed, "sample_size": len(examples or []), "minimum_sample": minimum, "median_days": None, "iqr_days": None, "by_next_stage": [], "examples": (examples or [])[:5], "disclaimer": "No timing estimate is shown without enough explicit dated procedural events."}
>>>>>>> bff5672 (feat(ai): complete deterministic case intelligence and brief fallback)
