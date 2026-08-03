# WakuLAW TASK-005 Embedding Report

## Model details

- Model: `BAAI/bge-m3`
- Revision: `5617a9f61b028005a4858fdac845db406aefb181`
- License: verify from the selected model card before redistribution
- Device: cpu
- Embedding dimension: 1024
- Pooling: sentence-transformers pooling
- Normalized: True

## Execution summary

- Source chunks: 70244
- Canonical chunks selected: 200
- Canonical chunks embedded this run: 200
- Duplicate chunks mapped: 131
- Embedding operations avoided: 131
- Effective batch size: 8
- Processing time: 6116.60 seconds
- Estimated vector storage: 819200 bytes
- Truncation count: 0
- Failure count: 0
- Normalization validation: passed
- Source-file integrity: chunks.jsonl verified read-only

## Sample retrieval evaluation

Pending `scripts/evaluate_embeddings.py` sample run.

## Recommendation

Proceed to the full corpus only after sample retrieval review and explicit user approval.
