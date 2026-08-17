"""Tests for the OCR fallback: ai/preprocessing/ocr.py and its wiring into
document_service._extract_with_ocr_fallback.

Most tests use FAKE_OCR=1 (set globally in conftest.py) for speed and
determinism. test_real_ocr_recovers_text_from_a_scanned_pdf is the
exception: it builds an actual image-based PDF and runs real Tesseract
over it, skipping if tesseract isn't installed, to prove the feature
genuinely works end to end rather than just being wired up correctly.
"""
from pathlib import Path

import pytest
from fastapi import HTTPException

import app.config as config_module
from ai.preprocessing import ocr as ocr_module
from app.services.document_service import _extract_with_ocr_fallback


# ---------------------------------------------------------------------------
# ai/preprocessing/ocr.py — unit tests
# ---------------------------------------------------------------------------


def test_fake_ocr_is_deterministic_and_mentions_the_filename(tmp_path):
    pdf_path = tmp_path / "scan.pdf"
    pdf_path.write_bytes(b"%PDF-fake")

    text = ocr_module.ocr_pdf(pdf_path)

    assert "scan.pdf" in text
    assert ocr_module.ocr_pdf(pdf_path) == text  # deterministic


def test_ocr_available_is_true_under_fake_mode():
    assert ocr_module.ocr_available() is True


def test_ocr_unavailable_when_tesseract_binary_missing(tmp_path, monkeypatch):
    monkeypatch.setattr(config_module.settings, "fake_ocr", False)

    class _BrokenPytesseract:
        @staticmethod
        def get_tesseract_version():
            raise FileNotFoundError("tesseract is not installed")

    monkeypatch.setitem(__import__("sys").modules, "pytesseract", _BrokenPytesseract())

    pdf_path = tmp_path / "scan.pdf"
    pdf_path.write_bytes(b"%PDF-fake")

    assert ocr_module.ocr_available() is False
    with pytest.raises(ocr_module.OcrUnavailableError):
        ocr_module.ocr_pdf(pdf_path)


def _build_scanned_pdf(tmp_path: Path, text: str) -> Path:
    """Renders `text` onto a blank page as an image, then saves it as a
    PDF with no embedded text layer — i.e. a realistic scanned document."""
    from PIL import Image, ImageDraw, ImageFont

    image = Image.new("RGB", (1200, 400), color="white")
    draw = ImageDraw.Draw(image)
    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 48)
    draw.text((40, 150), text, fill="black", font=font)

    pdf_path = tmp_path / "scanned.pdf"
    image.save(pdf_path, "PDF")
    return pdf_path


def _tesseract_really_available() -> bool:
    try:
        import pytesseract

        pytesseract.get_tesseract_version()
        import pdf2image  # noqa: F401
    except Exception:
        return False
    return True


@pytest.mark.skipif(not _tesseract_really_available(), reason="tesseract/poppler not installed")
def test_real_ocr_recovers_text_from_a_scanned_pdf(tmp_path, monkeypatch):
    monkeypatch.setattr(config_module.settings, "fake_ocr", False)
    pdf_path = _build_scanned_pdf(tmp_path, "WAKULAW COURT ORDER TEST")

    # Sanity check: pypdf should find nothing, since this PDF is an image
    # with no embedded text layer.
    from ai.preprocessing.extract import extract_text

    assert extract_text(pdf_path).strip() == ""

    recovered = ocr_module.ocr_pdf(pdf_path)

    assert "WAKULAW" in recovered.upper()
    assert "COURT" in recovered.upper()


# ---------------------------------------------------------------------------
# document_service._extract_with_ocr_fallback — integration with the pipeline
# ---------------------------------------------------------------------------


def test_normal_text_pdf_does_not_invoke_ocr(tmp_path, monkeypatch):
    calls = []
    monkeypatch.setattr(
        "app.services.document_service.extract_text",
        lambda path: " ".join(["word"] * 50),
    )
    monkeypatch.setattr(
        "app.services.document_service.ocr_pdf",
        lambda path: calls.append(path) or "should not be called",
    )

    text, ocr_used = _extract_with_ocr_fallback(tmp_path / "doc.pdf")

    assert ocr_used is False
    assert calls == []


def test_short_text_pdf_falls_back_to_ocr_and_succeeds(tmp_path, monkeypatch):
    monkeypatch.setattr("app.services.document_service.extract_text", lambda path: "barely any text")
    monkeypatch.setattr(
        "app.services.document_service.ocr_pdf",
        lambda path: " ".join(["recovered"] * 30),
    )

    text, ocr_used = _extract_with_ocr_fallback(tmp_path / "scan.pdf")

    assert ocr_used is True
    assert "recovered" in text


def test_short_text_non_pdf_does_not_attempt_ocr(tmp_path, monkeypatch):
    calls = []
    monkeypatch.setattr("app.services.document_service.extract_text", lambda path: "too short")
    monkeypatch.setattr(
        "app.services.document_service.ocr_pdf",
        lambda path: calls.append(path) or "unused",
    )

    with pytest.raises(HTTPException) as exc_info:
        _extract_with_ocr_fallback(tmp_path / "doc.txt")

    assert exc_info.value.status_code == 422
    assert calls == []  # OCR only applies to PDFs


def test_ocr_disabled_skips_attempt_and_rejects_clearly(tmp_path, monkeypatch):
    calls = []
    monkeypatch.setattr(config_module.settings, "ocr_enabled", False)
    monkeypatch.setattr("app.services.document_service.extract_text", lambda path: "too short")
    monkeypatch.setattr(
        "app.services.document_service.ocr_pdf",
        lambda path: calls.append(path) or "unused",
    )

    with pytest.raises(HTTPException) as exc_info:
        _extract_with_ocr_fallback(tmp_path / "scan.pdf")

    assert exc_info.value.status_code == 422
    assert "disabled" in exc_info.value.detail
    assert calls == []


def test_ocr_unavailable_produces_clear_rejection(tmp_path, monkeypatch):
    monkeypatch.setattr("app.services.document_service.extract_text", lambda path: "too short")

    def _raise_unavailable(path):
        raise ocr_module.OcrUnavailableError("tesseract not installed")

    monkeypatch.setattr("app.services.document_service.ocr_pdf", _raise_unavailable)

    with pytest.raises(HTTPException) as exc_info:
        _extract_with_ocr_fallback(tmp_path / "scan.pdf")

    assert exc_info.value.status_code == 422
    assert "tesseract not installed" in exc_info.value.detail


def test_ocr_runs_but_still_finds_too_little_text(tmp_path, monkeypatch):
    monkeypatch.setattr("app.services.document_service.extract_text", lambda path: "too short")
    monkeypatch.setattr("app.services.document_service.ocr_pdf", lambda path: "blank scan")

    with pytest.raises(HTTPException) as exc_info:
        _extract_with_ocr_fallback(tmp_path / "scan.pdf")

    assert exc_info.value.status_code == 422
    assert "higher-resolution scan" in exc_info.value.detail


# ---------------------------------------------------------------------------
# Full upload flow, through the API (FAKE_OCR=1 from conftest)
# ---------------------------------------------------------------------------


def test_upload_scanned_pdf_succeeds_via_fake_ocr_and_reports_ocr_used(client, monkeypatch, tmp_path):
    monkeypatch.setattr("app.services.document_service.extract_text", lambda path: "x")

    pdf_path = tmp_path / "scan.pdf"
    pdf_path.write_bytes(b"%PDF-1.4 minimal placeholder for a scanned upload test")

    headers = _register(client)
    with pdf_path.open("rb") as f:
        response = client.post(
            "/api/v1/documents/upload",
            headers=headers,
            files={"file": ("scan.pdf", f, "application/pdf")},
        )

    assert response.status_code == 201, response.text
    body = response.json()
    assert body["ocr_used"] is True


def test_upload_normal_text_reports_ocr_used_false(client):
    headers = _register(client)
    content = b"This is a normal text document with plenty of real extractable words in it, no OCR needed at all here."
    response = client.post(
        "/api/v1/documents/upload",
        headers=headers,
        files={"file": ("doc.txt", content, "text/plain")},
    )

    assert response.status_code == 201, response.text
    assert response.json()["ocr_used"] is False


def _register(client, email="ocr-tester@example.com"):
    response = client.post(
        "/api/v1/auth/register",
        json={"email": email, "name": "OCR Tester", "password": "secret123"},
    )
    assert response.status_code == 201, response.text
    return {"Authorization": f"Bearer {response.json()['token']}"}
