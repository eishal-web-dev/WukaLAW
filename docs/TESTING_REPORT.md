# WakuLaw Testing Report

**Closes #38.** Run date: 2026-08-16. Covers `apps/api` (pytest) and `apps/web` (vitest + build).

## Summary

| Suite | Files | Tests | Result | Time |
|---|---|---|---|---|
| Backend (pytest) | 12 | 56 | ✅ 56 passed, 0 failed | 12.8s |
| Frontend (vitest) | 4 | 26 | ✅ 26 passed, 0 failed | 9.6s |
| Frontend build (`tsc -b && vite build`) | — | — | ✅ builds clean | 4.0s |

Both suites were run fresh against the current `main` branch (commit `823be11`), not copied from an earlier report — the earlier MVP docs cite 36 backend tests, which is out of date; the suite has grown to 56 as later features (contradictions, timeline, citations, custom similar-case search) landed.

Commands used:

```bash
cd apps/api && pytest -v
cd apps/web && npm test && npm run build
```

## Backend — 56 tests across 12 files

| File | Tests | Area |
|---|---|---|
| `test_api.py` | 12 | Upload/list/detail, summarize, `/ask` (incl. refusal + entity lookup), `/similar-cases` |
| `test_auth.py` | 5 | Register/login/me, duplicate email, wrong password, auth-required, cross-user document isolation |
| `test_cases.py` | 5 | Case CRUD, invalid status rejected, case isolation between users, upload-into-case, attach-existing-document |
| `test_preprocessing.py` | 7 | Text cleaning (page numbers, hyphenation), chunking (overlap, empty text, adaptive sizing) |
| `test_query_classification.py` | 7 | RAG query-intent routing: vague, lookup (found/absent), library question, content-not-hijacked |
| `test_sentences.py` | 3 | Abbreviation-safe sentence splitting, short-fragment dropping |
| `test_similar_custom_search.py` | 3 | Custom-focus injection for family/criminal/civil case search |
| `test_s3_storage.py` | 2 | Owner-scoped S3 object keys, cross-owner completion rejected |
| `test_upload_vector_index.py` | 2 | Owner-scoped vector search, adaptive multi-chunk upload |
| `steps/test_citations_steps.py` (BDD) | 3 | Statute/constitution/case-law citation detection, empty case, de-duplication |
| `steps/test_contradictions_steps.py` (BDD) | 3 | Conflicting statements flagged, consistent docs yield none, cross-user access blocked |
| `steps/test_timeline_steps.py` (BDD) | 4 | Dated-event extraction, chronological ordering, cross-document merge, cross-user access blocked |

**Setup:** `tests/conftest.py` sets `FAKE_EMBEDDINGS=1` (deterministic hash-based embedder, no model download) and `FAKE_NLI=1`, an isolated SQLite file and storage directory, and resets the vector index per test — no network calls, no GPU, ~13s total.

**What's exercised well:** auth and per-user data isolation (tested at three layers — documents, cases, S3 keys, vector search), the RAG refusal path (low-confidence → no sources, "not enough information"), text preprocessing edge cases, and the newer contradiction/timeline/citation features via BDD scenarios (`apps/api/features/*.feature`).

**Gaps — not covered by any test:**
- Four routers have no dedicated tests: `legal_intelligence.py`, `precedent_briefs.py`, `rag.py` (the `/api/rag/query` orchestration endpoint described in `RAG_REPORT.md`), and `case_pathway.py`.
- No retrieval-quality evaluation (precision/recall on a labeled query set) — this is tracked separately as #48.
- No coverage measurement tool is installed (`pytest-cov` is not in `requirements.txt`), so line/branch coverage is unknown, not just unreported.
- Tests run entirely against the fake embedder; nothing currently exercises the real MiniLM embedding path or the Ollama/Qwen2.5 generation path in CI.

## Frontend — 26 tests across 4 files, plus a clean build

| File | Tests | Area |
|---|---|---|
| `src/lib/similarCaseFilters.test.ts` | 18 | Similar-case filter logic |
| `src/pages/__tests__/Timeline.test.tsx` | 4 | Chronological event rendering, source-document links |
| `src/pages/__tests__/CaseDetail.test.tsx` | 2 | Contradiction-analysis loading state and rendered conflict pairs |
| `src/pages/__tests__/DocumentDetail.test.tsx` | 2 | Document detail rendering |

`npm run build` (`tsc -b && vite build`) type-checks the whole app and produces a production bundle with no errors — one bundle-size warning only (`index-*.js` at 999 kB / 272 kB gzipped, over Vite's 500 kB chunk-size hint; not a correctness issue, but a candidate for code-splitting later).

**Gaps — not covered by any test:** of the app's 27 pages, only 3 have any test coverage (`Timeline`, `CaseDetail`, `DocumentDetail`). The 9 "live" screens most central to the MVP demo flow — Login, Register, Dashboard, Documents, Cases, Evidence, AI Chat, Similar Cases, Profile — have no component tests; correctness there currently relies on manual testing and the fact that `tsc -b` catches type errors. The 9 "preview" screens (sample-data only) and 7 marketing pages are static/low-risk and are lower priority for testing. No end-to-end tests exist (e.g. Playwright/Cypress) — the MVP demo flow (upload → summarize → ask → similar cases) is currently verified manually.

## CI

`.github/workflows/ci.yml` already runs both suites plus a secret scan on every PR and push to `main`: `pytest` (backend), `npm test` + `npm run build` (frontend), and `gitleaks` over full history. This closes #39, which the MVP docs still list as open — worth updating `MASTER_SYSTEM_DOCUMENT.md` to reflect that.

## Recommendations (not in scope for this report, tracked separately)

1. Add `pytest-cov` and a coverage threshold to CI so gaps are visible, not just known.
2. Add at least smoke tests for the four untested routers (`legal_intelligence`, `precedent_briefs`, `rag`, `case_pathway`) before they're demoed.
3. Add component tests for the remaining 6 untested "live" pages, prioritized by demo importance (AI Chat and Similar Cases first).
4. #48 (retrieval eval harness) is the right place for embedding/generation-quality testing — this report only covers correctness/regression testing, not answer quality.
