"""Upload WakuLAW source-of-truth datasets to private S3-compatible storage.

By default this uploads only ``datasets/raw`` and ``datasets/metadata``.
Generated artifacts under ``datasets/processed`` (chunks, embeddings, NumPy
vectors, and embedded Qdrant databases) are intentionally excluded because
those can be regenerated and would waste limited cloud storage.

The uploader supports AWS S3 as well as S3-compatible providers such as
Supabase Storage through ``AWS_S3_ENDPOINT_URL``. Existing objects with the
same size are skipped during real uploads, so repeated runs are resumable.
Dry runs are intentionally local-only: they do not issue one remote HEAD
request per file, which keeps large corpus planning fast.
"""
from __future__ import annotations

import argparse
import os
from pathlib import Path

import boto3
from botocore.exceptions import ClientError
from dotenv import load_dotenv

DEFAULT_INCLUDE = ("raw", "metadata")
PROJECT_ROOT = Path(__file__).resolve().parents[1]


def _load_project_env() -> None:
    """Load the repository-root .env before argparse reads environment defaults."""
    load_dotenv(PROJECT_ROOT / ".env", override=True)


def parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description="Upload WakuLAW source datasets to S3-compatible storage")
    p.add_argument("--bucket", default=os.getenv("AWS_S3_BUCKET"), help="Destination bucket")
    p.add_argument("--region", default=os.getenv("AWS_REGION", "ap-south-1"))
    p.add_argument("--endpoint-url", default=os.getenv("AWS_S3_ENDPOINT_URL"), help="Custom S3 endpoint (for Supabase/R2/etc.)")
    p.add_argument("--source", default=str(PROJECT_ROOT / "datasets"), help="Local dataset directory")
    p.add_argument("--prefix", default="datasets", help="Remote key prefix")
    p.add_argument(
        "--include",
        nargs="+",
        default=list(DEFAULT_INCLUDE),
        help="Top-level dataset folders to upload (default: raw metadata)",
    )
    p.add_argument("--force", action="store_true", help="Upload even when an equal-size object exists")
    p.add_argument("--dry-run", action="store_true", help="Plan locally without contacting object storage")
    p.add_argument("--verbose", action="store_true", help="Print every file during dry-run/upload")
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


def iter_files(source: Path, include: list[str]):
    for name in include:
        root = source / name
        if not root.exists():
            print(f"WARN  skipped missing folder: {root}")
            continue
        if not root.is_dir():
            print(f"WARN  skipped non-directory: {root}")
            continue
        for path in sorted(p for p in root.rglob("*") if p.is_file()):
            if path.name == ".lock" or "__pycache__" in path.parts:
                continue
            yield path


def main() -> int:
    _load_project_env()
    args = parser().parse_args()
    if not args.bucket:
        raise SystemExit("Missing AWS_S3_BUCKET in the root .env or pass --bucket")

    source = Path(args.source).resolve()
    if not source.is_dir():
        raise SystemExit(f"Dataset directory not found: {source}")

    include = [item.strip("/\\") for item in args.include if item.strip("/\\")]
    print("Bucket:", args.bucket)
    print("Region:", args.region)
    print("Included dataset folders:", ", ".join(include) or "(none)")
    if args.endpoint_url:
        print("Using S3-compatible endpoint:", args.endpoint_url)

    files = list(iter_files(source, include))

    # Planning should be instant-ish and deterministic. Do not make thousands
    # of remote HEAD calls merely to calculate the prospective upload size.
    if args.dry_run:
        total_bytes = sum(path.stat().st_size for path in files)
        if args.verbose:
            prefix = args.prefix.strip("/")
            for path in files:
                relative = path.relative_to(source).as_posix()
                key = f"{prefix}/{relative}" if prefix else relative
                print(f"WOULD UPLOAD  {path} -> s3://{args.bucket}/{key} ({path.stat().st_size:,} bytes)")
        print(
            "Dry-run summary. "
            f"files={len(files)} "
            f"total={total_bytes / (1024 ** 2):.2f} MiB "
            "remote_requests=0"
        )
        return 0

    kwargs: dict[str, object] = {"region_name": args.region}
    if args.endpoint_url:
        kwargs["endpoint_url"] = args.endpoint_url
    client = boto3.client("s3", **kwargs)

    uploaded = skipped = 0
    uploaded_bytes = skipped_bytes = 0
    prefix = args.prefix.strip("/")

    for path in files:
        relative = path.relative_to(source).as_posix()
        key = f"{prefix}/{relative}" if prefix else relative
        size = path.stat().st_size

        if not args.force and same_size(client, args.bucket, key, size):
            if args.verbose:
                print(f"SKIP  s3://{args.bucket}/{key} ({size:,} bytes)")
            skipped += 1
            skipped_bytes += size
            continue

        print(f"UPLOAD  {path} -> s3://{args.bucket}/{key} ({size:,} bytes)")
        client.upload_file(str(path), args.bucket, key)
        uploaded += 1
        uploaded_bytes += size

    print(
        "Done. "
        f"uploaded={uploaded} ({uploaded_bytes / (1024 ** 2):.2f} MiB) "
        f"skipped={skipped} ({skipped_bytes / (1024 ** 2):.2f} MiB)"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
