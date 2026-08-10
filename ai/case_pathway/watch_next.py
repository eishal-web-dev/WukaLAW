"""Client-friendly deterministic summary of pathway evidence."""
from __future__ import annotations

_ATTENTION = {
    "pre_filing": ["Check whether any notice response or filing deadline is recorded."],
    "filed": ["Check the latest court order for notice, scrutiny, or the next listing."],
    "service": ["Check the latest order for service status and the next listing."],
    "pleadings": ["Check whether the court has recorded pleadings as complete."],
    "interim": ["Check the current interim order and its next review date."],
    "issues": ["Check the latest order for the issues actually framed by the court."],
    "evidence": ["Check the latest order for the next witness or evidence direction."],
    "arguments": ["Check the latest court order for the next hearing or whether judgment was reserved."],
    "decision": ["Check the signed judgment or decree and any recorded next procedural step."],
    "appeal": ["Check the latest appellate order and next listing."],
    "enforcement": ["Check the latest execution or enforcement order."],
    "unknown": ["Add the latest court order or hearing note so the current stage can be identified."],
}


def build_watch_next(current_pathway: dict, historical_pathway: dict, historical_timing: dict) -> dict:
    current = current_pathway.get("current_stage") or {}
    label = current.get("label") or "not yet clear"
    top = historical_pathway.get("most_common_next_stage") if historical_pathway else None
    support = None
    if top:
        support = (
            f"{top['count']} of {historical_pathway.get('cases_with_later_stage', 0)} comparable records "
            f"with usable pathway evidence next showed {top['stage_label']}."
        )
    timing_text = None
    if historical_timing and historical_timing.get("available"):
        timing_text = (
            f"Among {historical_timing['sample_size']} comparable records with usable dates, "
            f"the median observed gap was {historical_timing['median_days']:g} days."
        )
    return {
        "headline": f"Your case appears to be at {label}",
        "most_observed_next_step": top.get("stage_label") if top else None,
        "historical_support_text": support or "There is not enough usable later-stage evidence to summarize what commonly appeared next.",
        "timing_text": timing_text or "There are not enough explicit dated events to show a reliable historical timing summary.",
        "attention_points": _ATTENTION.get(current.get("key"), _ATTENTION["unknown"]),
        "disclaimer": "Procedural reminders and historical observations are not legal advice or predictions.",
    }
