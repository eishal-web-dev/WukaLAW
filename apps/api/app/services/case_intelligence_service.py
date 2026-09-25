"""Build the auditable case profile used by AI and future outcome models.

This module intentionally performs no outcome prediction.  It separates the
client's account from verified documents and inventory-only evidence so every
downstream model receives the same labelled, reviewable input.
"""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Case, CaseEvent, Document, EvidenceFile


def build_case_pathway_guidance(case: Case) -> dict:
    """Return a conservative, useful pathway when an AI provider is unavailable.

    This is intentionally procedural preparation guidance, not an outcome
    prediction.  It is based only on the broad matter indicated by the saved
    case record and clearly marks matters that must be checked against the
    latest court order.
    """
    searchable = " ".join(
        value for value in (case.title, case.case_type, case.description) if value
    ).casefold()

    if any(term in searchable for term in ("child custody", "custody", "guardianship", "visitation", "minor child")):
        matter = "Child custody / guardianship"
        next_steps = [
            "Check the latest court order and confirm the next hearing, filing deadline, and any current custody or visitation arrangement.",
            "Prepare or review the application, reply, and any response to the other party's allegations with your lawyer.",
            "Be ready for the court to consider an interim custody or visitation arrangement while the case continues.",
            "Organise evidence about the child's day-to-day care, safety, education, health, stability, and relationship with each parent or caregiver.",
            "Prepare for evidence and witness stages if directed, followed by an order and any compliance or follow-up hearings.",
        ]
        preparation = [
            "Child's birth certificate or B-Form and proof of your relationship to the child.",
            "All existing custody, guardianship, visitation, maintenance, protection, or other relevant court orders.",
            "School attendance, progress, medical records, and details of the child's current routine and special needs.",
            "A clear care plan covering residence, schooling, healthcare, transport, contact, and safe handovers.",
            "A dated, factual communication and visitation log; preserve original messages, call records, and documents.",
            "Names of witnesses with first-hand knowledge of the child's care; avoid coaching the child or altering evidence.",
        ]
        confirmations = [
            "Whether an interim or final custody/visitation order already exists.",
            "Who currently has physical care of the child and whether contact is being allowed.",
            "The child's age, schooling, health or safety needs, and the exact relief requested.",
        ]
    elif any(term in searchable for term in ("haq mehr", "haq meher", "mehr", "meher", "dower")):
        matter = "Dower / mehr recovery"
        next_steps = [
            "Confirm the latest order, next hearing, and whether a reply or evidence has been requested.",
            "Review the nikahnama and identify the recorded amount or property, and whether it is prompt or deferred.",
            "Organise evidence about payment, non-payment, possession, and each side's account.",
            "Prepare documents and first-hand witnesses for the evidence stage, then track any order and enforcement steps with your lawyer.",
        ]
        preparation = [
            "Original or certified nikahnama and readable verified translation where needed.",
            "Bank records, receipts, messages, admissions, or other proof concerning payment or non-payment.",
            "A dated chronology and the exact amount or property still claimed.",
            "Copies of pleadings, replies, and every interim or final court order.",
        ]
        confirmations = [
            "The exact dower terms recorded in the nikahnama.",
            "What the opposing party says was already paid or transferred.",
            "The next court direction and filing deadline.",
        ]
    elif any(term in searchable for term in ("dowry", "jahez", "jahaiz", "bridal gift", "jewellery", "jewelry")):
        matter = "Dowry / personal property recovery"
        next_steps = [
            "Confirm the latest court direction and the precise property or value being claimed.",
            "Prepare an item-by-item inventory and the opposing party's response about possession or return.",
            "Organise documentary and witness evidence, then prepare for the evidence stage and any recovery or compliance order.",
        ]
        preparation = [
            "An itemised list with descriptions, approximate dates, values, and who supplied each item.",
            "Receipts, photographs, wedding lists, videos, messages, and demands for return in their original form.",
            "Witnesses with first-hand knowledge of purchase, delivery, possession, or refusal to return items.",
            "Copies of pleadings and all court orders, with disputed items clearly marked.",
        ]
        confirmations = [
            "Which items are admitted, disputed, returned, missing, or claimed to belong to someone else.",
            "Whether the court has directed an inventory, reply, evidence, or recovery process.",
        ]
    elif any(term in searchable for term in ("maintenance", "nafaqah", "nafaqa", "child support")):
        matter = "Maintenance"
        next_steps = [
            "Confirm whether interim maintenance or another temporary direction has already been requested or ordered.",
            "Organise evidence of reasonable monthly needs, prior payments, and the other party's means where lawfully available.",
            "Prepare for reply, evidence, and compliance stages according to the latest court order.",
        ]
        preparation = [
            "A realistic monthly expense schedule supported by school, medical, housing, food, and transport records.",
            "Proof of relationship or dependency and records of payments received or missed.",
            "Copies of pleadings, income-related material lawfully available, and all existing orders.",
        ]
        confirmations = [
            "Who maintenance is claimed for and from what date.",
            "Whether an interim amount, payment schedule, or arrears figure has already been ordered.",
        ]
    else:
        matter = case.case_type or "Civil matter"
        next_steps = [
            "Check the latest court order and confirm the next hearing, filing deadline, and purpose of the next date.",
            "Review the claim, reply, disputed facts, and the exact relief requested with your lawyer.",
            "Organise admissible documents and first-hand witnesses for the next directed procedural stage.",
        ]
        preparation = [
            "A dated chronology with each important event linked to a document or witness where possible.",
            "Complete pleadings, replies, notices, orders, and original supporting records.",
            "A short list of admitted facts, disputed facts, missing evidence, and questions for your lawyer.",
        ]
        confirmations = [
            "The purpose of the next hearing and every deadline in the latest order.",
            "The other party's current position and the exact relief each side seeks.",
        ]

    status = (case.status or "").strip()
    if status in {"Active", "Review", "Currently Going On"}:
        stage = "Currently Going On"
    elif status == "Closed":
        stage = "Case Complete"
    else:
        stage = status or "Started"

    return {
        "matter": matter,
        "case_stage": stage,
        "next_steps": next_steps,
        "preparation_checklist": preparation,
        "needs_confirmation": confirmations,
    }


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
