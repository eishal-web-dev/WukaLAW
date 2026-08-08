"""Explainable issue and procedural-stage detection for an active case.

This first pathway-intelligence layer is deterministic on purpose. It does not
predict a court outcome. It reports issues/stages only when supported by words
present in the user's description or attached document text.
"""
from __future__ import annotations

import re
from typing import Iterable


ISSUES: dict[str, tuple[str, ...]] = {
    "Divorce / Khula": ("divorce", "khula", "dissolution of marriage", "dissolution"),
    "Dowry Recovery": ("dowry", "bridal gift", "dowry articles", "jahez"),
    "Dower / Mehr": ("dower", "mehr", "haq mehr", "haq meher"),
    "Maintenance": ("maintenance", "nafaqa", "monthly maintenance"),
    "Child Custody / Guardianship": ("custody", "guardianship", "visitation", "minor child", "guardian"),
    "Murder / Homicide": ("murder", "homicide", "qatal", "section 302", "302 ppc"),
    "Bail": ("bail", "pre-arrest bail", "post-arrest bail"),
    "Fraud / Deception": ("fraud", "cheating", "forgery", "forged", "deception", "misrepresentation"),
    "Property / Ownership": ("property", "ownership", "possession", "mutation", "land", "inheritance"),
    "Employment / Service": ("termination", "dismissal", "employment", "service matter", "employee"),
}

# Ordered from earliest to latest. Percentages are pathway-position indicators,
# not estimates of time remaining or probability of success.
STAGES: list[dict] = [
    {"key": "pre_filing", "label": "Pre-filing / dispute preparation", "progress": 5, "terms": ("legal notice", "notice served", "cause of action", "demand notice")},
    {"key": "filed", "label": "Case / petition filed", "progress": 15, "terms": ("suit filed", "petition filed", "complaint filed", "case filed", "instituted", "filed before")},
    {"key": "service", "label": "Service / appearance", "progress": 25, "terms": ("summons", "served upon", "service effected", "appearance", "notice issued")},
    {"key": "pleadings", "label": "Pleadings / written statement", "progress": 35, "terms": ("written statement", "reply filed", "counter affidavit", "replication", "pleadings")},
    {"key": "interim", "label": "Interim applications / temporary orders", "progress": 45, "terms": ("interim order", "interim maintenance", "stay order", "temporary injunction", "interim relief")},
    {"key": "issues", "label": "Issues framed / case set for evidence", "progress": 52, "terms": ("issues framed", "framing of issues", "issues were framed", "fixed for evidence")},
    {"key": "evidence", "label": "Evidence / witness stage", "progress": 65, "terms": ("evidence recorded", "cross examination", "cross-examination", "witness examined", "statement recorded", "examination-in-chief", "closed evidence", "evidence stage")},
    {"key": "arguments", "label": "Final arguments", "progress": 78, "terms": ("final arguments", "arguments heard", "heard arguments", "arguments concluded", "reserved judgment")},
    {"key": "decision", "label": "Decision / decree / judgment", "progress": 88, "terms": ("judgment announced", "decree passed", "suit decreed", "suit dismissed", "petition allowed", "petition dismissed", "final order")},
    {"key": "appeal", "label": "Appeal / revision", "progress": 94, "terms": ("appeal filed", "appeal preferred", "revision petition", "challenged before the high court", "appellate court")},
    {"key": "enforcement", "label": "Execution / enforcement", "progress": 100, "terms": ("execution petition", "execution proceedings", "enforcement", "recovery proceedings", "decree executed")},
]


def _normalize(text: str) -> str:
    return " ".join((text or "").lower().split())


def _hits(text: str, terms: Iterable[str]) -> list[str]:
    found: list[str] = []
    for term in terms:
        pattern = r"\b" + re.escape(term.lower()).replace(r"\ ", r"\s+") + r"\b"
        if re.search(pattern, text, flags=re.I):
            found.append(term)
    return found


def analyze_case_pathway(case_type: str, description: str, documents: list[dict[str, str]]) -> dict:
    record_parts = [case_type or "", description or ""]
    document_titles: list[str] = []
    for document in documents:
        title = document.get("title") or "Untitled document"
        body = document.get("text") or ""
        document_titles.append(title)
        record_parts.append(title)
        record_parts.append(body)
    record = _normalize("\n".join(record_parts))

    issues = []
    for label, terms in ISSUES.items():
        evidence = _hits(record, terms)
        if evidence:
            issues.append({"issue": label, "evidence_terms": evidence[:6]})

    detected_stages = []
    for stage in STAGES:
        evidence = _hits(record, stage["terms"])
        if evidence:
            detected_stages.append({
                "key": stage["key"],
                "label": stage["label"],
                "progress": stage["progress"],
                "evidence_terms": evidence[:6],
            })

    if detected_stages:
        current = max(detected_stages, key=lambda item: item["progress"])
        current_index = next(i for i, stage in enumerate(STAGES) if stage["key"] == current["key"])
        next_stage = STAGES[current_index + 1] if current_index + 1 < len(STAGES) else None
        stage_confidence = "high" if len(current["evidence_terms"]) >= 2 or len(documents) >= 2 else "moderate"
    else:
        current = {
            "key": "unknown",
            "label": "Stage not reliably detected",
            "progress": 0,
            "evidence_terms": [],
        }
        next_stage = None
        stage_confidence = "low"

    # An overall pathway position is only meaningful when a stage is evidenced.
    overall_progress = current["progress"]

    issue_progress = []
    for issue in issues:
        issue_progress.append({
            "issue": issue["issue"],
            "progress": overall_progress,
            "basis": "Current procedural stage is shared across the uploaded case record; issue-specific stages require issue-linked orders/documents.",
            "evidence_terms": issue["evidence_terms"],
        })

    warnings = []
    if not documents:
        warnings.append("No case documents are attached; stage detection relies mainly on the saved case description and type.")
    if not issues:
        warnings.append("No specific legal issue was confidently detected from the available record.")
    if current["key"] == "unknown":
        warnings.append("No reliable procedural-stage phrase was found. Upload orders, petitions, replies, evidence, or hearing documents for stage detection.")

    return {
        "detected_issues": issues,
        "current_stage": current,
        "overall_progress": overall_progress,
        "progress_meaning": "Position within a generic litigation pathway, not percent of time completed and not outcome probability.",
        "issue_progress": issue_progress,
        "next_generic_stage": ({"key": next_stage["key"], "label": next_stage["label"]} if next_stage else None),
        "stage_confidence": stage_confidence,
        "documents_analyzed": len(documents),
        "document_titles": document_titles,
        "detected_stage_evidence": detected_stages,
        "warnings": warnings,
        "disclaimer": "Procedural-stage detection is an automated research aid. Verify the current stage against the latest court order and complete case file.",
    }
