"""Build the auditable case profile used by AI and future outcome models.

This module intentionally performs no outcome prediction.  It separates the
client's account from verified documents and inventory-only evidence so every
downstream model receives the same labelled, reviewable input.
"""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Case, CaseEvent, Document, EvidenceFile


def build_case_intelligence_profile(db: Session, case: Case) -> dict:
    timeline = db.scalars(
        select(CaseEvent)
        .where(CaseEvent.case_id == case.id)
        .order_by(CaseEvent.event_date, CaseEvent.id)
    ).all()
    documents = db.scalars(
        select(Document)
        .where(Document.case_id == case.id)
        .order_by(Document.created_at, Document.id)
    ).all()
    evidence = db.scalars(
        select(EvidenceFile)
        .where(EvidenceFile.case_id == case.id)
        .order_by(EvidenceFile.created_at, EvidenceFile.id)
    ).all()

    verified_documents = [
        document
        for document in documents
        if not document.ocr_used or document.ocr_review_status == "verified"
    ]
    pending_ocr = [
        document
        for document in documents
        if document.ocr_used and document.ocr_review_status != "verified"
    ]
    titles_by_id = {document.id: document.title for document in documents}

    missing: list[str] = []
    if not (case.description or "").strip():
        missing.append("Add a clear case description and the result you are seeking.")
    if not timeline:
        missing.append("Add dated timeline entries for important events.")
    if not verified_documents:
        missing.append("Add at least one verified searchable document.")
    if not evidence:
        missing.append("Add supporting evidence files or record that none are available.")
    if not case.deadline:
        missing.append("Record the next known hearing, filing date or deadline.")
    if pending_ocr:
        missing.append(f"Review and verify OCR text for {len(pending_ocr)} document(s) before AI analysis.")

    return {
        "case": {
            "id": case.id,
            "case_number": case.case_number,
            "title": case.title,
            "case_type": case.case_type,
            "status": case.status,
            "priority": case.priority,
            "deadline": case.deadline,
        },
        # A description is the client's/lawyer's account, not a judicial finding.
        "client_account": (case.description or "").strip(),
        "timeline": [
            {
                "date": event.event_date,
                "statement": event.text,
                "linked_document_id": event.document_id,
                "linked_document_title": titles_by_id.get(event.document_id),
            }
            for event in timeline
        ],
        "verified_documents": [
            {
                "id": document.id,
                "title": document.title,
                "ocr_used": document.ocr_used,
                "has_summary": bool(document.summary),
            }
            for document in verified_documents
        ],
        "documents_pending_ocr_review": [
            {"id": document.id, "title": document.title} for document in pending_ocr
        ],
        # Media evidence is listed but not described as analysed unless a
        # future extraction/review process explicitly verifies its contents.
        "evidence_inventory": [
            {
                "id": item.id,
                "filename": item.filename,
                "media_type": item.media_type,
                "analysis_status": "inventory_only",
            }
            for item in evidence
        ],
        "readiness": {
            "ready_for_assisted_analysis": bool((case.description or "").strip() and verified_documents),
            "missing_information": missing,
        },
        "evidence_rules": {
            "client_account_is_verified_fact": False,
            "timeline_is_verified_fact": False,
            "unreviewed_ocr_excluded": True,
            "media_evidence_analysed": False,
        },
    }


def render_case_intelligence_profile(profile: dict) -> str:
    case = profile["case"]
    lines = [
        "Selected case intelligence profile:",
        f"- Case: {case['case_number']} — {case['title']}",
        f"- Type/status/priority: {case['case_type']} / {case['status']} / {case['priority']}",
        f"- Recorded deadline: {case['deadline'] or 'none'}",
        f"- Client account / case description (allegation/background, not proven fact): {profile['client_account'] or 'not provided'}",
    ]
    for event in profile["timeline"]:
        linked = f"; linked document: {event['linked_document_title']}" if event["linked_document_title"] else ""
        lines.append(f"- Timeline statement {event['date']}: {event['statement']}{linked}")
    if profile["verified_documents"]:
        lines.append(
            "- Verified searchable documents: "
            + ", ".join(document["title"] for document in profile["verified_documents"])
        )
    if profile["evidence_inventory"]:
        lines.append(
            "- Evidence inventory (files exist; contents not automatically verified): "
            + ", ".join(item["filename"] for item in profile["evidence_inventory"])
        )
    for warning in profile["readiness"]["missing_information"]:
        lines.append(f"- Missing/needs attention: {warning}")
    return "\n".join(lines)
