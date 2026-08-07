"""Document ingestion pipeline: extract -> clean -> adaptive chunk -> embed -> index."""

from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session

from ai.preprocessing.chunk import chunk_text
from ai.preprocessing.clean import clean_text
from ai.preprocessing.extract import SUPPORTED_EXTENSIONS, extract_text
from ai.retrieval import index as vector_index
from app.config import settings
from app.models import Chunk, Document
from app.services import s3_storage


def _validate_filename(filename: str) -> str:
    clean_name = Path(filename or "").name
    ext = Path(clean_name).suffix.lower()
    if ext not in SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed: .txt, .pdf",
        )
    return clean_name


def _validate_content(content: bytes) -> None:
    max_bytes = settings.max_upload_mb * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(status_code=400, detail=f"File exceeds {settings.max_upload_mb} MB limit.")
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")


def _ingest_bytes(
    db: Session,
    *,
    content: bytes,
    filename: str,
    owner_id: int,
    keep_local_copy: bool,
) -> Document:
    filename = _validate_filename(filename)
    _validate_content(content)
    ext = Path(filename).suffix.lower()

    # Always use a unique working path so simultaneous uploads cannot overwrite
    # one another. S3-backed uploads delete the local working copy afterwards.
    destination = settings.upload_dir / f"{uuid4().hex}_{filename}"
    destination.write_bytes(content)

    try:
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
            filename=filename,
            title=Path(filename).stem.replace("_", " ").replace("-", " ").strip(),
            size_bytes=len(content),
            text=text,
        )
        db.add(document)
        db.flush()  # assign document.id

        # Adaptive chunking: document length controls the retrieval window. There
        # is no arbitrary fixed chunk count, so a short pleading and a large book
        # scale differently while preserving useful overlap.
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
    finally:
        if not keep_local_copy:
            destination.unlink(missing_ok=True)


def ingest_upload(db: Session, file: UploadFile, owner_id: int) -> Document:
    filename = _validate_filename(file.filename or "")
    content = file.file.read()
    return _ingest_bytes(
        db,
        content=content,
        filename=filename,
        owner_id=owner_id,
        keep_local_copy=True,
    )


def ingest_s3_object(
    db: Session,
    *,
    object_key: str,
    filename: str,
    owner_id: int,
) -> Document:
    filename = _validate_filename(filename)
    try:
        metadata = s3_storage.head_object(owner_id, object_key)
    except s3_storage.S3StorageError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error

    size = int(metadata.get("ContentLength") or 0)
    max_bytes = settings.max_upload_mb * 1024 * 1024
    if size <= 0:
        raise HTTPException(status_code=422, detail="The S3 upload is empty or incomplete.")
    if size > max_bytes:
        raise HTTPException(status_code=400, detail=f"File exceeds {settings.max_upload_mb} MB limit.")

    try:
        content, _ = s3_storage.read_object(owner_id, object_key)
    except s3_storage.S3StorageError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error

    return _ingest_bytes(
        db,
        content=content,
        filename=filename,
        owner_id=owner_id,
        keep_local_copy=False,
    )
