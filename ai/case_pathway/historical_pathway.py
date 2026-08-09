"""Deterministic historical pathway aggregation over retrieved similar judgments.

This module does not predict what a court will do. It inspects the text already
returned for similar historical judgments and counts which *later procedural
stage* is visible after the active case's current stage.
"""
from __future__ import annotations

from collections import Counter
from typing import Iterable

from .stage_detector import STAGES, _hits, _normalize


def _result_text(result: dict) -> str:
    parts = [
        result.get("title") or "",
        result.get("case_number") or "",
        result.get("text_preview") or "",
        result.get("explicit_outcome_phrase") or "",
        result.get("explanation") or "",
    ]
    parts.extend(result.get("differences") or [])
    return _normalize(" ".join(str(part) for part in parts if part))


def _visible_stage_keys(text: str) -> list[str]:
    return [stage["key"] for stage in STAGES if _hits(text, stage["terms"])]


def analyze_historical_pathways(current_stage_key: str, similar_results: Iterable[dict]) -> dict:
    """Count the earliest later stage visible in each retrieved historical case.

    The result is intentionally phrased as observed corpus evidence rather than
    a forecast. A retrieved snippet may omit procedural steps that happened in
    the full matter, so cases with no visible later stage are excluded from the
    denominator and reported separately.
    """
    stage_index = {stage["key"]: index for index, stage in enumerate(STAGES)}
    labels = {stage["key"]: stage["label"] for stage in STAGES}

    if current_stage_key not in stage_index:
        return {
            "available": False,
            "reason": "WukaLAW needs a reliably detected current stage before comparing historical pathways.",
            "current_stage_key": current_stage_key,
            "comparable_cases_reviewed": 0,
            "cases_with_later_stage": 0,
            "cases_without_later_stage": 0,
            "most_common_next_stage": None,
            "distribution": [],
            "examples": [],
            "disclaimer": "Historical pathway counts are research observations, not predictions.",
        }

    current_index = stage_index[current_stage_key]
    counts: Counter[str] = Counter()
    examples: dict[str, list[dict]] = {}
    reviewed = 0
    without_later = 0

    for result in similar_results:
        reviewed += 1
        visible = _visible_stage_keys(_result_text(result))
        later = sorted(
            (key for key in visible if stage_index[key] > current_index),
            key=lambda key: stage_index[key],
        )
        if not later:
            without_later += 1
            continue

        # Earliest visible later stage is the least aggressive inference. If a
        # snippet contains both judgment and appeal, an arguments-stage client
        # is counted under decision rather than jumping straight to appeal.
        next_key = later[0]
        counts[next_key] += 1
        examples.setdefault(next_key, [])
        if len(examples[next_key]) < 3:
            examples[next_key].append({
                "document_id": result.get("document_id"),
                "title": result.get("title") or result.get("case_number") or "Pakistani judgment",
                "court": result.get("court"),
                "similarity_score": result.get("similarity_score"),
            })

    usable = sum(counts.values())
    distribution = [
        {
            "stage_key": key,
            "stage_label": labels[key],
            "count": count,
            "share": round(count / usable, 4) if usable else 0.0,
            "examples": examples.get(key, []),
        }
        for key, count in sorted(
            counts.items(),
            key=lambda pair: (-pair[1], stage_index[pair[0]]),
        )
    ]

    most_common = distribution[0] if distribution else None
    return {
        "available": bool(usable),
        "reason": (
            None
            if usable
            else "The retrieved judgment passages do not show a later procedural stage clearly enough to summarize."
        ),
        "current_stage_key": current_stage_key,
        "comparable_cases_reviewed": reviewed,
        "cases_with_later_stage": usable,
        "cases_without_later_stage": without_later,
        "most_common_next_stage": most_common,
        "distribution": distribution,
        "examples": most_common.get("examples", []) if most_common else [],
        "disclaimer": (
            "These counts describe later stages visible in the retrieved historical judgment records. "
            "They are not a prediction, probability, or guarantee of what will happen in this case."
        ),
    }
