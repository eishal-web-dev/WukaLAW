# WakuLAW BGE-M3 Embedding Sample Report

## Diagnosis and model acquisition

- Exact model: `BAAI/bge-m3` (no fallback)
- Resolved revision: `5617a9f61b028005a4858fdac845db406aefb181`
- Cache: `C:\Users\USER\.cache\huggingface\hub\models--BAAI--bge-m3`
- Weight file: 2,271,145,830 bytes (about 2.12 GiB); complete snapshot has no `.incomplete` files or active locks
- Available C: space during validation: 31.55 GiB
- Live metadata request: succeeded unauthenticated in 1.56 seconds
- Authentication/gating: public, not gated
- Remote code: not required (`auto_map` absent; standard `XLMRobertaModel`)
- Packages: sentence-transformers 5.6.0, transformers 5.13.0, torch 2.12.1, huggingface-hub 1.22.0, Python 3.14.4

The earlier apparent stall was not an SSL, authentication, compatibility, or file-lock failure. Xet logs show successful 200/206 transfers but only roughly 0.4 MB/s for a 2.27 GB weight. After download, CPU inference was also slow and had limited visible progress. The original download duration was not instrumented, so it cannot be reported exactly; this run downloaded zero bytes because the verified revision was already complete. Cache-only model load took 13.22 seconds, and one query plus one document validation completed in 105.49 seconds including load.

Reliability improvements add an explicit cache directory, cache-only mode, Hugging Face timeouts, bounded retry/backoff, pinned revision support, visible load/failure logging, actionable errors, and explicit `trust_remote_code=False`. SSL verification remains enabled and no token is stored in source.

## Exact-model validation

- Device: CPU
- Dimension: 1024
- Pooling: sentence-transformers pooling
- Query vector: `(1, 1024)`, norm 0.99999988
- Document vector: `(1, 1024)`, norm 1.0
- Finite values only: passed
- Normalized output: passed

## 200-canonical-chunk sample

A prior completed exact-model sample was found under the generic `embedding_*_sample` names and validated before reuse. It is the same deterministic first-200 canonical selection, exact revision, dimension and CPU provider. It was copied to the required BGE-M3-specific filenames without deleting or altering existing fake samples. A redundant batch-size-4 run reached 16/200 with zero failures and no memory fallback before being stopped to avoid repeating approximately 1.5 hours of CPU work.

- Source chunks scanned: 70,244
- Canonical chunks in sample: 200
- Completed sample generation time: 6,116.60 seconds (historical exact run)
- Completed artifact effective batch size: 8
- Current requested batch-size-4 attempt: stable at 16 chunks, then intentionally stopped as duplicate work
- Batch-size fallbacks: none; no retries at 2 or 1 were needed
- Metadata/vector rows: 200 / 200
- Vector matrix: `(200, 1024)`
- Sequential indexes: passed
- Normalization and finite-value checks: passed
- Source-to-canonical mappings: 331, valid
- Duplicate operations avoided: 131
- Source `chunks.jsonl` SHA-256: `bd653ed61514fcefcb523a4db4b3aaefe48ab3b9af4d68d57dea9f8397616ce1`

Generated local, uncommitted artifacts:

- `datasets/processed/embeddings_bge_m3_sample.jsonl`
- `datasets/processed/embedding_vectors_bge_m3_sample.npy`
- `datasets/processed/embedding_index_bge_m3_sample.json`
- `datasets/processed/embedding_evaluation_bge_m3_sample.json`

## Retrieval evaluation

- Labeled queries: 12
- Recall@1: 0.1667
- Recall@5: 0.4167
- Recall@10: 0.5000
- MRR: 0.2812
- Evaluation runtime: 169 seconds, including cached model load and CPU query embedding

| ID | Query | First relevant rank | Top result | Top score |
|---|---|---:|---|---:|
| q01 | constitutional protection of fundamental rights | 2 | THE FEDERAL OMBUDSMEN INSTITUTIONAL REFORMS ACT | 0.5391 |
| q02 | punishment for murder under criminal law | 8 | 1188 C.A Supreme (2067) | 0.5358 |
| q03 | grounds for deciding a civil appeal | 2 | 530 C.A Supreme (1475) | 0.5676 |
| q04 | family dispute maintenance and custody | none | THE SECURITIES AND EXCHANGE COMMISSION OF | 0.5096 |
| q05 | service matter promotion seniority | 1 | 2242 C.A Supreme (488) | 0.5520 |
| q06 | income tax assessment appeal | 1 | THE INCOME TAX ORDINANCE, 2001 | 0.5672 |
| q07 | grant of post arrest bail | none | 1527 C.A Supreme (2372) | 0.5180 |
| q08 | admissibility and burden of evidence | none | 542 C.A Supreme (1486) | 0.5717 |
| q09 | appointment of judges judicial commission | 4 | 1867 C.A Supreme (2679) | 0.5630 |
| q10 | legal notice template demand | none | CODE OF CRIMINAL PROCEDURE, 1898 | 0.5546 |
| q11 | appeal is dismissed final order | none | 235 C.A Supreme (1209) | 0.5403 |
| q12 | quantum computing satellite propulsion | none | 1613 C.A Supreme (245) | 0.3979 |

The full top-10 lists and scores are stored in the local evaluation JSON.

## Full-corpus estimate and recommendation

At the measured completed-sample rate, approximately 42,649 canonical chunks would take about 1,304,334 seconds, or 15.1 days, on this CPU-only machine. Estimated generated artifact storage is about 250 MiB: 166.6 MiB vectors, 67.7 MiB metadata, and 16.2 MiB indexes, in addition to the 2.12 GiB model weights.

**Recommendation: do not proceed with full-corpus embedding on this CPU-only machine yet.** Recall@10 is only 0.50 on a small, deterministic first-200 sample, which is not representative of all legal domains. First run a stratified sample across datasets/domains and review retrieval labels. If quality is acceptable, use GPU or managed batch infrastructure, checkpoint/resume, and explicit operational approval before generating the full corpus or indexing Qdrant.
