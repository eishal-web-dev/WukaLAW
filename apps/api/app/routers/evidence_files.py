"""Private case evidence uploads; binary media is never treated as AI text."""
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.config import settings
from app.db import get_db
from app.models import EvidenceFile, User
from app.routers.cases import _get_owned_case

router = APIRouter(prefix="/cases/{case_id}/evidence-files", tags=["evidence"])

ALLOWED = {
    ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp",
    ".pdf": "application/pdf", ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".doc": "application/msword", ".txt": "text/plain",
    ".mp3": "audio/mpeg", ".wav": "audio/wav", ".m4a": "audio/mp4", ".ogg": "audio/ogg",
    ".mp4": "video/mp4", ".mov": "video/quicktime", ".webm": "video/webm",
}
MAX_BYTES = 100 * 1024 * 1024


def _out(item: EvidenceFile) -> dict:
    return {"id": item.id, "case_id": item.case_id, "filename": item.filename,
            "media_type": item.media_type, "size_bytes": item.size_bytes, "created_at": item.created_at}


@router.get("")
def list_evidence_files(case_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _get_owned_case(db, case_id, user)
    items = db.scalars(select(EvidenceFile).where(EvidenceFile.case_id == case_id).order_by(EvidenceFile.created_at.desc())).all()
    return {"items": [_out(item) for item in items]}


@router.post("", status_code=201)
def upload_evidence_file(case_id: int, file: UploadFile = File(...), db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    case = _get_owned_case(db, case_id, user)
    if user.role == "client" and case.client_id != user.id:
        raise HTTPException(status_code=404, detail="Case not found.")
    filename = Path((file.filename or "").replace("\\", "/")).name
    extension = Path(filename).suffix.lower()
    if not filename or extension not in ALLOWED:
        raise HTTPException(status_code=400, detail="Supported evidence: images, PDF, Word, TXT, MP3, WAV, M4A, OGG, MP4, MOV, WEBM.")
    directory = settings.storage_dir / "case_evidence"
    directory.mkdir(parents=True, exist_ok=True)
    storage_name = uuid4().hex + extension
    destination = directory / storage_name
    size = 0
    try:
        with destination.open("wb") as output:
            while chunk := file.file.read(1024 * 1024):
                size += len(chunk)
                if size > MAX_BYTES:
                    raise HTTPException(status_code=413, detail="Evidence file exceeds 100 MB. Upload a smaller file.")
                output.write(chunk)
        if not size:
            raise HTTPException(status_code=400, detail="Evidence file is empty.")
        item = EvidenceFile(case_id=case_id, uploaded_by_id=user.id, filename=filename[:255],
                            storage_name=storage_name, media_type=ALLOWED[extension], size_bytes=size)
        db.add(item)
        db.commit()
        db.refresh(item)
        return _out(item)
    except Exception:
        destination.unlink(missing_ok=True)
        db.rollback()
        raise


@router.get("/{evidence_id}/download")
def download_evidence_file(case_id: int, evidence_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _get_owned_case(db, case_id, user)
    item = db.get(EvidenceFile, evidence_id)
    if item is None or item.case_id != case_id:
        raise HTTPException(status_code=404, detail="Evidence file not found.")
    path = settings.storage_dir / "case_evidence" / item.storage_name
    if not path.is_file():
        raise HTTPException(status_code=404, detail="Evidence file is missing from local storage.")
    return FileResponse(path, media_type=item.media_type, filename=item.filename)
