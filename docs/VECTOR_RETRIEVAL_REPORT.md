# WakuLAW TASK-006 Vector Retrieval Report

## Architecture

TASK-006 adds an isolated root `ai/vectorstore` Qdrant adapter and an
`ai/retrieval` legal search layer. Existing API FAISS and RAG modules remain
unchanged. Query text is embedded by an explicitly selected provider, filtered
with typed Qdrant models, and returned as traceable canonical legal results.
No legal answer or recommendation is generated.

## Dependency and configuration

- Qdrant client: 1.18.0
- Modes: remote/server and embedded local storage
- Fake collection: `wakulaw_fake_sample`
- Dimension: 32
- Distance: cosine
- Embedded path: `datasets/processed/qdrant_fake_sample`
- Production default: `http://localhost:6333`, collection `wakulaw_legal_chunks`
- Optional server compose file: `docker/qdrant-compose.yml`

Payload indexes are requested for source dataset, document type, court,
jurisdiction, case category, language, chunk type, explicit outcome, document
ID, and canonical chunk ID. Embedded Qdrant accepts these declarations but
warns that payload indexes have no performance effect locally; server Qdrant
creates operational indexes.

## Fake-sample indexing

- Metadata rows: 200
- Vector rows: 200
- Points indexed: 200
- Batches: 4 at 50 points
- Indexing duration: 6.07 seconds
- Rejected records: 0
- Verified point count: 200
- Exact duplicates remain mapped through `source_chunk_ids` and
  `duplicate_sources`; only canonical embeddings are stored as points.

## Fake-provider search

Engineering validation only; these are not production semantic results.

- Query: `income tax assessment appeal`
- Top-k: 5
- Search latency: 25.06 ms
- Rank 1: `THE INCOME TAX ORDINANCE, 2001`, score 0.5139,
  canonical chunk `wc_0061c894ee8841198b2041eb731ffcbb`
- Rank 2: labeled constitutional-petition judgment, score 0.5074; its duplicate
  source mapping was preserved.
- Rank 3: Code of Criminal Procedure section, score 0.5068; duplicate mapping
  preserved.

## Filters validated

- Exact and multi-value filters
- Dataset, document type, court, jurisdiction, case category, and language
- Chunk type, document ID, section, and article
- Explicit-outcome-only retrieval
- Score thresholds and clean no-result responses

## Safety protections

- Deterministic UUID point IDs derived from canonical chunk IDs
- Idempotent upserts and resume-safe replay
- Explicit `--recreate` plus `--confirm-recreate` requirement
- Metadata/vector alignment and dimension validation
- Sequential vector-index validation
- Dry-run support
- No silent FAISS fallback
- No implicit embedding-provider fallback

## Production readiness gaps

- Real BGE-M3 vectors do not exist because the TASK-005 model download stalled.
- Production collection dimension must be 1024 and validated against real
  artifacts before indexing.
- Payload-index performance must be validated against server Qdrant, not local
  embedded mode.
- Retrieval thresholds require calibration with real BGE-M3 evaluation results.

Future production flow: start Qdrant using the optional compose file, create a
1024-dimensional cosine collection, generate approved BGE-M3 artifacts, dry-run
the indexer, then perform resumable batched indexing and retrieval evaluation.

## Source integrity

- No raw, manifest, cleaned-document, chunk, or embedding sample source was
  opened for writing.
- No BGE-M3 download or full-corpus embedding generation was attempted.
- Generated embedded-Qdrant storage remains ignored by Git.
