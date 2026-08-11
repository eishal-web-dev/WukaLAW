# Canonical AI Package

All WukaLAW AI implementations live under repository-root `ai/`.

| Capability | Canonical package |
|---|---|
| analysis and citations | `ai.analysis`, `ai.citations` |
| chunking and ingestion helpers | `ai.chunking`, `ai.preprocessing` |
| embeddings | `ai.embeddings` |
| uploaded-document and corpus retrieval | `ai.retrieval` |
| QA and grounded RAG | `ai.qa`, `ai.rag` |
| timelines | `ai.timeline` |
| summaries | `ai.summarization` |
| OCR | `ai.ocr` |
| legal intelligence and similar cases | `ai.legal_intelligence`, `ai.similar_cases` |
| vector storage | `ai.vectorstore` |

`apps/api/ai/__init__.py` is a compatibility bridge for the established `cd apps/api && uvicorn app.main:app` launch command. It contains no implementation and points package discovery exclusively at root `ai/`. `apps/api/app/main.py` no longer mutates `sys.path`.

The regression test `apps/api/tests/test_ai_import_paths.py` asserts that representative backend imports resolve to files below root `ai/`. New AI modules must not be added under `apps/api/ai`.
