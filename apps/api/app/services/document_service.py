"""Document ingestion pipeline: extract -> clean -> adaptive chunk -> embed -> index."""

from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session

from ai.preprocessing.chunk import chunk_text
from ai.preprocessing.clean import clean_text
from ai.preprocessing.extract import SUPPORTED_EXTENSIONS, extract_text
from ai.preprocessing.ocr import OcrUnavailableError, ocr_pdf
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


def _validate_size(size_bytes: int, *, max_mb: int) -> None:
    max_bytes = max_mb * 1024 * 1024
    if size_bytes > max_bytes:
        raise HTTPException(status_code=400, detail=f"File exceeds {max_mb} MB limit.")
    if size_bytes <= 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")


def _extract_with_ocr_fallback(source_path: Path) -> tuple[str, bool]:
    """Extract text, falling back to OCR for PDFs with too little embedded
    text. Returns (cleaned_text, ocr_used)."""
    try:
        raw = extract_text(source_path)
    except Exception as error:  # corrupt PDF etc.
        raise HTTPException(status_code=422, detail=f"Could not extract text: {error}") from error

    text = clean_text(raw)
    if len(text.split()) >= settings.ocr_min_words:
        return text, False

    is_pdf = source_path.suffix.lower() == ".pdf"
    if not is_pdf:
        raise HTTPException(
            status_code=422,
            detail="The document contains too little extractable text.",
        )
    if not settings.ocr_enabled:
        raise HTTPException(
            status_code=422,
            detail="The document contains too little extractable text (looks like a scanned PDF, and OCR is currently disabled).",
        )

    try:
        ocr_raw = ocr_pdf(source_path)
    except OcrUnavailableError as error:
        raise HTTPException(
            status_code=422,
            detail=(
                "The document looks like a scanned PDF with no embedded text, and OCR could not "
                f"recover readable text ({error}). Try a text-based PDF or a higher-quality scan."
            ),
        ) from error

    ocr_text = clean_text(ocr_raw)
    if len(ocr_text.split()) < settings.ocr_min_words:
        raise HTTPException(
            status_code=422,
            detail="OCR ran on this scanned PDF but still found too little readable text. "
            "Try a higher-resolution scan.",
        )

    return ocr_text, True


def _index_extracted_document(
    db: Session,
    *,
    source_path: Path,
    filename: str,
    owner_id: int,
    size_bytes: int,
) -> Document:
    text, ocr_used = _extract_with_ocr_fallback(source_path)

    document = Document(
        owner_id=owner_id,
        filename=filename,
        title=Path(filename).stem.replace("_", " ").replace("-", " ").strip(),
        size_bytes=size_bytes,
        text=text,
        ocr_used=ocr_used,
    )
    db.add(document)
    db.flush()  # assign document.id

    # Adaptive chunking: the number and size of chunks are derived from this
    # document's extracted length; there is no fixed arbitrary chunk count.
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


def ingest_upload(db: Session, file: UploadFile, owner_id: int) -> Document:
    """Local/development multipart upload. Kept intentionally smaller than S3."""
    filename = _validate_filename(file.filename or "")
    content = file.file.read()
    _validate_size(len(content), max_mb=settings.max_upload_mb)

    destination = settings.upload_dir / f"{uuid4().hex}_{filename}"
    destination.write_bytes(content)
    return _index_extracted_document(
        db,
        source_path=destination,
        filename=filename,
        owner_id=owner_id,
        size_bytes=len(content),
    )


def ingest_s3_object(
    db: Session,
    *,
    object_key: str,
    filename: str,
    owner_id: int,
) -> Document:
    """Stream a completed private S3 upload to disk, then index it for AI search."""
    filename = _validate_filename(filename)
    try:
        metadata = s3_storage.head_object(owner_id, object_key)
    except s3_storage.S3StorageError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error

    size = int(metadata.get("ContentLength") or 0)
    _validate_size(size, max_mb=settings.max_s3_upload_mb)

    destination = settings.upload_dir / f"s3_{uuid4().hex}_{filename}"
    try:
        try:
            s3_storage.download_object(owner_id, object_key, destination)
        except s3_storage.S3StorageError as error:
            raise HTTPException(status_code=422, detail=str(error)) from error

        return _index_extracted_document(
            db,
            source_path=destination,
            filename=filename,
            owner_id=owner_id,
            size_bytes=size,
        )
    finally:
        # S3 is the durable source; the backend working copy is temporary.
        destination.unlink(missing_ok=True)
