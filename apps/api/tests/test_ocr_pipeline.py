from pathlib import Path
from types import SimpleNamespace

import pytest

from ai.ocr.detector import detect_language, quality_status
from ai.ocr.service import OCRPage, OCRResult, OCRService
from app.db import SessionLocal
from app.models import Chunk, Document
from app.services import document_service

def register_user(client):
    response = client.post("/api/v1/auth/register", json={"email":"ocr@example.com","name":"OCR User","password":"secret123"})
    return {"Authorization": f"Bearer {response.json()['token']}"}


class FakeEngine:
    name = "fake-tesseract"
    def __init__(self, text="Recognized legal text with enough words for reliable retrieval and citation testing.", confidence=91):
        self.text, self.confidence, self.calls = text, confidence, 0
    def recognize(self, image, language="auto"):
        self.calls += 1
        return self.text, self.confidence


def test_searchable_pdf_page_bypasses_ocr(monkeypatch, tmp_path):
    page = SimpleNamespace(extract_text=lambda: "Searchable court order text " * 8)
    monkeypatch.setattr("pypdf.PdfReader", lambda _: SimpleNamespace(pages=[page]))
    engine = FakeEngine()
    result = OCRService(engine).extract(tmp_path / "order.pdf")
    assert result.extraction_method == "native_pdf"
    assert engine.calls == 0


def test_scanned_and_mixed_pdf_use_page_level_ocr(monkeypatch, tmp_path):
    pages = [SimpleNamespace(extract_text=lambda: ""), SimpleNamespace(extract_text=lambda: "Native judgment text " * 8)]
    monkeypatch.setattr("pypdf.PdfReader", lambda _: SimpleNamespace(pages=pages))
    monkeypatch.setattr(OCRService, "_render_pdf_page", lambda *args: SimpleNamespace(copy=lambda: object()))
    monkeypatch.setattr("ai.ocr.service.prepare_image", lambda image: image)
    engine = FakeEngine()
    result = OCRService(engine).extract(tmp_path / "mixed.pdf")
    assert result.extraction_method == "hybrid"
    assert result.pages[0].extraction_method == "ocr"
    assert result.pages[1].extraction_method == "native_pdf"


def test_urdu_and_mixed_unicode_are_preserved():
    assert detect_language("\u06cc\u06c1 \u0642\u0627\u0646\u0648\u0646\u06cc \u062f\u0633\u062a\u0627\u0648\u06cc\u0632 \u06c1\u06d2") == "urd"
    assert detect_language("\u0639\u062f\u0627\u0644\u062a Court Order") == "eng+urd"


def test_poor_ocr_quality_is_not_presented_as_reliable():
    assert quality_status("???", 12) == "poor"


def test_image_upload_validation_is_clean(client):
    response = client.post("/api/v1/documents/upload", headers=register_user(client), files={"file": ("bad.png", b"not-image", "image/png")})
    assert response.status_code == 422
    assert "unreadable" in response.json()["detail"].lower() or "support" in response.json()["detail"].lower()


def test_ocr_text_metadata_and_page_reach_chunking(monkeypatch, client):
    recognized = "\u0639\u062f\u0627\u0644\u062a Court Order legal evidence section 302 hearing decision " * 8
    result = OCRResult(recognized, "eng+urd", "fake-tesseract", 86, "ocr", "good", [OCRPage(1, recognized, "ocr", 86)], [])
    monkeypatch.setattr(document_service, "_extract", lambda *args: result)
    response = client.post("/api/v1/documents/upload", headers=register_user(client), files={"file": ("scan.png", b"synthetic", "image/png")})
    assert response.status_code == 201, response.text
    body = response.json()
    assert body["pages_ocrd"] == 1 and body["ocr_language"] == "eng+urd"
    with SessionLocal() as db:
        doc = db.get(Document, body["id"])
        chunk = db.query(Chunk).filter(Chunk.document_id == doc.id).first()
        assert "\u0639\u062f\u0627\u0644\u062a" in doc.text
        assert chunk.page == 1 and chunk.extraction_method == "ocr"


def test_empty_ocr_is_stored_but_not_indexed(monkeypatch, client):
    result = OCRResult("", "unknown", "fake-tesseract", None, "ocr", "poor", [OCRPage(1, "", "ocr")], [])
    monkeypatch.setattr(document_service, "_extract", lambda *args: result)
    response = client.post("/api/v1/documents/upload", headers=register_user(client), files={"file": ("blank.png", b"synthetic", "image/png")})
    assert response.status_code == 201
    assert response.json()["indexing_status"] == "skipped_empty"
    assert response.json()["num_chunks"] == 0