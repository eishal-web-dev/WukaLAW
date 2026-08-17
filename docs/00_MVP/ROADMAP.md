# WakuLaw — Development Roadmap

> **Status (2026-08-17):** M0–M8 are functionally complete — the MVP (auth, documents, cases, summarization, RAG Q&A with local LLM, similar cases, Figma UI) is merged and running. **M9 is now complete**: testing report (#38), CI (#39, was already live but undocumented), user guide (#40), demo script (#37), and dataset collection (#24, was already done — 7,776 documents in S3, just undocumented) — all written up in `docs/TESTING_REPORT.md`, `docs/12_User_Guide/User_Guide.md`, `docs/00_MVP/DEMO_SCRIPT.md`, and `datasets/README.md` respectively. The RAG quality track (#46 reranker, #47 hybrid search) is implemented and pending PR review (`ai/51-rag-quality-hybrid-reranker`); #48 (eval harness) was already done — see `docs/STRATIFIED_RETRIEVAL_REPORT.md`. M10 (prediction) stays optional. See `MASTER_SYSTEM_DOCUMENT.md` for the full current-state description.

Each phase maps to a GitHub milestone. Work proceeds one issue at a time: issue → branch → pull request → review → merge. Milestone order is the dependency order; do not start a phase before its prerequisites are merged.

## Phase overview

| Milestone | Phase | Deliverables | Depends on |
|-----------|-------|--------------|------------|
| M0 | Repository Setup | Folder structure, contribution docs, templates, filled placeholder files | — |
| M1 | MVP Scope & Requirements | MVP scope, roadmap, architecture, datasets, ethics docs | M0 |
| M2 | Frontend Foundation | React + Vite + TS + Tailwind app with all MVP pages on dummy data | M1 |
| M3 | Backend Foundation | FastAPI app, SQLite models, upload/list/detail endpoints, frontend connected | M1 |
| M4 | Document Processing | Text extraction (.txt/.pdf), cleaning, chunking, sample dataset collected | M3 |
| M5 | Similar Case Search | sentence-transformers embeddings + FAISS index + search endpoint + UI | M4 |
| M6 | Summarization | Summarization pipeline + endpoint + UI with disclaimer | M4 |
| M7 | Legal Q&A (RAG) | Retrieval + grounded answer generation with sources + `/ask` endpoint + UI | M5 |
| M8 | Explainability & Dashboard | Confidence scoring, evidence panel, live dashboard | M7 |
| M9 | Testing, Docs & Demo | pytest suite, CI, testing report, user guide, demo script | M8 |
| M10 | Prediction Prototype (optional) | Labeled mini-dataset + TF-IDF/LogReg baseline with honest metrics | M9 |

## Definition of done (every issue)

1. Code builds (`npm run build`) / tests pass (`pytest`) locally.
2. PR references its issue (`Closes #N`) and describes what/why/testing.
3. Reviewed by the other team member before merge.
4. No secrets, datasets, DB files, or model artifacts committed.

## Suggested execution order (issue numbers)

M0/M1: #1 #2 #3 #4 #5 #6 #7 → M2: #8 #9 #10 #11 #12 #13 #14 #15 → M3: #16 #17 #18 #19 #20 → M4: #21 #22 #23 #24 → M5: #25 #26 #27 #28 → M6: #29 #30 → M7: #31 #32 #33 → M8: #34 #35 #36 → M9: #37 #38 #39 #40 → M10 (optional): #41

## Demo flow (target for the final presentation)

Open WakuLaw → upload a judgment → view extracted text → generate summary → ask a legal question → show answer with sources and confidence → find similar cases → show explainability panel → present limitations and future scope.
