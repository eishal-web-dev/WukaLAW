"""Explainable issue and procedural-stage detection for an active case.

This layer is deterministic on purpose. It does not predict a court outcome.
Issues and stages are reported only when supported by language found in the
user's saved case record or attached documents.
"""
from __future__ import annotations

import re
from typing import Iterable


ISSUES: dict[str, tuple[str, ...]] = {
    "Divorce / Khula": ("divorce", "khula", "dissolution of marriage", "dissolution"),
    "Dowry Recovery": ("dowry", "bridal gift", "dowry articles", "jahez"),
    "Dower / Mehr": ("dower", "mehr", "meher", "haq mehr", "haq meher"),
    "Maintenance": ("maintenance", "nafaqa", "monthly maintenance", "maintenance allowance"),
    "Child Custody / Guardianship": ("custody", "guardianship", "visitation", "minor child", "guardian petition"),
    "Murder / Homicide": ("murder", "homicide", "qatal", "qatl", "section 302", "302 ppc"),
    "Attempted Murder": ("attempted murder", "section 324", "324 ppc"),
    "Bail": ("bail", "pre-arrest bail", "post-arrest bail", "pre arrest bail", "post arrest bail"),
    "Fraud / Deception": ("fraud", "cheating", "forgery", "forged", "deception", "misrepresentation"),
    "Property / Ownership": ("property", "ownership", "possession", "mutation", "land", "inheritance", "partition"),
    "Employment / Service": ("termination", "dismissal", "employment", "service matter", "employee"),
}

# Ordered from earliest to latest. Position values are display coordinates in a
# generic litigation pathway. They are NOT percent time complete and NOT an
# outcome probability.
STAGES: list[dict] = [
    {
        "key": "pre_filing",
        "label": "Before filing",
        "position": 5,
        "terms": (
            "legal notice", "demand notice", "cause of action", "notice served before filing",
            "pre litigation notice", "pre-litigation notice",
        ),
    },
    {
        "key": "filed",
        "label": "Case filed",
        "position": 15,
        "terms": (
            "suit filed", "petition filed", "complaint filed", "case filed", "instituted",
            "filed before", "institution of suit", "plaint instituted", "petition instituted",
        ),
    },
    {
        "key": "service",
        "label": "Notice / appearance",
        "position": 25,
        "terms": (
            "summons issued", "summons served", "served upon", "service effected", "service completed",
            "notice issued", "notice served", "respondent appeared", "defendant appeared",
            "appearance entered", "proceeded ex parte", "proceeded ex-parte", "ex parte proceedings",
        ),
    },
    {
        "key": "pleadings",
        "label": "Reply / written statement",
        "position": 35,
        "terms": (
            "written statement", "reply filed", "reply submitted", "counter affidavit", "counter-affidavit",
            "replication", "rejoinder", "pleadings completed", "written reply",
        ),
    },
    {
        "key": "interim",
        "label": "Temporary / interim orders",
        "position": 44,
        "terms": (
            "interim order", "interim maintenance", "stay order", "temporary injunction", "interim relief",
            "interim custody", "interim bail", "ad interim", "ad-interim", "status quo order",
        ),
    },
    {
        "key": "issues",
        "label": "Issues framed",
        "position": 52,
        "terms": (
            "issues framed", "framing of issues", "issues were framed", "issues have been framed",
            "fixed for evidence", "issues settled", "settlement of issues",
        ),
    },
    {
        "key": "evidence",
        "label": "Evidence / witnesses",
        "position": 65,
        "terms": (
            "evidence recorded", "evidence produced", "plaintiff evidence", "defence evidence", "defense evidence",
            "cross examination", "cross-examination", "cross examined", "witness examined", "witnesses examined",
            "statement recorded", "examination-in-chief", "examination in chief", "closed evidence",
            "evidence closed", "evidence stage", "produced witnesses", "recorded statement",
        ),
    },
    {
        "key": "arguments",
        "label": "Final arguments",
        "position": 78,
        "terms": (
            "final arguments", "arguments heard", "heard arguments", "arguments concluded", "arguments completed",
            "counsel addressed arguments", "fixed for arguments", "case fixed for arguments", "reserved judgment",
            "judgment reserved", "reserved for judgment", "reserved for orders",
        ),
    },
    {
        "key": "decision",
        "label": "Decision / decree",
        "position": 88,
        "terms": (
            "judgment announced", "judgment pronounced", "decree passed", "decree granted", "suit decreed",
            "suit dismissed", "petition allowed", "petition dismissed", "appeal allowed", "appeal dismissed",
            "final order", "disposed of", "case decided", "decision announced", "order announced",
        ),
    },
    {
        "key": "appeal",
        "label": "Appeal / revision",
        "position": 94,
        "terms": (
            "appeal filed", "appeal preferred", "appeal pending", "revision petition", "revision filed",
            "challenged before the high court", "challenged before high court", "appellate court",
            "civil appeal", "criminal appeal", "intra court appeal", "intra-court appeal",
        ),
    },
    {
        "key": "enforcement",
        "label": "Enforcement / execution",
        "position": 100,
        "terms": (
            "execution petition", "execution application", "execution proceedings", "decree executed",
            "enforcement proceedings", "recovery proceedings", "warrant of attachment", "attachment proceedings",
        ),
    },
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


def _confidence(current: dict, detected_stages: list[dict], documents_count: int) -> tuple[str, str]:
    current_hits = len(current.get("evidence_terms", []))
    if current_hits >= 2 and (documents_count >= 1 or len(detected_stages) >= 3):
        return "high", "Multiple phrases support the current stage and the record also contains surrounding procedural history."
    if current_hits >= 1 and (documents_count >= 1 or len(detected_stages) >= 2):
        return "moderate", "The current stage is supported by the record, but more orders or hearing documents would make it stronger."
    if current_hits >= 1:
        return "moderate", "One clear procedural phrase supports this stage."
    return "low", "No reliable procedural-stage phrase was found in the available record."


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

    detected_stages: list[dict] = []
    detected_keys: set[str] = set()
    for stage in STAGES:
        evidence = _hits(record, stage["terms"])
        if evidence:
            detected_keys.add(stage["key"])
            detected_stages.append({
                "key": stage["key"],
                "label": stage["label"],
                "progress": stage["position"],  # backwards-compatible API field
                "position": stage["position"],
                "evidence_terms": evidence[:8],
            })

    if detected_stages:
        current = max(detected_stages, key=lambda item: item["position"])
        current_index = next(i for i, stage in enumerate(STAGES) if stage["key"] == current["key"])
        next_stage = STAGES[current_index + 1] if current_index + 1 < len(STAGES) else None
    else:
        current = {
            "key": "unknown",
            "label": "We need more information",
            "progress": 0,
            "position": 0,
            "evidence_terms": [],
        }
        current_index = -1
        next_stage = None

    stage_confidence, confidence_reason = _confidence(current, detected_stages, len(documents))
    process_position = current["position"]

    journey_steps = []
    for index, stage in enumerate(STAGES):
        if current_index < 0:
            state = "unknown"
        elif index == current_index:
            state = "current"
        elif stage["key"] in detected_keys:
            state = "confirmed"
        elif index == current_index + 1:
            state = "next"
        elif index < current_index:
            # Do not claim an unseen earlier step happened; court files can omit it.
            state = "not_seen"
        else:
            state = "later"
        evidence = next((item["evidence_terms"] for item in detected_stages if item["key"] == stage["key"]), [])
        journey_steps.append({
            "key": stage["key"],
            "label": stage["label"],
            "position": stage["position"],
            "state": state,
            "evidence_terms": evidence,
        })

    issue_progress = [
        {
            "issue": issue["issue"],
            "progress": process_position,
            "basis": "This uses the latest procedural stage found across the case record. Issue-specific progress requires documents/orders tied to that particular issue.",
            "evidence_terms": issue["evidence_terms"],
        }
        for issue in issues
    ]

    warnings = []
    if not documents:
        warnings.append("No case documents are attached; the journey is being read mainly from the saved case description.")
    if not issues:
        warnings.append("No specific legal issue was confidently detected from the available record.")
    if current["key"] == "unknown":
        warnings.append("Upload or describe the latest court order, hearing, reply, evidence, arguments, judgment, appeal, or execution step so WukaLAW can place the case on the journey.")

    return {
        "detected_issues": issues,
        "current_stage": current,
        "overall_progress": process_position,  # kept for existing clients
        "court_process_position": process_position,
        "position_label": "Court-process position",
        "progress_meaning": "A visual position in a generic court journey. It is not percent of time completed, not percent of work completed, and not a win probability.",
        "issue_progress": issue_progress,
        "next_generic_stage": ({"key": next_stage["key"], "label": next_stage["label"]} if next_stage else None),
        "stage_confidence": stage_confidence,
        "confidence_reason": confidence_reason,
        "documents_analyzed": len(documents),
        "document_titles": document_titles,
        "detected_stage_evidence": detected_stages,
        "journey_steps": journey_steps,
        "warnings": warnings,
        "disclaimer": "WukaLAW reads procedural clues from the available record. Verify the live stage and next listing against the latest court order or cause list.",
    }
