"""Document ingestion pipeline: save -> extract -> clean -> chunk -> embed -> index."""

from pathlib import Path

from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session

from ai.preprocessing.chunk import chunk_text
from ai.preprocessing.clean import clean_text
from ai.preprocessing.extract import SUPPORTED_EXTENSIONS, extract_text
from ai.retrieval import index as vector_index
from app.config import settings
from app.models import Chunk, Document


def ingest_upload(db: Session, file: UploadFile, owner_id: int) -> Document:
    ext = Path(file.filename or "").suffix.lower()
    if ext not in SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed: .txt, .pdf",
        )

    content = file.file.read()
    max_bytes = settings.max_upload_mb * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(status_code=400, detail=f"File exceeds {settings.max_upload_mb} MB limit.")
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    destination = settings.upload_dir / (file.filename or f"upload{ext}")
    destination.write_bytes(content)

    try:
        raw = extract_text(destination)
    except Exception as error:  # corrupt PDF etc.
        raise HTTPException(status_code=422, detail=f"Could not extract text: {error}") from error

    text = clean_text(raw)
    if len(text.split()) < 20:
        raise HTTPException(
            status_code=422,
            detail="The document contains too little extractable text (scanned PDFs need OCR, which is future scope).",
        )

    document = Document(
        owner_id=owner_id,
        filename=file.filename or destination.name,
        title=Path(file.filename or destination.name).stem.replace("_", " ").replace("-", " ").strip(),
        size_bytes=len(content),
        text=text,
    )
    db.add(document)
    db.flush()  # assign document.id

    # Adaptive chunking: document length controls the retrieval window. There is
    # no arbitrary fixed chunk count, so a short pleading and a large book scale
    # differently while preserving useful overlap.
    pieces = chunk_text(text)
    chunks = [
        Chunk(document_id=document.id, position=piece.position, text=piece.text)
        for piece in pieces
    ]
    db.add_all(chunks)
    db.flush()  # assign chunk ids

    chunk_ids = [chunk.id for chunk in chunks]
    try:
        vector_index.add_chunks(
            chunk_ids,
            [chunk.text for chunk in chunks],
            owner_id=owner_id,
            document_id=document.id,
            document_title=document.title,
        )
        db.commit()
    except Exception as error:
        # Keep SQL and vector state consistent if either side fails.
        try:
            vector_index.delete_chunks(chunk_ids)
        except Exception:
            pass
        db.rollback()
        raise HTTPException(
            status_code=503,
            detail=f"Document was extracted but could not be indexed for AI search: {error}",
        ) from error

    db.refresh(document)
    return document
