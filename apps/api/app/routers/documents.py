from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ai.summarization.extractive import summarize
from app.auth import get_current_user
from app.db import get_db
from app.models import Chunk, Document, User
from app.schemas import DocumentList, DocumentMeta, DocumentOut, SummarizeResponse
from app.services.document_service import ingest_upload

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
    }


def _get_owned_document(db: Session, document_id: int, user: User) -> Document:
    document = db.get(Document, document_id)
    if document is None or document.owner_id != user.id:
        raise HTTPException(status_code=404, detail="Document not found.")
    return document


@router.post("/upload", response_model=DocumentMeta, status_code=201)
def upload_document(
    file: UploadFile,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    document = ingest_upload(db, file, owner_id=user.id)
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
