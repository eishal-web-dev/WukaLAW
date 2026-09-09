from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.db import get_db
from app.models import Document, GeneratedReport, User
from app.schemas import ReportDetailOut, ReportGenerateRequest, ReportOut

router = APIRouter(tags=["reports"])

REPORT_TYPES = {"case_summary": "Case Summary Report"}


def _build_case_summary_text(case, documents: list[Document]) -> str:
    """Builds a genuine plain-text report from real case and document data.
    No PDF-generation library exists in this backend's dependencies, and a
    real text report beats a fake 'PDF, 12 pages' claim with nothing
    behind it -- every line here comes from an actual database record."""
    lines = [
        f"CASE SUMMARY REPORT",
        f"{'=' * 40}",
        f"Case: {case.case_number} — {case.title}",
        f"Type: {case.case_type}",
        f"Status: {case.status}",
        f"Priority: {case.priority}",
    ]
    if case.deadline:
        lines.append(f"Deadline: {case.deadline}")
    if case.description:
        lines.append("")
        lines.append("Description:")
        lines.append(case.description)

    lines.append("")
    lines.append(f"Documents ({len(documents)})")
    lines.append("-" * 40)
    if not documents:
        lines.append("No documents have been added to this case yet.")
    for doc in documents:
        lines.append(f"\n• {doc.title} (added {doc.created_at.date().isoformat()})")
        if doc.summary:
            lines.append(f"  Summary: {doc.summary.get('short_summary', '')}")
            for fact in doc.summary.get("key_facts", []):
                lines.append(f"  - {fact}")
        else:
            lines.append("  (no AI summary generated for this document)")

    lines.append("")
    lines.append("-" * 40)
    lines.append(
        "This report was generated automatically from the case record and its "
        "documents at the time of generation. It is not legal advice."
    )
    return "\n".join(lines)


@router.post("/cases/{case_id}/reports", response_model=ReportDetailOut, status_code=201)
def generate_report(
    case_id: int,
    request: ReportGenerateRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    from app.routers.cases import _get_owned_case

    case = _get_owned_case(db, case_id, user)
    if request.report_type not in REPORT_TYPES:
        raise HTTPException(status_code=422, detail=f"report_type must be one of {sorted(REPORT_TYPES)}")

    documents = list(db.scalars(
        select(Document).where(Document.case_id == case.id).order_by(Document.created_at.desc())
    ).all())
    content = _build_case_summary_text(case, documents)

    report = GeneratedReport(
        case_id=case.id,
        requested_by_id=user.id,
        report_type=request.report_type,
        title=f"{REPORT_TYPES[request.report_type]} — {case.case_number}",
        content=content,
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return {
        "id": report.id,
        "case_id": case.id,
        "case_number": case.case_number,
        "report_type": report.report_type,
        "title": report.title,
        "created_at": report.created_at,
        "content": report.content,
    }


@router.get("/cases/{case_id}/reports", response_model=list[ReportOut])
def list_case_reports(case_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    from app.routers.cases import _get_owned_case

    case = _get_owned_case(db, case_id, user)
    reports = db.scalars(
        select(GeneratedReport).where(GeneratedReport.case_id == case.id).order_by(GeneratedReport.created_at.desc())
    ).all()
    return [
        {
            "id": r.id, "case_id": case.id, "case_number": case.case_number,
            "report_type": r.report_type, "title": r.title, "created_at": r.created_at,
        }
        for r in reports
    ]


@router.get("/reports", response_model=list[ReportOut])
def list_my_reports(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Every report the requesting user has generated, across all their
    cases -- this is what the Downloads page lists."""
    reports = db.scalars(
        select(GeneratedReport).where(GeneratedReport.requested_by_id == user.id).order_by(GeneratedReport.created_at.desc())
    ).all()
    from app.models import Case

    result = []
    for r in reports:
        case = db.get(Case, r.case_id)
        result.append({
            "id": r.id, "case_id": r.case_id, "case_number": case.case_number if case else "—",
            "report_type": r.report_type, "title": r.title, "created_at": r.created_at,
        })
    return result


@router.get("/reports/{report_id}", response_model=ReportDetailOut)
def get_report(report_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """A report is only visible to whoever generated it, or the lawyer who
    owns its case -- not just anyone who guesses an ID."""
    report = db.get(GeneratedReport, report_id)
    if report is None:
        raise HTTPException(status_code=404, detail="Report not found.")
    from app.routers.cases import _get_owned_case

    try:
        case = _get_owned_case(db, report.case_id, user)
    except HTTPException:
        raise HTTPException(status_code=404, detail="Report not found.")
    if report.requested_by_id != user.id and case.owner_id != user.id:
        raise HTTPException(status_code=404, detail="Report not found.")
    return {
        "id": report.id, "case_id": case.id, "case_number": case.case_number,
        "report_type": report.report_type, "title": report.title,
        "created_at": report.created_at, "content": report.content,
    }
