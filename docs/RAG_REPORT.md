# WakuLAW RAG Orchestration Report

## Architecture and request flow

`POST /api/rag/query` validates the question, then runs: query analysis and intent detection → normalization/filter extraction → TASK-006 retrieval → score ranking and duplicate removal → token-budgeted context → citations → evidence-only prompt → configured LLM → deterministic response validation → final response.

The orchestration package is `ai/rag`. It does not perform legal reasoning, outcome prediction, OCR, document generation, chunking, embedding generation, or vector-store mutation.

## Pipeline stages

- **Query analyzer:** recognizes advice, lookup, similar-case, explanation, procedure, generation, general, and unknown intents. It extracts only explicit court, law, article, section, year, and case-number values.
- **Context builder:** sorts retrieved chunks, removes duplicate IDs/text, respects a configurable token budget, and preserves evidence verbatim.
- **Citation builder:** emits document title, court, case number, law/article, chunk ID, path, and dataset provenance.
- **Prompt builder:** requires evidence-only answers, inline citation IDs, transparent insufficiency, and no fabricated authorities.
- **LLM provider:** a small interface isolates generation from orchestration.
- **Response validator:** detects unknown citation IDs and explicit unsupported laws, case numbers, articles, and sections. Results are `PASS`, `LOW_CONFIDENCE`, or `INSUFFICIENT_EVIDENCE`.

## API endpoint

`POST /api/rag/query`

Request: `{"question": "...", "filters": {"court": "Supreme Court"}}`

Response fields: `answer`, `confidence`, `citations`, `retrieved_chunks`, and `processing_time` (milliseconds). The route is deliberately separate from the legacy `/api/v1/ask` uploaded-document QA endpoint.

## Supported providers

- Fake provider for deterministic offline tests
- OpenAI Responses API (`OPENAI_API_KEY`, never hardcoded)
- Ollama generate API
- OpenAI-compatible local Llama HTTP server

`RAG_LLM_PROVIDER` selects the production provider. Retrieval reuses `ai.retrieval.LegalRetriever`; embedding and Qdrant settings are lazy and environment-backed.

## Limitations and future work

Validation is conservative regex/rule checking, not legal reasoning or entailment. It cannot prove every natural-language claim is supported. Production readiness still requires authentication/authorization policy for the new endpoint, rate limits, provider retry/circuit-breaking, observability, secrets management, calibrated retrieval thresholds, jurisdiction-specific evaluation, and integration tests against a non-production Qdrant collection. Unsupported native filters (law, year, and case number) remain query metadata until TASK-006 adds corresponding filter fields.
