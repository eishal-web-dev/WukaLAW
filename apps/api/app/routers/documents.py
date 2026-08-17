from pathlib import Path

from fastapi import APIRouter, Depends, Form, HTTPException, UploadFile
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ai.citations.extract import extract_citations
from ai.preprocessing.extract import SUPPORTED_EXTENSIONS
from ai.summarization.extractive import summarize
from ai.timeline.extract import extract_events
from app.auth import get_current_user
from app.config import settings
from app.db import get_db
from app.models import Chunk, Document, User
from app.schemas import (
    CitationsResponse,
    DocumentList,
    DocumentMeta,
    DocumentOut,
    SummarizeResponse,
    TimelineResponse,
)
from app.services import s3_storage
from app.services.document_service import ingest_s3_object, ingest_upload

router = APIRouter(prefix="/documents", tags=["documents"])


def _meta(document: Document, num_chunks: int) -> dict:
    return {
        "id": document.id,
        "filename": document.filename,
        "title": document.title,
        "size_bytes": document.size_bytes,
        "num_chunks": num_chunks,
        "created_at": document.created_at,
        "has_summary": document.summary is not None,
        "ocr_used": document.ocr_used,
    }


def _get_owned_document(db: Session, document_id: int, user: User) -> Document:
    document = db.get(Document, document_id)
    if document is None or document.owner_id != user.id:
        raise HTTPException(status_code=404, detail="Document not found.")
    return document


def _attach_to_case(db: Session, document: Document, case_id: int, user: User) -> None:
    from app.models import Case

    case = db.get(Case, case_id)
    if case is None or case.owner_id != user.id:
        raise HTTPException(status_code=404, detail="Case not found.")
    document.case_id = case_id
    db.commit()


@router.post("/upload", response_model=DocumentMeta, status_code=201)
def upload_document(
    file: UploadFile,
    case_id: int | None = Form(default=None),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Legacy/local multipart upload. Production browsers can use S3 presign flow."""
    document = ingest_upload(db, file, owner_id=user.id)
    if case_id is not None:
        _attach_to_case(db, document, case_id, user)
    return _meta(document, len(document.chunks))


class PresignUploadRequest(BaseModel):
    filename: str = Field(min_length=1, max_length=255)
    content_type: str = Field(default="application/octet-stream", min_length=1, max_length=200)
    size_bytes: int = Field(gt=0)


class PresignUploadResponse(BaseModel):
    upload_url: str
    object_key: str
    expires_in: int
    headers: dict[str, str]


@router.post("/presign-upload", response_model=PresignUploadResponse)
def presign_document_upload(
    request: PresignUploadRequest,
    user: User = Depends(get_current_user),
):
    """Create a short-lived PUT URL so the browser uploads straight to private S3."""
    if not s3_storage.enabled():
        raise HTTPException(status_code=503, detail="AWS S3 document storage is not configured.")

    ext = Path(request.filename).suffix.lower()
    if ext not in SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed: .txt, .pdf",
        )
    max_bytes = settings.max_s3_upload_mb * 1024 * 1024
    if request.size_bytes > max_bytes:
        raise HTTPException(status_code=400, detail=f"File exceeds {settings.max_s3_upload_mb} MB S3 limit.")

    try:
        upload = s3_storage.create_presigned_upload(
            user.id,
            request.filename,
            request.content_type,
        )
    except s3_storage.S3StorageError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error

    return PresignUploadResponse(
        upload_url=upload.upload_url,
        object_key=upload.object_key,
        expires_in=upload.expires_in,
        headers=upload.headers,
    )


class CompleteS3UploadRequest(BaseModel):
    object_key: str = Field(min_length=1, max_length=1024)
    filename: str = Field(min_length=1, max_length=255)
    case_id: int | None = None


@router.post("/complete-s3-upload", response_model=DocumentMeta, status_code=201)
def complete_s3_document_upload(
    request: CompleteS3UploadRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Verify the user's S3 object and run the normal adaptive AI ingestion pipeline."""
    if not s3_storage.enabled():
        raise HTTPException(status_code=503, detail="AWS S3 document storage is not configured.")

    document = ingest_s3_object(
        db,
        object_key=request.object_key,
        filename=request.filename,
        owner_id=user.id,
    )
    if request.case_id is not None:
        _attach_to_case(db, document, request.case_id, user)
    return _meta(document, len(document.chunks))


class DocumentUpdate(BaseModel):
    case_id: int | None = None
    title: str | None = None


@router.patch("/{document_id}", response_model=DocumentMeta)
def update_document(
    document_id: int,
    request: DocumentUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    document = _get_owned_document(db, document_id, user)
    if request.case_id is not None:
        _attach_to_case(db, document, request.case_id, user)
    if request.title is not None:
        document.title = request.title.strip()
        db.commit()
    db.refresh(document)
    return _meta(document, len(document.chunks))


@router.get("", response_model=DocumentList)
def list_documents(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    documents = db.scalars(
        select(Document).where(Document.owner_id == user.id).order_by(Document.created_at.desc())
    ).all()
    counts = dict(
        db.execute(select(Chunk.document_id, func.count()).group_by(Chunk.document_id)).all()
    )
    items = [_meta(document, counts.get(document.id, 0)) for document in documents]
    return {"items": items, "total": len(items)}


@router.get("/{document_id}", response_model=DocumentOut)
def get_document(
    document_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    document = _get_owned_document(db, document_id, user)
    return {**_meta(document, len(document.chunks)), "text": document.text, "summary": document.summary}


@router.get("/{document_id}/timeline", response_model=TimelineResponse)
def document_timeline(
    document_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    document = _get_owned_document(db, document_id, user)
    events = extract_events(document.text)
    return {
        "events": [
            {**event.__dict__, "document_id": document.id, "document_title": document.title}
            for event in events
        ]
    }


@router.get("/{document_id}/citations", response_model=CitationsResponse)
def document_citations(
    document_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    document = _get_owned_document(db, document_id, user)
    return {"citations": [citation.__dict__ for citation in extract_citations(document.text)]}


@router.post("/{document_id}/summarize", response_model=SummarizeResponse)
def summarize_document(
    document_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    document = _get_owned_document(db, document_id, user)
    if document.summary is None:
        document.summary = summarize(document.text)
        db.commit()
    return {"document_id": document.id, "summary": document.summary}
