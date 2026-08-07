# WakuLAW AWS S3 setup

WakuLAW uses a private S3 bucket as durable storage for legal datasets and user-uploaded source documents. Browser uploads use short-lived presigned PUT URLs, so AWS credentials never enter the frontend.

## 1. Create the bucket

Create one private bucket in the deployment region (for example `ap-south-1`). Keep **Block all public access** enabled. A suggested name is `wakulaw-storage-<unique-suffix>`.

Suggested key layout:

```text
datasets/raw/
datasets/processed/
datasets/metadata/
users/<user_id>/documents/raw/
```

## 2. Configure S3 CORS

For local development, set the bucket CORS configuration to:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "GET", "HEAD"],
    "AllowedOrigins": ["http://localhost:5173"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

When the frontend is deployed, add its exact HTTPS origin (for example the CloudFront/custom-domain origin) and remove origins that are no longer needed.

## 3. Backend IAM permissions

For local development, attach a least-privilege policy to the IAM principal whose credentials are used by boto3. Replace `YOUR_BUCKET` with the actual bucket name:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "WakuLawUserDocuments",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::YOUR_BUCKET/users/*"
    },
    {
      "Sid": "WakuLawDatasets",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::YOUR_BUCKET/datasets/*"
    }
  ]
}
```

For ECS/Fargate, use this policy on the **task role** instead of storing long-lived AWS keys in the container.

## 4. Backend environment

```env
AWS_REGION=ap-south-1
AWS_S3_BUCKET=YOUR_BUCKET
AWS_PRESIGN_EXPIRY_SECONDS=900
MAX_S3_UPLOAD_MB=512
```

Local development can additionally use the standard boto3 variables:

```env
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

Do not commit `.env` or AWS credentials.

## 5. Frontend environment

Switch the existing upload UI to direct S3 mode:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_UPLOAD_MODE=s3
```

The user flow is then:

```text
browser -> FastAPI presign endpoint -> private S3 PUT
        -> FastAPI completion endpoint -> extract/clean
        -> adaptive chunking -> BGE-M3 -> owner-scoped Qdrant
```

## 6. Upload the dataset directory

Preview first:

```powershell
.\.venv\Scripts\python.exe scripts\upload_datasets_to_s3.py --dry-run
```

Then upload/resume:

```powershell
.\.venv\Scripts\python.exe scripts\upload_datasets_to_s3.py
```

The script preserves paths below `datasets/` and skips equal-size objects already present in S3 unless `--force` is supplied.

## 7. Verify

1. Sign in to WakuLAW.
2. Upload a PDF from the existing upload zone.
3. Confirm an object appears under `users/<user_id>/documents/raw/` in S3.
4. Confirm the frontend reports the document's adaptive `num_chunks`.
5. Ask a question whose answer exists only in the newly uploaded document and verify the retrieved source belongs to that document.
6. Sign in as a different user and verify that the first user's document cannot be retrieved.

## Production follow-up

Large S3 transfers no longer pass through the browser-to-FastAPI upload body. The current completion request still performs extraction/chunking/embedding synchronously after S3 upload. The production scaling step is to enqueue completion work (for example SQS -> worker/ECS task), report an ingestion status (`uploaded`, `processing`, `ready`, `failed`), and keep the request path short.
