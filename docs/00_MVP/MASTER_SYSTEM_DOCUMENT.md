# WakuLaw — Master System Document

**The single source of truth for how the system works.** Last updated: 2026-07-08.
Audience: any team member, supervisor, or new contributor who needs to understand the entire system.

---

## 1. What WakuLaw is

WakuLaw is a Final Year Project: an Explainable AI Legal Intelligence Platform for Pakistani legal research. Users upload court judgments and legal documents, then get **summaries**, **grounded question-answering with visible sources**, and **similar-case search** — all running locally on free, open-source software. Every AI output shows its evidence and a confidence level; the system refuses to answer rather than guess.

- **Team:** Eishal (repo owner), Marwah Iftikhar, Emad Zafar. Supervisor: Sir Zahid Sarwar.
- **Positioning:** decision-support and research tool only — not legal advice, not a replacement for lawyers, judges, or courts.
- **Hard constraints:** everything free (no paid APIs/services), everything local (no cloud deployment).

## 2. Current feature status

| Area | Feature | Status |
|------|---------|--------|
| Auth | Register / login (JWT, bcrypt), per-user data isolation | ✅ Live |
| Documents | Upload .txt/.pdf (validation, 20 MB), extraction, cleaning, chunking | ✅ Live |
| Documents | Structured extractive summarization (cached) | ✅ Live |
| Cases | Full CRUD (auto numbers WL-YYYY-NNN), documents attached to cases | ✅ Live |
| Q&A | RAG with query-intent handling, sources, confidence; local LLM (Qwen2.5 3B via Ollama) with extractive fallback | ✅ Live |
| Search | Similar-case semantic search with relevance threshold | ✅ Live |
| UI | Figma design, 24 screens (live/preview/marketing split) | ✅ Live |
| AI quality | Reranking (#46), hybrid BM25 search (#47) — implemented, pending PR review; eval harness (#48) — already done, see `docs/STRATIFIED_RETRIEVAL_REPORT.md` | ✅ / 🔜 Mixed, see note |
| Data | Bulk judgment collection (#24) — already done (7,776 docs in S3); CI (#39) — already done; testing report (#38), user guide (#40), demo script (#37) — all written | ✅ Done |
| Future | Outcome prediction (M10, needs hand-labeled data), courtroom simulation, contradiction detection, bias/fake-evidence detection, Urdu, voice | 🔭 Future scope |

## 3. Repository map

```
WakuLAW/
├── run.py                  # one-command launcher (PR #50)
├── Makefile                # setup / api / web / test / build / docker-up / clean
├── docker/docker-compose.yml  # full stack in Docker (api + web, volumes)
├── apps/
│   ├── api/                # FastAPI backend (Python 3.11+)
│   │   ├── app/            # config, db, models, schemas, auth, routers/, services/
│   │   ├── ai/             # preprocessing/, embeddings/, retrieval/, summarization/, qa/
│   │   └── tests/          # pytest suite (36 tests, fake embeddings for speed)
│   └── web/                # React 18 + Vite + TS + Tailwind v4 + shadcn/ui
│       └── src/            # pages/ (24 screens), components/, lib/ (api, auth, sources)
├── datasets/               # registry + samples; raw/ and processed/ are gitignored
└── docs/                   # 00_MVP/ = authoritative; 01–12 = long-term vision docs
```

## 4. Technology stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React 18, Vite, TypeScript, Tailwind v4, shadcn/ui, recharts | Figma design export base; free |
| Backend | Python FastAPI, SQLAlchemy | Matches approved proposal; one language for API + AI |
| Database | SQLite (file, gitignored) | Zero setup; ORM makes PostgreSQL swap trivial |
| Embeddings | sentence-transformers `all-MiniLM-L6-v2` (384-dim, CPU) | Free, fast, well-tested |
| Vector search | FAISS (IndexFlatIP on normalized vectors = cosine) | Free, no server |
| Generation | Qwen2.5 3B via local Ollama; extractive fallback without it | Free, offline, auto-detected |
| PDF | pypdf (text PDFs only; scanned/OCR is future scope) | Free |
| Auth | PyJWT + bcrypt | Standard, simple |

## 5. How to run

- **One command:** `python run.py` (installs everything on first run, starts both servers, Ctrl+C stops) — see PR #50
- **Docker:** `docker compose -f docker/docker-compose.yml up --build`
- **Manual:** `make setup` then `make api` + `make web`; tests via `make test`
- URLs: app http://localhost:5173, API docs http://localhost:8000/docs
- Optional better answers: install Ollama + `ollama pull qwen2.5:3b` (auto-detected)

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

- `apps/api/tests/` — 36 pytest tests: preprocessing, sentence splitting, auth (incl. cross-user isolation), documents, cases, query classification, retrieval thresholds, refusal behavior. Run: `make test` or `pytest` in `apps/api`.
- Tests use `FAKE_EMBEDDINGS=1` + isolated SQLite/storage — fast, no model download, CI-ready.
- Frontend: `npm run build` (type-checks all screens) + oxlint. No component tests yet (#38).

## 10. Team workflow

- Never push to `main`; one issue → one branch (`type/short-title`) → one PR → teammate review → merge.
- **Pitfall learned twice:** commits pushed to a branch *after* its PR is merged are stranded. Rule: once a PR is under review, follow-up work goes to a NEW branch/PR.
- Commit style: conventional (`feat:`, `fix:`, `docs:`, `chore:`, `test:`); no AI attribution lines.
- Issue backlog: #1–#48 (labels `mvp`/`future-scope`, milestones M0–M10). Open work: #24 datasets, #36 partial, #38–#40 testing/CI/docs, #41 prediction (optional), #46–#48 RAG upgrades.

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

- Scanned/image PDFs rejected (OCR future scope); English only; retrieval quality limited by MiniLM (reranker #46 + hybrid #47 planned); no retrieval evaluation metrics yet (#48); no CI (#39); dev SECRET_KEY default; single-machine SQLite (fine for local scope).

---

*Related docs: [MVP_SCOPE](MVP_SCOPE.md) · [ROADMAP](ROADMAP.md) · [ARCHITECTURE_MVP](ARCHITECTURE_MVP.md) · [DATASETS](DATASETS.md) · [ETHICS_AND_LIMITATIONS](ETHICS_AND_LIMITATIONS.md) · [GITHUB_WORKFLOW](GITHUB_WORKFLOW.md) · [DEMO_SCRIPT](DEMO_SCRIPT.md)*
