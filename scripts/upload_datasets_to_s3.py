"""Upload WakuLAW dataset artifacts to private S3 storage.

This intentionally preserves the local relative path beneath ``datasets/`` so
raw, processed, metadata, and evaluation artifacts remain easy to audit.
Existing objects with the same size are skipped by default, making repeated
runs inexpensive and effectively resumable.
"""
from __future__ import annotations

import argparse
import os
from pathlib import Path

import boto3
from botocore.exceptions import ClientError


def parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description="Upload WakuLAW datasets to S3")
    p.add_argument("--bucket", default=os.getenv("AWS_S3_BUCKET"), help="Destination S3 bucket")
    p.add_argument("--region", default=os.getenv("AWS_REGION", "ap-south-1"))
    p.add_argument("--source", default="datasets", help="Local dataset directory")
    p.add_argument("--prefix", default="datasets", help="S3 key prefix")
    p.add_argument("--force", action="store_true", help="Upload even when an equal-size object exists")
    p.add_argument("--dry-run", action="store_true")
    return p


def same_size(client, bucket: str, key: str, size: int) -> bool:
    try:
        response = client.head_object(Bucket=bucket, Key=key)
        return int(response.get("ContentLength") or -1) == size
    except ClientError as exc:
        code = str(exc.response.get("Error", {}).get("Code", ""))
        if code in {"404", "NoSuchKey", "NotFound"}:
            return False
        raise


def main() -> int:
    args = parser().parse_args()
    if not args.bucket:
        raise SystemExit("Missing --bucket or AWS_S3_BUCKET")

    source = Path(args.source).resolve()
    if not source.is_dir():
        raise SystemExit(f"Dataset directory not found: {source}")

    client = boto3.client("s3", region_name=args.region)
    uploaded = skipped = 0
    prefix = args.prefix.strip("/")

    for path in sorted(p for p in source.rglob("*") if p.is_file()):
        # Embedded Qdrant lock files are process-local and should never be archived.
        if path.name == ".lock" or "__pycache__" in path.parts:
            continue
        relative = path.relative_to(source).as_posix()
        key = f"{prefix}/{relative}" if prefix else relative
        size = path.stat().st_size

        if not args.force and same_size(client, args.bucket, key, size):
            print(f"SKIP  s3://{args.bucket}/{key} ({size:,} bytes)")
            skipped += 1
            continue

        print(f"{'WOULD UPLOAD' if args.dry_run else 'UPLOAD'}  {path} -> s3://{args.bucket}/{key}")
        if not args.dry_run:
            client.upload_file(str(path), args.bucket, key)
        uploaded += 1

    print(f"Done. uploaded={uploaded} skipped={skipped} dry_run={args.dry_run}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
