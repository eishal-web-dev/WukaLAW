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
    safe_text = re.sub(r"(?<=\d)\.(?=\d)", "-", " ".join((text or "").split()))
    for sentence in re.split(r"(?<=[.!?;])\s+", safe_text):
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
                if stage_index.get(stage_key, -1) > stage_index[current_stage_key] and 0 < days <= 365 * 15: candidates.append((days, stage_key, evidence))
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

# Backward-compatible aliases retained for the earlier pathway/timing contract.
_ai_completion_analyze_historical_timing = analyze_historical_timing

def analyze_historical_timing(current_stage_key: str, similar_results, minimum_sample: int = 3) -> dict:
    result = _ai_completion_analyze_historical_timing(current_stage_key, similar_results, minimum_sample)
    result.setdefault("records_reviewed", result.get("comparable_cases_reviewed", 0))
    result.setdefault("dated_transitions_found", result.get("sample_size", 0))
    iqr = result.get("iqr_days")
    result.setdefault("typical_low_days", iqr[0] if iqr else None)
    result.setdefault("typical_high_days", iqr[1] if iqr else None)
    result.setdefault("observations", result.get("examples", []))
    return result
