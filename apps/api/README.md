# WakuLaw API

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
