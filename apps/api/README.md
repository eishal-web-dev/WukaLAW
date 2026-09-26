# WakuLaw API

## Enable real Similar Cases locally

Similar Cases searches a separate Pakistani-judgment collection. User uploads
in `wakulaw_user_documents` are intentionally never presented as precedent.
Stop the API first (embedded Qdrant permits only one process to open its local
storage). From the repository root, activate the virtual environment and run:

```powershell
python scripts\bootstrap_similar_cases.py --limit 5000 --device cpu
```

This downloads public Supreme Court of Pakistan judgment records from
`Ibtehaj10/supreme-court-of-pak-judgments`, runs the existing cleaning,
chunking and embedding pipeline, then creates and fills
`wakulaw_real_5000`. The first run downloads the embedding model and can take
significant time on CPU. For a quick end-to-end check use `--limit 25`.

Keep these values in the root `.env`, restart the API, and open Similar Cases:

```dotenv
QDRANT_COLLECTION=wakulaw_real_5000
QDRANT_LOCAL_PATH=datasets/processed/qdrant_real_5000
```

Review the source dataset and model card for licensing and fitness before
deploying or redistributing the corpus. Search results are research leads, not
verified legal advice or a personal probability of winning.

FastAPI backend + AI modules (preprocessing, embeddings, FAISS retrieval, extractive summarization, RAG Q&A). Runs fully local and free.

## Setup

```bash
cd apps/api
python3.13 -m venv .venv        # any Python 3.11+ works
source .venv/bin/activate
pip install -r requirements.txt
```

## Run

```bash
uvicorn app.main:app --reload --port 8000
```

- API docs: http://localhost:8000/docs
- Health: http://localhost:8000/api/v1/health

First document upload downloads the embedding model (`all-MiniLM-L6-v2`, ~90 MB) once; afterwards everything is offline.

## Optional: OCR for scanned PDFs

PDFs with a real text layer work with no setup. If a PDF looks like a scan (too little embedded text), upload automatically falls back to OCR — but this needs two system packages that aren't installed by `pip`:

```bash
# macOS
brew install tesseract poppler

# Debian/Ubuntu
sudo apt-get install tesseract-ocr tesseract-ocr-urd poppler-utils
```

WukaLAW defaults to `OCR_LANGUAGE=eng+urd` so mixed English/Urdu Pakistani
documents are read with both models. On Windows, rerun the Tesseract installer,
select **Additional language data → Urdu**, and restart the API. You can verify
the installation with `tesseract --list-langs`; it must list both `eng` and `urd`.

### Higher-quality Urdu Nastaliq OCR

Tesseract can be unreliable for dense Nastaliq court documents. WukaLAW can
instead send the original image/PDF to Gemini's vision model for strict
transcription. Configure `apps/api/.env`:

```env
OCR_PROVIDER=gemini
OCR_GEMINI_MODEL=gemini-3.6-flash
GEMINI_API_KEY=your-key
```

This is opt-in because the document leaves the local machine and is processed
by Google. Obtain the document owner's consent and follow the applicable data
protection and professional-confidentiality requirements. Regardless of the
provider, OCR output remains in **Needs review** state and is excluded from AI
answers until a user verifies it.

Without them, scanned PDFs are still rejected with a clear message rather than the app crashing — OCR is attempted only if `pytesseract` reports the `tesseract` binary is actually available. Set `OCR_ENABLED=false` in `.env` to skip the OCR attempt entirely and go straight to that rejection message.

## Optional: better Q&A answers with a local LLM

Without any setup, `/ask` uses a free extractive fallback (real sentences from your documents). For generated answers, install [Ollama](https://ollama.com) (free):

```bash
brew install ollama
ollama serve &
ollama pull llama3.2
```

The API auto-detects Ollama; no configuration needed (override with `OLLAMA_MODEL` in `.env`).

## Tests

```bash
pytest
```

Tests use fast deterministic fake embeddings (`FAKE_EMBEDDINGS=1`) — no model download needed.

## Endpoints

All endpoints except `/health` and `/auth/*` require `Authorization: Bearer <token>` (get a token from register/login). Set `SECRET_KEY` in `.env` for any non-development use.

```
POST /api/v1/auth/register              {"email", "name", "password"}
POST /api/v1/auth/login                 {"email", "password"}
GET  /api/v1/auth/me
GET  /api/v1/health
POST /api/v1/documents/upload          (.txt / .pdf, max 20 MB)
GET  /api/v1/documents
GET  /api/v1/documents/{id}
POST /api/v1/documents/{id}/summarize
POST /api/v1/ask                       {"question": "..."}
POST /api/v1/similar-cases             {"query": "...", "top_k": 5}
```
