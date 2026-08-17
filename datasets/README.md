# Datasets

See [`docs/00_MVP/DATASETS.md`](../docs/00_MVP/DATASETS.md) for the full registry of sources and the collection plan.

## Layout

- `sample/` — small cleaned public judgments, committed (used by tests and demos)
- `raw/` — bulk downloads, **gitignored**
- `processed/` — cleaned/chunked outputs, **gitignored**

## Rules

1. Free, public sources only (court websites, Pakistan Code).
2. Record source URL + download date for every file in the manifest below.
3. Committed samples must be < 200 KB each.

## Manifest

The committed-samples manifest below is intentionally empty — `raw/` and `processed/` are gitignored by design, so nothing appears here from a fresh clone. The real corpus is **not missing**; it's collected and hosted in S3-compatible storage (`scripts/upload_datasets_to_s3.py`), not in the repo.

As of the last audit (`docs/DATASET_AUDIT.md`, 2026-08-03): 7,776 documents / 560.9 MiB across `judgments` (3,998), `labeled_cases` (2,809), `laws` (967), and `templates` (2), sourced from the Supreme Court of Pakistan. See `docs/DATASET_AUDIT.md` and `docs/DATASET_LOADER_REPORT.md` for the full breakdown.

| File | Source | Court | Date collected |
|------|--------|-------|----------------|
| _none committed to git — see note above_ | | | |
