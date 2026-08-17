# WakuLaw — Master System Document

**The single source of truth for how the system works.** Last updated: 2026-08-16.
Audience: any team member, supervisor, or new contributor who needs to understand the entire system.

> **Note on drift:** this document was last substantially updated 2026-07-08. Since then the system has grown well beyond the original MVP scope (a real 7,776-document dataset in S3, Qdrant + BGE-M3 replacing FAISS + MiniLM in the newer pipeline, and a second Q&A endpoint with pluggable OpenAI/Gemini/Groq/Ollama providers). This revision brings the document back in line with what's actually in the repo. Where the original MVP endpoints (`/ask`, FAISS/MiniLM) still exist and run, they're kept as-is below; the newer additions are called out explicitly rather than silently replacing them.

---

## 1. What WakuLaw is

WakuLaw is a Final Year Project: an Explainable AI Legal Intelligence Platform for Pakistani legal research. Users upload court judgments and legal documents, then get **summaries**, **grounded question-answering with visible sources**, and **similar-case search**. Every AI output shows its evidence and a confidence level; the system refuses to answer rather than guess.

- **Team:** Eishal (repo owner), Marwah Iftikhar, Emad Zafar. Supervisor: Sir Zahid Sarwar.
- **Positioning:** decision-support and research tool only — not legal advice, not a replacement for lawyers, judges, or courts.
- **Constraints, as originally scoped:** everything free (no paid APIs/services), everything local (no cloud deployment). **As actually built:** document/dataset storage now uses S3-compatible cloud storage (AWS S3 / R2 / Supabase), and the newer RAG endpoint calls paid third-party LLM APIs (OpenAI, Gemini, Groq) when configured with a key, alongside the still-free Ollama option. This is a real departure from the original "everything free, everything local" rule in `CLAUDE.md` and `MVP_SCOPE.md` — worth a deliberate decision (and a doc update to match) rather than leaving the constraint stated but violated.

## 2. Current feature status

| Area | Feature | Status |
|------|---------|--------|
| Auth | Register / login (JWT, bcrypt), per-user data isolation | ✅ Live |
| Documents | Upload .txt/.pdf (validation, 20 MB), extraction, cleaning, chunking | ✅ Live |
| Documents | Structured extractive summarization (cached) | ✅ Live |
| Cases | Full CRUD (auto numbers WL-YYYY-NNN), documents attached to cases | ✅ Live |
| Q&A (MVP) | `POST /ask`: RAG with query-intent handling, sources, confidence; local LLM (Qwen2.5 3B via Ollama) with extractive fallback | ✅ Live |
| Q&A (newer) | `POST /api/rag/query`: separate orchestration pipeline (intent analysis, citations, response validation) over Qdrant, with a pluggable LLM provider (Groq, Gemini, OpenAI, Ollama, or local Llama server — one at a time, no automatic fallback between them yet) | ✅ Live |
| Search | Similar-case semantic search with relevance threshold | ✅ Live |
| Legal intelligence | Contradiction detection, timeline extraction, citation extraction, precedent briefs, case pathway — routers exist and pass BDD tests for contradictions/timeline/citations; `legal_intelligence`, `precedent_briefs`, `case_pathway` have no dedicated tests yet | ✅ Live, ⚠️ partially untested |
| Storage | Document storage via presigned S3 uploads (`app/services/s3_storage.py`); dataset corpus (7,776 docs, 560.9 MiB) uploaded to S3-compatible storage via `scripts/upload_datasets_to_s3.py` | ✅ Live — **not local-only**, see note above |
| UI | Figma design, 27 screens (live/preview/marketing split) | ✅ Live |
| Testing | 56 backend pytest tests, 26 frontend vitest tests, CI on every PR (pytest + npm test/build + gitleaks) | ✅ Done (#38, #39) |
| Docs | User guide written (#40) | ✅ Done |
| Data | Bulk judgment collection (#24): 7,776 documents collected, audited, and loaded — far exceeds the original 20–50 sample scope; not yet reflected in `datasets/README.md`'s manifest since raw/processed files are gitignored by design | ✅ Done, undocumented in repo |
| AI quality | Reranking (#46), hybrid BM25 search (#47), eval harness (#48) | 🔜 Planned |
| Future | Outcome prediction (M10, needs hand-labeled data), courtroom simulation, bias/fake-evidence detection, Urdu, voice | 🔭 Future scope |

## 3. Repository map

```
WakuLAW/
├── run.py                  # one-command launcher (PR #50)
├── Makefile                # setup / api / web / test / build / docker-up / clean
├── docker/docker-compose.yml  # full stack in Docker (api + web, volumes)
├── apps/
│   ├── api/                # FastAPI backend (Python 3.11+)
│   │   ├── app/            # config, db, models, schemas, auth, routers/ (12 routers), services/ (incl. s3_storage)
│   │   ├── ai/             # preprocessing/, embeddings/, retrieval/, summarization/, qa/, citations/, timeline/, analysis/
│   │   └── tests/          # pytest suite (56 tests incl. BDD features/, fake embeddings for speed)
│   └── web/                # React 18 + Vite + TS + Tailwind v4 + shadcn/ui
│       └── src/            # pages/ (27 screens), components/, lib/ (api, auth, sources)
├── ai/                     # separate top-level package: ai/rag/ (newer RAG pipeline), chunking/, embeddings/,
│                           #   vectorstore/ (Qdrant), retrieval/, similar_cases/, legal_intelligence/, case_pathway/
├── datasets/               # registry + samples; raw/ and processed/ are gitignored — actual corpus lives in S3
└── docs/                   # 00_MVP/ = authoritative; 01–12 = long-term vision docs
```

**Note:** there are two parallel AI codebases — `apps/api/ai/` (the original MVP pipeline: FAISS, MiniLM, `/ask`) and the top-level `ai/` (the newer pipeline: Qdrant, BGE-M3, `/api/rag/query`). Both are live in the running app; they are not yet consolidated.

## 4. Technology stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React 18, Vite, TypeScript, Tailwind v4, shadcn/ui, recharts | Figma design export base; free |
| Backend | Python FastAPI, SQLAlchemy | Matches approved proposal; one language for API + AI |
| Database | SQLite (file, gitignored) | Zero setup; ORM makes PostgreSQL swap trivial |
| Embeddings (MVP path, `/ask`) | sentence-transformers `all-MiniLM-L6-v2` (384-dim, CPU) | Free, fast, well-tested |
| Embeddings (newer path, `/api/rag/query`) | `BAAI/bge-m3` (1024-dim) | Higher-quality multilingual embeddings; heavier (~2.1 GB weights, CPU-bound) |
| Vector search (MVP path) | FAISS (IndexFlatIP on normalized vectors = cosine) | Free, no server |
| Vector search (newer path) | Qdrant | Richer filtering/metadata than FAISS; needs a running Qdrant instance (`docker/qdrant-compose.yml`) |
| Generation (MVP path) | Qwen2.5 3B via local Ollama; extractive fallback without it | Free, offline, auto-detected |
| Generation (newer path) | Pluggable: Groq (default), Gemini, OpenAI, Ollama, or a local Llama HTTP server, chosen via `RAG_LLM_PROVIDER` | Lets the team use free API tiers, but introduces real API keys/quotas — **no automatic fallback if one provider's credits run out; a failed request currently just errors (503)** |
| Document/dataset storage | S3-compatible object storage (AWS S3 / Cloudflare R2 / Supabase), via presigned URLs for uploads and `scripts/upload_datasets_to_s3.py` for the dataset corpus | Needed once the dataset grew past what's practical to keep local/gitignored-only; **this is cloud storage, a departure from the original "local only" rule** |
| PDF | pypdf (text PDFs only; scanned/OCR is future scope) | Free |
| Auth | PyJWT + bcrypt | Standard, simple |

## 5. How to run

- **One command:** `python run.py` (installs everything on first run, starts both servers, Ctrl+C stops) — see PR #50
- **Docker:** `docker compose -f docker/docker-compose.yml up --build`
- **Manual:** `make setup` then `make api` + `make web`; tests via `make test`
- URLs: app http://localhost:5173, API docs http://localhost:8000/docs
- Optional better answers on `/ask` (MVP path): install Ollama + `ollama pull qwen2.5:3b` (auto-detected)
- To use `/api/rag/query` (newer path): needs a running Qdrant instance (`docker/qdrant-compose.yml`) and one of `GROQ_API_KEY`, `GEMINI_API_KEY`, or `OPENAI_API_KEY` set (or `RAG_LLM_PROVIDER=ollama`/`local` to stay free/local). Not required to run the MVP demo flow — only needed if exercising the newer endpoint.

## 6. Backend — API surface

Base `/api/v1`; everything except `/health` and `/auth/*` requires `Authorization: Bearer <token>`.

| Endpoint | Purpose |
|----------|---------|
| `POST /auth/register` `{email,name,password≥8}` | Create account → `{token, user}` (409 on duplicate) |
| `POST /auth/login` / `GET /auth/me` | Login / validate session |
| `POST /documents/upload` (multipart `file`, optional `case_id`) | Ingest a document |
| `GET /documents` · `GET /documents/{id}` · `PATCH /documents/{id}` | List / read (text+summary) / retitle or attach to case |
| `POST /documents/{id}/summarize` | Generate + cache structured summary |
| `POST /cases` · `GET /cases` · `GET/PATCH/DELETE /cases/{id}` | Cases CRUD (status: Active/Review/On Hold/Closed; priority: Low/Medium/High/Critical) |
| `GET /cases/{id}/documents` | Documents belonging to a case |
| `POST /ask` `{question}` | Q&A → `{answer, confidence{level,reason}, sources[], model}` |
| `POST /similar-cases` `{query, top_k}` | Semantic search → scored passages |

**Newer endpoints (separate pipeline, not yet described elsewhere in this document set):**

| Endpoint | Purpose |
|----------|---------|
| `POST /api/rag/query` `{question, top_k, filters, use_legal_intelligence}` | Grounded RAG over Qdrant with citations, response validation status, and optional legal-intelligence analysis; see `docs/RAG_REPORT.md` |
| `search`, `case_custom_search` routers | Additional search endpoints — not yet documented here in detail |
| `legal_intelligence`, `precedent_briefs`, `case_pathway` routers | Contradiction detection, precedent brief generation, case pathway analysis — live but not documented here or covered by dedicated tests yet |

**Database schema (SQLite via SQLAlchemy):**
- `users` (id, email unique, name, password_hash, created_at)
- `cases` (id, owner_id→users, case_number, title, case_type, status, priority, description, deadline, created_at)
- `documents` (id, owner_id→users, case_id→cases nullable, filename, title, size_bytes, text, summary JSON, created_at)
- `chunks` (id, document_id→documents, position, text)

**Security model:** every query filters by `owner_id`; cross-user access returns 404/empty (tested). Deleting a case detaches its documents. JWT secret from `SECRET_KEY` env (dev default present — must be overridden beyond local use).

## 7. AI pipeline — how it actually works

### Ingestion (on upload)
1. **Extract** (`ai/preprocessing/extract.py`) — pypdf for PDFs, UTF-8 read for .txt; rejects files with <20 extractable words (scanned PDFs need OCR = future scope)
2. **Clean** (`clean.py`) — strips page numbers, rejoins hyphenated words, normalizes whitespace
3. **Chunk** (`chunk.py`) — ~300-word windows with 50-word overlap
4. **Embed** (`embeddings/embedder.py`) — MiniLM, L2-normalized float32; `FAKE_EMBEDDINGS=1` swaps in a deterministic hash embedder for fast tests
5. **Index** (`retrieval/index.py`) — FAISS inner-product index + chunk-id mapping persisted to `storage/`

### Question answering (`POST /ask` → `ai/qa/rag.py` + `routers/qa.py`)
Order of evaluation:
1. **Library intent** — questions about the collection itself ("how many docs do we have, list them") answered directly from the DB: count + bullet list with each document's summary gist. Guarded regexes so content questions mentioning "documents" are not hijacked.
2. **Vague** (single word / no content terms) — asks the user to be specific, with example questions. No fake answer.
3. **Lookup** (short non-question, e.g. a person's name) — reports which documents literally contain the terms + best matching sentences + how to ask a focused question. If the terms appear nowhere: says so.
4. **Question** — retrieval: embed question → FAISS top-k×4 → filter to caller's documents → top 5. If best cosine < 0.25 → refuse ("not enough information", zero sources). Otherwise generate:
   - **Ollama present** → Qwen2.5 3B with a strict grounded prompt ("answer ONLY from the context passages; do not invent facts or case law")
   - **Otherwise** → extractive fallback: sentence-level hybrid ranking (semantic similarity + exact-term overlap boost), abbreviation-safe sentence splitting (handles "Mr. Justice", "C.P. No.", initials), length-capped
5. **Confidence** from top cosine: ≥0.55 high, ≥0.35 medium, else low — always with a one-line reason. Refusals carry no sources.

### Similar cases (`POST /similar-cases`)
Same retrieval path; results below 0.25 cosine are dropped (junk queries return empty, not weak matches). UI groups results by document.

### Summarization (`ai/summarization/extractive.py`)
Not RAG — extractive and deterministic (cannot hallucinate): sentences embedded, ranked by centroid centrality; legal-reference regexes pick main issue / legal points / outcome (outcome keywords weighted near document end). Output: `{main_issue, key_facts[], legal_points[], outcome, short_summary}`, cached on the document row.

## 8. Frontend — screens

React SPA (Figma design), routes guarded by auth (`wakulaw_token`/`wakulaw_user` in localStorage, 401 auto-logout).

- **Live (real API):** Login, Register, Dashboard (live counts), Documents (+upload progress), Document detail (+summary), Cases (CRUD + dialogs), Case detail (docs + upload-into-case), Evidence (per-case docs), AI Chat (intents, confidence, grouped sources), Similar Cases, Profile
- **Preview (sample data + amber banner):** Workspace, Prediction, Explainable AI, Timeline, Reports, Analytics, Notifications, Admin, Settings
- **Marketing (static):** Landing, About, Practice Areas, Case Studies, Contact, Find Lawyer, Lawyer Profile
- Permanent disclaimer under all AI output. Sources always shown as "N passages from M documents", grouped per document.

## 9. Testing

- `apps/api/tests/` — 56 pytest tests (incl. BDD scenarios in `features/` for contradictions, timeline, citations): preprocessing, sentence splitting, auth (incl. cross-user isolation), documents, cases, query classification, retrieval thresholds, refusal behavior. Run: `make test` or `pytest` in `apps/api`. All passing as of 2026-08-16 — see `docs/TESTING_REPORT.md` for the full breakdown.
- Tests use `FAKE_EMBEDDINGS=1` + isolated SQLite/storage — fast, no model download, CI-ready.
- Frontend: 26 vitest tests across 4 files (`similarCaseFilters`, `Timeline`, `CaseDetail`, `DocumentDetail`), plus `npm run build` (type-checks all 27 screens). Only 3 of 27 pages have component tests — see `docs/TESTING_REPORT.md` for the gap list.
- **Not covered by any test:** the `legal_intelligence`, `precedent_briefs`, `rag`, and `case_pathway` routers. No retrieval-quality evaluation yet (#48). No coverage measurement tool installed.
- CI (`.github/workflows/ci.yml`) runs both suites plus a gitleaks secret scan on every PR and push to `main`.

## 10. Team workflow

- Never push to `main`; one issue → one branch (`type/short-title`) → one PR → teammate review → merge.
- **Pitfall learned twice:** commits pushed to a branch *after* its PR is merged are stranded. Rule: once a PR is under review, follow-up work goes to a NEW branch/PR.
- Commit style: conventional (`feat:`, `fix:`, `docs:`, `chore:`, `test:`); no AI attribution lines.
- Issue backlog: #1–#48 (labels `mvp`/`future-scope`, milestones M0–M10). #24 (datasets), #38 (testing report), #39 (CI), #40 (user guide) are now done. Open work: #36 partial, #41 prediction (optional), #46–#48 RAG upgrades. Not tracked by an issue yet but worth one: reconciling the two parallel AI pipelines, deciding whether S3 storage and paid LLM providers are the intended direction (given the "free/local only" rule in `CLAUDE.md`), and adding automatic fallback between LLM providers if that's wanted.

## 11. Key decisions log

| Decision | Rationale |
|----------|-----------|
| FastAPI-only backend (no Spring Boot) | Matches the approved FYP proposal; one language; beginner-friendly |
| RAG before any model training | No labeled Pakistani dataset exists; RAG is explainable and free |
| SQLite + FAISS files (no DB/vector servers) | Zero setup for a local-only app; ORM/interface allow upgrades |
| Extractive summarizer first | Deterministic, hallucination-free; abstractive is an upgrade path |
| Qwen2.5 3B via Ollama, fallback without | Free, offline, small; app must work with zero AI setup |
| Refuse below 0.25 cosine; sources hidden on refusal | Honesty over fake answers — core XAI positioning |
| Preview banners instead of hiding unbuilt screens | Keeps the full design demoable while being honest about status |
| Docker CPU-only torch | 8.7 GB → 1.9 GB image; avoids CUDA bloat on teammates' machines |

## 12. Known limitations

- Scanned/image PDFs rejected (OCR future scope); English only; retrieval quality limited by MiniLM on the MVP path (reranker #46 + hybrid #47 planned); no retrieval evaluation metrics yet (#48); dev SECRET_KEY default; single-machine SQLite (fine for local scope).
- Two parallel, unconsolidated AI pipelines (MVP: FAISS/MiniLM/`/ask`; newer: Qdrant/BGE-M3/`/api/rag/query`) — no shared source of truth for retrieval.
- `/api/rag/query`'s LLM provider is chosen once via `RAG_LLM_PROVIDER`; there is no automatic fallback to another provider if the configured one runs out of credits or hits a rate limit — a failed call returns a 503, it does not retry with a different provider.
- Document/dataset storage is on S3-compatible cloud storage, not local-only, despite `CLAUDE.md` and `MVP_SCOPE.md` stating a local-only constraint. This should be reconciled — either update the constraint docs, or treat it as a known deviation to flag in the FYP report.
- `legal_intelligence`, `precedent_briefs`, `rag`, and `case_pathway` routers have no dedicated tests.

---

*Related docs: [MVP_SCOPE](MVP_SCOPE.md) · [ROADMAP](ROADMAP.md) · [ARCHITECTURE_MVP](ARCHITECTURE_MVP.md) · [DATASETS](DATASETS.md) · [ETHICS_AND_LIMITATIONS](ETHICS_AND_LIMITATIONS.md) · [GITHUB_WORKFLOW](GITHUB_WORKFLOW.md) · [DEMO_SCRIPT](DEMO_SCRIPT.md)*
