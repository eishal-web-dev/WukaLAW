# Integrated Legal Intelligence and Grounded RAG

## Architecture

Every `/api/rag/query` request now follows: original question → offline Legal Intelligence → typed adapter → `LegalSearchQuery` → existing retriever → context/citations → prompt using the original question → configured LLM → grounded validator. The standalone `/api/legal-intelligence/analyze` endpoint remains unchanged.

## Intelligence-to-retrieval mapping

The adapter uses `normalized_query` only when intelligence confidence is at least 0.5. Explicit articles, sections, courts and document IDs map to typed filters. Case numbers and legal concepts strengthen query text. Law lookups prefer `laws`/`law`; similar-case and appeal intents prefer `judgments`/`judgment`; evidence questions search both. Outcome filtering requires explicit disposition language and is never inferred from advice intent.

A corpus-capabilities profile prevents unvalidated metadata values from being applied. Current validated defaults are datasets `judgments`, `laws`, `labeled_cases`; document types `judgment`, `law`; jurisdiction `Pakistan`; categories `Constitutional Cases`, `Civil Appeals`; and observed language values.

## Filter precedence and fallbacks

Explicit user filters use a fixed allowlist and override intelligence-derived values. Free-form expressions are ignored with warnings. Low-confidence intelligence uses the cleaned original question. If intelligence raises unexpectedly, the legacy direct-RAG analyzer runs and the error is disclosed in `pipeline_warnings`. Empty retrieval skips the LLM and returns `INSUFFICIENT_EVIDENCE` with the intelligence snapshot and attempted filters.

## API contract

`POST /api/rag/query`

```json
{"question":"My boss fired me in Lahore","top_k":10,"score_threshold":null,"filters":{},"use_legal_intelligence":true}
```

The response includes `answer`, `confidence`, `validation_status`, `citations`, `retrieved_chunks`, `original_question`, `retrieval_query`, `legal_intelligence`, `applied_filters`, `pipeline_warnings`, and `processing_time_ms`. Setting `use_legal_intelligence` to false preserves the legacy path.

## Unsupported mappings

Family, Criminal, Tax, Labour and Service category labels are recommendations, but are not applied by default because those exact `case_category` values were not found in current corpus metadata. Provincial jurisdiction values are likewise omitted. PPC, CrPC and constitution are retrieval terms/source preferences, not invented Qdrant collection names.

## Tests, integrity, and production limitations

Tests use fake intelligence, retrievers and LLMs; they make no OpenAI, Ollama, embedding, Qdrant or collection calls. Source datasets, processed documents, chunks, embeddings and Qdrant collections are unchanged. Before production, validate more metadata values, calibrate thresholds, add authenticated API tests, retry/circuit-breaking, observability, and run an integration evaluation against the real BGE-M3/Qdrant deployment without rebuilding assets.
