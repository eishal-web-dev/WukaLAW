# Official family-judgment import

This importer copies official Sindh High Court family-law judgments into the
existing private Supabase Storage dataset. It does not download the whole
Supabase bucket to the computer.

It deliberately excludes criminal bail, murder, customs and tax records. A
generic word such as `custody` is not enough: the record must contain a specific
family-law signal. Each uploaded object keeps its official source, category,
SHA-256 digest and a manifest entry for auditing and deduplication.

## Configure

Keep secrets in the repository-root `.env`, never in Git:

```dotenv
SUPABASE_URL=https://dbsjitaqtyzrriyuycku.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<existing server-side service-role key>
AWS_S3_BUCKET=wakulaw-documents
```

The service-role key is a server/operator credential. It must stay in the root
`.env` and must never be added to the web frontend. If preferred, the importer
also supports the existing Supabase S3 variables used by
`upload_datasets_to_s3.py`.

## Preview and import

From the activated project virtual environment:

```powershell
python scripts\import_official_family_judgments.py --limit 500 --dry-run
python scripts\import_official_family_judgments.py --limit 500
```

Files are uploaded under:

```text
wakulaw-documents/datasets/raw/family_judgments/<category>/
```

The command is resumable. Existing official document IDs are skipped. If the
official source has fewer than 500 records that pass the safety filter, it
imports the smaller verified set rather than padding it with irrelevant cases.

After the copy completes, run the project's Supabase legal-corpus indexer on
`datasets/raw/family_judgments/` so Similar Cases searches the new judgments.
