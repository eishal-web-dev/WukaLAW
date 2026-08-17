"""OCR fallback for scanned/image PDFs.

Used when pypdf extracts too little text from a PDF (a strong signal the
PDF is a scan with no embedded text layer). Renders each page to an image
via pdf2image (poppler) and runs Tesseract over each page with pytesseract.

Both the system `tesseract-ocr` binary and poppler (for pdf2image) are
optional at runtime: if either is missing, `ocr_pdf` raises
`OcrUnavailableError` so the caller can fall back to the previous
"needs OCR" rejection message instead of a raw crash.

`settings.fake_ocr` swaps in a deterministic canned response for
tests/CI, the same pattern used by `FAKE_EMBEDDINGS` — real OCR needs the
tesseract binary and is too slow for a fast test suite.
"""
from __future__ import annotations

from pathlib import Path

from app.config import settings


class OcrUnavailableError(RuntimeError):
    """Raised when OCR was needed but tesseract/poppler aren't available,
    or when OCR ran but produced no usable text."""


def _fake_ocr(path: Path) -> str:
    """Deterministic stand-in for tests/CI: returns fixed text derived from
    the filename so different fixture files can produce distinguishable
    output without invoking a real OCR engine."""
    return (
        f"[FAKE OCR OUTPUT for {path.name}] "
        "This is placeholder text standing in for real Tesseract OCR output "
        "during tests. It exists only so the OCR fallback path can be "
        "exercised deterministically without the tesseract binary."
    )


def ocr_available() -> bool:
    """Best-effort check that the OCR dependencies are actually usable,
    without raising. Used to give a clear pre-flight error message."""
    if settings.fake_ocr:
        return True
    try:
        import pytesseract

        pytesseract.get_tesseract_version()
    except Exception:
        return False
    try:
        import pdf2image  # noqa: F401
    except ImportError:
        return False
    return True


def ocr_pdf(path: Path) -> str:
    """Run OCR over every page of a PDF and return the concatenated text.

    Raises OcrUnavailableError if tesseract/poppler aren't installed, or if
    OCR completes but produces no usable text (e.g. genuinely blank pages).
    """
    if settings.fake_ocr:
        return _fake_ocr(path)

    try:
        import pytesseract
        from pdf2image import convert_from_path
    except ImportError as exc:
        raise OcrUnavailableError(
            "OCR dependencies are not installed (need pytesseract + pdf2image/poppler)"
        ) from exc

    try:
        pytesseract.get_tesseract_version()
    except Exception as exc:
        raise OcrUnavailableError(
            "The tesseract-ocr system package is not installed or not on PATH"
        ) from exc

    try:
        images = convert_from_path(
            str(path),
            dpi=settings.ocr_dpi,
            last_page=settings.ocr_max_pages,
        )
    except Exception as exc:
        raise OcrUnavailableError(f"Could not render PDF pages for OCR: {exc}") from exc

    pages_text = [
        pytesseract.image_to_string(image, lang=settings.ocr_language)
        for image in images
    ]
    text = "\n".join(pages_text).strip()

    if not text:
        raise OcrUnavailableError("OCR completed but found no readable text on any page")

    return text
