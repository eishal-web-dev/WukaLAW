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

import os
import shutil
from pathlib import Path

from app.config import settings


class OcrUnavailableError(RuntimeError):
    """Raised when OCR was needed but tesseract/poppler aren't available,
    or when OCR ran but produced no usable text."""


def _configure_tesseract(pytesseract) -> str:
    """Locate the native executable, including standard Windows installs."""
    configured = settings.tesseract_cmd.strip()
    candidates = [configured] if configured else []
    executable = shutil.which("tesseract")
    if executable:
        candidates.append(executable)
    for variable in ("ProgramFiles", "ProgramFiles(x86)", "LOCALAPPDATA"):
        base = os.environ.get(variable)
        if base:
            candidates.append(str(Path(base) / "Tesseract-OCR" / "tesseract.exe"))
    for candidate in candidates:
        if candidate and Path(candidate).is_file():
            try:
                pytesseract.pytesseract.tesseract_cmd = candidate
            except AttributeError as exc:
                raise OcrUnavailableError("The pytesseract installation is incomplete.") from exc
            return candidate
    if configured:
        raise OcrUnavailableError(f"TESSERACT_CMD points to a missing file: {configured}")
    raise OcrUnavailableError(
        "Tesseract executable was not found. Install Tesseract OCR, add it to PATH, "
        "or set TESSERACT_CMD in .env (usually C:\\Program Files\\Tesseract-OCR\\tesseract.exe)."
    )


def _check_tesseract(pytesseract) -> None:
    _configure_tesseract(pytesseract)
    try:
        pytesseract.get_tesseract_version()
    except Exception as exc:
        raise OcrUnavailableError("Tesseract was found but could not be started.") from exc


def _check_languages(pytesseract) -> None:
    """Fail clearly instead of silently reading Urdu with the English model."""
    requested = {lang.strip() for lang in settings.ocr_language.split("+") if lang.strip()}
    try:
        installed = set(pytesseract.get_languages(config=""))
    except Exception as exc:
        raise OcrUnavailableError("Tesseract language models could not be checked.") from exc
    missing = requested - installed
    if missing:
        names = ", ".join(sorted(missing))
        hint = (
            "Install the Urdu language data (urd.traineddata) in Tesseract's tessdata folder. "
            "On Windows, rerun the Tesseract installer and select Urdu under Additional language data."
            if "urd" in missing
            else "Install the missing Tesseract traineddata file(s)."
        )
        raise OcrUnavailableError(f"Missing Tesseract OCR language model(s): {names}. {hint}")


def _prepare_tesseract(pytesseract) -> None:
    _check_tesseract(pytesseract)
    _check_languages(pytesseract)


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

        _prepare_tesseract(pytesseract)
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
        _prepare_tesseract(pytesseract)
    except OcrUnavailableError:
        raise

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


def ocr_image(path: Path) -> str:
    """Read text in an image, with the same local OCR requirement as PDFs."""
    if settings.fake_ocr:
        return _fake_ocr(path)
    try:
        import pytesseract
        from PIL import Image, UnidentifiedImageError
    except ImportError as exc:
        raise OcrUnavailableError("Image OCR Python packages are missing; reinstall backend requirements.") from exc
    try:
        _prepare_tesseract(pytesseract)
        try:
            with Image.open(path) as image:
                image.verify()
        except (OSError, UnidentifiedImageError) as exc:
            raise OcrUnavailableError("The uploaded file is not a readable image or is corrupted.") from exc
        with Image.open(path) as image:
            text = pytesseract.image_to_string(image, lang=settings.ocr_language).strip()
        if not text:
            raise OcrUnavailableError("OCR ran successfully but found no readable text in this image. Upload it as Evidence instead.")
        return text
    except OcrUnavailableError:
        raise
    except Exception as exc:
        raise OcrUnavailableError(f"Tesseract could not read this image: {type(exc).__name__}") from exc
