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

## Retrieval quality: hybrid search and reranking (#47, #46)

`docs/STRATIFIED_RETRIEVAL_REPORT.md` ran a 600-chunk stratified evaluation of dense BGE-M3 retrieval and found a simple lexical baseline beating it at every reported cutoff (Recall@10 0.7368 vs 0.5263, MRR 0.5577 vs 0.4467), with dense semantic-style queries especially weak. Its recommendation was hybrid dense + lexical retrieval, metadata filtering, and reranking.

`ai/retrieval/hybrid.py` implements the retrieval-quality half of that recommendation as composable wrappers around any `Retriever` (anything with `.search(query) -> list[LegalSearchResult]`), so they don't require changes to the Qdrant collection or `RagPipeline` itself:

- **`HybridRetriever`** (#47) — overfetches from the dense retriever, computes a BM25-flavoured lexical score over the retrieved candidate pool (not the full corpus, which live Qdrant retrieval doesn't have cheap access to), and fuses it with the normalized dense score.
- **`LexicalOverlapReranker`** (#46) — free, offline reranking pass using the same lexical score, always available.
- **`CrossEncoderReranker`** (#46) — higher-quality reranking via a `sentence-transformers` `CrossEncoder` model; needs that package and network/cache access to the model on first use, and raises `RerankerUnavailableError` (surfaced as a 503) if unavailable rather than silently degrading.
- **`RerankingRetriever`** — composes a reranker onto any retriever, so hybrid retrieval and reranking can be combined or used independently.

Both are off by default (`apps/api/app/routers/rag.py`'s `_build_retriever`), so a fresh deployment keeps today's plain dense-only behavior. Opt in via env vars:

| Variable | Values | Default |
|---|---|---|
| `RETRIEVAL_MODE` | `dense`, `hybrid` | `dense` |
| `RETRIEVAL_HYBRID_DENSE_WEIGHT` | 0.0–1.0 | `0.6` |
| `RAG_RERANKER` | `none`, `lexical`, `cross_encoder` | `none` |
| `CROSS_ENCODER_MODEL` | any sentence-transformers cross-encoder | `BAAI/bge-reranker-base` |

**Not yet done:** the stratified eval harness (`ai/evaluation/`) hasn't been re-run against `HybridRetriever`/`RerankingRetriever` on the real 70k-chunk corpus to confirm the numeric improvement predicted by the lexical-baseline comparison — that corpus lives in S3 and Qdrant, not in this repo, so re-running it needs the full dataset environment. `scripts/evaluate_stratified_retrieval.py` should be pointed at a `HybridRetriever`-wrapped collection to close that loop.

## Limitations and future work

Validation is conservative regex/rule checking, not legal reasoning or entailment. It cannot prove every natural-language claim is supported. Production readiness still requires authentication/authorization policy for the new endpoint, rate limits, provider retry/circuit-breaking, observability, secrets management, calibrated retrieval thresholds, jurisdiction-specific evaluation, and integration tests against a non-production Qdrant collection. Unsupported native filters (law, year, and case number) remain query metadata until TASK-006 adds corresponding filter fields.
