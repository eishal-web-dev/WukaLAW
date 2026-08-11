"""Document ingestion and safe OCR reprocessing through the shared AI index."""
from __future__ import annotations

from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session

from ai.ocr.engines import TesseractUnavailable
from ai.ocr.service import OCRResult, OCRService, SUPPORTED_EXTENSIONS
from ai.preprocessing.chunk import chunk_text
from ai.preprocessing.clean import clean_text
from ai.retrieval import index as vector_index
from app.config import settings
from app.models import Chunk, Document
from app.services import s3_storage

MIME_TYPES = {
    ".txt": {"text/plain"}, ".pdf": {"application/pdf"},
    ".jpg": {"image/jpeg"}, ".jpeg": {"image/jpeg"},
    ".png": {"image/png"}, ".webp": {"image/webp"},
}


def _validate_filename(filename: str) -> str:
    name = Path(filename or "").name
    if Path(name).suffix.lower() not in SUPPORTED_EXTENSIONS:
        raise HTTPException(400, detail="Unsupported file type. Allowed: PDF, TXT, JPG, JPEG, PNG, WEBP")
    return name


def _validate_mime(filename: str, content_type: str | None) -> None:
    allowed = MIME_TYPES[Path(filename).suffix.lower()]
    if content_type and content_type not in {"application/octet-stream"} | allowed:
        raise HTTPException(400, detail="File content type does not match its extension.")


def _validate_size(size_bytes: int, *, max_mb: int) -> None:
    if size_bytes <= 0:
        raise HTTPException(400, detail="Uploaded file is empty.")
    if size_bytes > max_mb * 1024 * 1024:
        raise HTTPException(400, detail=f"File exceeds {max_mb} MB limit.")


def _extract(path: Path, language: str) -> OCRResult:
    try:
        return OCRService().extract(path, language)
    except TesseractUnavailable:
        return OCRResult("", "unknown", "tesseract", None, "ocr", "poor", [], [
            "Local OCR is unavailable. Ask an administrator to install the requested OCR language support."
        ])
    except (ValueError, RuntimeError) as error:
        raise HTTPException(422, detail=str(error)) from error
    except Exception as error:
        raise HTTPException(422, detail="Could not read this document.") from error


def _prepare(result: OCRResult) -> tuple[str, list[tuple], dict]:
    page_chunks = []
    cleaned_pages = []
    for page in result.pages:
        cleaned = clean_text(page.text)
        if cleaned:
            cleaned_pages.append(cleaned)
        for piece in chunk_text(cleaned):
            page_chunks.append((page, piece))
    text = "\n\n".join(cleaned_pages)
    metadata = result.metadata()
    warnings = metadata["processing_warnings"]
    if not text:
        metadata["indexing_status"] = "skipped_empty"
        metadata["processing_status"] = "extraction_failed"
        warnings.append("No readable text was extracted; the document was stored but not indexed.")
    elif warnings or result.quality in {"poor", "review_recommended"}:
        metadata["processing_status"] = "ready_with_warning"
    else:
        metadata["processing_status"] = "ready"
    return text, page_chunks, metadata


def _new_chunks(document: Document, page_chunks: list[tuple]) -> list[Chunk]:
    return [Chunk(
        document_id=document.id, position=index, text=piece.text,
        page=page.page, extraction_method=page.extraction_method,
    ) for index, (page, piece) in enumerate(page_chunks)]


def _index(db: Session, document: Document, chunks: list[Chunk], metadata: dict) -> None:
    if not chunks:
        document.processing_metadata = metadata
        db.commit()
        return
    try:
        vector_index.add_chunks(
            [chunk.id for chunk in chunks], [chunk.text for chunk in chunks],
            owner_id=document.owner_id, document_id=document.id, document_title=document.title,
            chunk_metadata=[{"case_id": document.case_id, "page": chunk.page,
                             "extraction_method": chunk.extraction_method} for chunk in chunks],
        )
        metadata["indexing_status"] = "indexed"
    except Exception:
        metadata["indexing_status"] = "failed"
        metadata["processing_status"] = "indexing_failed"
        metadata["processing_warnings"].append("Text was saved, but AI search indexing is temporarily unavailable.")
    document.processing_metadata = metadata
    db.commit()
    db.refresh(document)


def _create_document(db: Session, *, result: OCRResult, filename: str, owner_id: int,
                     size_bytes: int, case_id: int | None, source_backend: str,
                     source_ref: str, ocr_language: str) -> Document:
    text, page_chunks, metadata = _prepare(result)
    metadata.update({"_source_backend": source_backend, "_source_ref": source_ref,
                     "_requested_ocr_language": ocr_language})
    if text and len(text.split()) < 20 and result.extraction_method not in {"ocr", "hybrid"}:
        raise HTTPException(422, detail="The document contains too little extractable text.")
    document = Document(
        owner_id=owner_id, case_id=case_id, filename=filename,
        title=Path(filename).stem.replace("_", " ").replace("-", " ").strip(),
        size_bytes=size_bytes, text=text, processing_metadata=metadata,
    )
    db.add(document)
    db.flush()
    chunks = _new_chunks(document, page_chunks)
    db.add_all(chunks)
    db.commit()
    db.refresh(document)
    _index(db, document, chunks, metadata)
    return document


def ingest_upload(db: Session, file: UploadFile, owner_id: int, case_id: int | None = None,
                  ocr_language: str = "auto") -> Document:
    filename = _validate_filename(file.filename or "")
    _validate_mime(filename, file.content_type)
    content = file.file.read()
    _validate_size(len(content), max_mb=settings.max_upload_mb)
    destination = settings.upload_dir / f"{uuid4().hex}_{filename}"
    destination.write_bytes(content)
    return _create_document(
        db, result=_extract(destination, ocr_language), filename=filename,
        owner_id=owner_id, size_bytes=len(content), case_id=case_id,
        source_backend="local", source_ref=destination.name, ocr_language=ocr_language,
    )


def ingest_s3_object(db: Session, *, object_key: str, filename: str, owner_id: int,
                     case_id: int | None = None, ocr_language: str = "auto") -> Document:
    filename = _validate_filename(filename)
    try:
        head = s3_storage.head_object(owner_id, object_key)
    except s3_storage.S3StorageError as error:
        raise HTTPException(422, detail=str(error)) from error
    _validate_mime(filename, head.get("ContentType"))
    size = int(head.get("ContentLength") or 0)
    _validate_size(size, max_mb=settings.max_s3_upload_mb)
    destination = settings.upload_dir / f"s3_{uuid4().hex}_{filename}"
    try:
        s3_storage.download_object(owner_id, object_key, destination)
        return _create_document(
            db, result=_extract(destination, ocr_language), filename=filename,
            owner_id=owner_id, size_bytes=size, case_id=case_id,
            source_backend="s3", source_ref=object_key, ocr_language=ocr_language,
        )
    except s3_storage.S3StorageError as error:
        raise HTTPException(422, detail=str(error)) from error
    finally:
        destination.unlink(missing_ok=True)


def _source_copy(document: Document) -> tuple[Path, bool]:
    metadata = document.processing_metadata or {}
    backend, reference = metadata.get("_source_backend"), metadata.get("_source_ref")
    if backend == "local" and reference:
        path = settings.upload_dir / Path(reference).name
        if path.is_file():
            return path, False
    if backend == "s3" and reference:
        path = settings.upload_dir / f"retry_{uuid4().hex}_{document.filename}"
        try:
            s3_storage.download_object(document.owner_id, reference, path)
        except s3_storage.S3StorageError as error:
            raise HTTPException(422, detail="The original stored document could not be read.") from error
        return path, True
    candidates = sorted(settings.upload_dir.glob(f"*_{document.filename}"), key=lambda item: item.stat().st_mtime, reverse=True)
    if candidates:
        return candidates[0], False
    raise HTTPException(409, detail="The original file is unavailable for reprocessing. Upload it again.")


def reprocess_document(db: Session, document: Document, ocr_language: str = "auto") -> Document:
    path, temporary = _source_copy(document)
    try:
        result = _extract(path, ocr_language)
        text, page_chunks, metadata = _prepare(result)
        previous = dict(document.processing_metadata or {})
        for key in ("_source_backend", "_source_ref"):
            if key in previous:
                metadata[key] = previous[key]
        metadata["_requested_ocr_language"] = ocr_language
        old_ids = [chunk.id for chunk in document.chunks]
        try:
            vector_index.delete_chunks(old_ids)
        except Exception as error:
            raise HTTPException(503, detail="AI index cleanup is temporarily unavailable; the existing document was kept unchanged.") from error
        for chunk in list(document.chunks):
            db.delete(chunk)
        db.flush()
        document.text = text
        document.summary = None
        document.processing_metadata = metadata
        chunks = _new_chunks(document, page_chunks)
        db.add_all(chunks)
        db.commit()
        db.refresh(document)
        _index(db, document, chunks, metadata)
        return document
    finally:
        if temporary:
            path.unlink(missing_ok=True)
