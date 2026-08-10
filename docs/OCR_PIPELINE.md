# WukaLAW OCR Pipeline

## Flow

Upload → private/local storage → native text detection → page-level OCR decision → conservative image preprocessing → English/Urdu Tesseract OCR → quality assessment → existing text cleaning → adaptive chunking → shared embedding provider → existing user Qdrant collection → WukaLAW RAG.

OCR is part of the normal document ingestion service. It does not use a separate vector store and never overwrites the uploaded source.

## Supported input

- Searchable, scanned, and mixed PDFs
- UTF-8 text
- JPG/JPEG, PNG, and WEBP images
- English (`eng`), Urdu (`urd`), English and Urdu (`eng+urd`), and automatic selection

For PDFs, native extraction runs first. A page is OCR'd only when it has fewer than 40 meaningful characters or an unusually low meaningful-character ratio. Mixed PDFs retain usable native pages and scan only deficient pages.

## Metadata and failure isolation

Documents expose extraction method, OCR engine/language/confidence/quality, page count, scanned-page count, warnings, and indexing status. Chunks retain the page and extraction method; Qdrant payloads additionally retain document and case identity.

Unreadable images return a clean validation error. A failed PDF page does not prevent other pages from being processed. Empty OCR is stored with a warning and is not indexed. Extraction is committed before Qdrant indexing so an indexing outage does not lose recovered text.

## Local dependencies

Install Python packages with:

```powershell
.\.venv\Scripts\python.exe -m pip install -r apps\api\requirements.txt
```

Install the Tesseract binary separately and ensure it is on `PATH`. Install both `eng` and `urd` trained data. Core OCR stays local; private documents are not sent to third-party OCR services.

## Production notes and limitations

- Pin and monitor Tesseract/PDF-renderer versions in deployment images.
- Restrict uploads by size, MIME, extension, and image readability; scan uploads for malware at the infrastructure boundary.
- OCR confidence is evidence, not certainty. Poor scans display a review warning and text is never invented.
- Handwriting recognition is not claimed. Complex tables, stamps, skew, bleed-through, and low-resolution Nastaliq Urdu can require manual review.
- Automatic language mode uses bilingual OCR and deterministic Unicode script detection; it does not transliterate or reverse Urdu.

## Synthetic demo checklist

Use non-private synthetic samples for: a clean English order scan, a poor English scan, an Urdu document, a mixed Urdu/English document, a searchable PDF, a scanned PDF, and a standalone image. Confirm source preservation, displayed metadata, page-aware chunks, retrieval, poor-quality warnings, and empty-text non-indexing.
