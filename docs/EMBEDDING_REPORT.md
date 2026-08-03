# WakuLAW TASK-005 Embedding Report

## Model status

- Requested production model: `BAAI/bge-m3`
- Model license: MIT (per model-card metadata; verify again before redistribution)
- Intended embedding dimension: 1024 dense dimensions
- Pooling: sentence-transformers model pooling
- Normalization: L2 normalization for cosine similarity
- Detected device: CPU (`torch 2.12.1+cpu`); CUDA unavailable
- Cache status: model weights are not cached locally
- BGE-M3 sample status: blocked before model load because the download stalled after metadata retrieval
- No substitute production model was used

## Engineering validation sample

The real-model sample could not run. A separately named deterministic fake-model
sample was generated only to validate deduplication, batching, normalization,
atomic artifact writing, mappings, and evaluation plumbing.

- Provider: `fake-deterministic` (`test-v1`)
- Dimension: 32
- Device: CPU
- Source chunks scanned: 70,244
- Canonical sample chunks embedded: 200
- Duplicate chunks mapped in the selected sample: 131
- Embedding operations avoided: 131
- Batch size: 8
- Processing time: 70.38 seconds
- Truncation warnings: 150 (fake provider has a deliberately small test limit)
- Failures: 0
- Normalization validation: passed
- Metadata/vector alignment: 200 metadata rows and 200 vector rows

## Fake-sample retrieval metrics

These are engineering-test metrics, not BGE-M3 quality measurements.

- Recall@1: 0.0833
- Recall@5: 0.0833
- Recall@10: 0.1667
- MRR: 0.0938

Example results:

- `income tax assessment appeal`: relevant Income Tax Ordinance chunk ranked first.
- `service matter promotion seniority`: first rule-matched result ranked eighth.
- `constitutional protection of fundamental rights`: no rule-matched result in the top 10.
- The no-match query produced low scores but no calibrated rejection threshold yet.

## Full-corpus estimate

- Source chunks: 70,244
- Exact canonical groups: 42,649
- Duplicate embedding operations avoided: 27,595
- Estimated float32 BGE-M3 vector storage: 174,690,304 bytes (about 166.6 MiB), excluding metadata/index overhead
- Recommended CPU batch size: 4, with automatic fallback to 2 then 1
- Runtime: likely many hours on this CPU-only environment; a reliable range requires a successful real-model sample

## Warnings

- BGE-M3 is not locally cached and its download made no progress beyond repository metadata.
- Real sample retrieval quality, actual model revision, actual maximum input handling, and measured BGE-M3 runtime remain unvalidated.
- The fake sample must not be used as a production embedding artifact.

## Recommendation

Do **not** proceed to full embedding generation yet. First complete the exact
`BAAI/bge-m3` 200-chunk sample on a machine/network that can load the model,
evaluate its retrieval output, then request explicit approval for the full run.

## Source integrity

- `datasets/processed/chunks.jsonl` remained unchanged.
- SHA-256 before and after: `BD653ED61514FCEFCB523A4DB4B3AAEFE48AB3B9AF4D68D57DEA9F8397616CE1`
- No source dataset was opened for writing.
- No full-corpus embeddings were generated.
