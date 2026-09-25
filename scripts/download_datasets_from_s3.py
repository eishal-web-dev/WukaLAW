"""Restore WukaLAW's private legal corpus from S3-compatible storage.

Only objects below ``datasets/raw/`` are downloaded by default. User-upload
objects are outside that prefix and are never touched. Equal-size local files
are skipped, so an interrupted download can be resumed safely.
"""
from __future__ import annotations

import argparse
import os
from pathlib import Path, PurePosixPath

PROJECT_ROOT = Path(__file__).resolve().parents[1]


def _load_env() -> None:
    try:
        from dotenv import load_dotenv
    except ImportError:
        return
    load_dotenv(PROJECT_ROOT / ".env", override=False)
    load_dotenv(PROJECT_ROOT / "apps" / "api" / ".env", override=False)


def _safe_destination(destination: Path, key: str, prefix: str) -> Path:
    normalized_prefix = prefix.strip("/") + "/"
    if not key.startswith(normalized_prefix):
        raise ValueError(f"Object is outside the requested prefix: {key}")
    relative = PurePosixPath(key[len(normalized_prefix):])
    if not relative.parts or any(part in {"", ".", ".."} for part in relative.parts):
        raise ValueError(f"Unsafe object key: {key}")
    target = destination.joinpath(*relative.parts).resolve()
    root = destination.resolve()
    if root not in target.parents:
        raise ValueError(f"Unsafe object key: {key}")
    return target


def parser() -> argparse.ArgumentParser:
    value = argparse.ArgumentParser(
        description="Download the WukaLAW legal source corpus from private S3-compatible storage"
    )
    value.add_argument("--bucket", default=os.getenv("AWS_S3_BUCKET"))
    value.add_argument("--region", default=os.getenv("AWS_REGION", "ap-south-1"))
    value.add_argument("--endpoint-url", default=os.getenv("AWS_S3_ENDPOINT_URL"))
    value.add_argument("--prefix", default="datasets/raw")
    value.add_argument("--destination", type=Path, default=PROJECT_ROOT / "datasets" / "raw")
    value.add_argument("--force", action="store_true")
    value.add_argument("--dry-run", action="store_true")
    return value


def main(argv=None) -> int:
    args = parser().parse_args(argv)
    _load_env()
    # argparse defaults are evaluated before _load_env, so resolve environment
    # values again after both project .env files have been loaded.
    bucket = args.bucket or os.getenv("AWS_S3_BUCKET")
    endpoint = args.endpoint_url or os.getenv("AWS_S3_ENDPOINT_URL")
    region = args.region or os.getenv("AWS_REGION", "ap-south-1")
    if not bucket:
        print("Missing AWS_S3_BUCKET. Add the dataset bucket to .env or pass --bucket.")
        return 2

    try:
        import boto3
    except ImportError:
        print(
            "boto3 is not installed in this Python environment. Activate the WukaLAW virtual environment "
            "and run: python -m pip install -r apps/api/requirements.txt"
        )
        return 2

    kwargs = {"region_name": region}
    if endpoint:
        kwargs["endpoint_url"] = endpoint
    client = boto3.client("s3", **kwargs)
    prefix = args.prefix.strip("/")
    destination = args.destination.resolve()

    paginator = client.get_paginator("list_objects_v2")
    found = downloaded = skipped = total_bytes = 0
    try:
        pages = paginator.paginate(Bucket=bucket, Prefix=prefix + "/")
        for page in pages:
            for item in page.get("Contents", []):
                key = str(item.get("Key") or "")
                if not key or key.endswith("/"):
                    continue
                found += 1
                size = int(item.get("Size") or 0)
                total_bytes += size
                target = _safe_destination(destination, key, prefix)
                if target.is_file() and target.stat().st_size == size and not args.force:
                    skipped += 1
                    print(f"SKIP {target} ({size:,} bytes)")
                    continue
                if args.dry_run:
                    print(f"WOULD DOWNLOAD s3://{bucket}/{key} -> {target} ({size:,} bytes)")
                    continue
                target.parent.mkdir(parents=True, exist_ok=True)
                print(f"DOWNLOAD s3://{bucket}/{key} -> {target} ({size:,} bytes)")
                client.download_file(bucket, key, str(target))
                downloaded += 1
    except Exception as exc:
        print(f"Dataset download failed: {type(exc).__name__}: {exc}")
        return 1

    if found == 0:
        print(
            f"No objects were found under s3://{bucket}/{prefix}/. "
            "Check AWS_S3_BUCKET/AWS_S3_ENDPOINT_URL or restore the corpus from its original backup."
        )
        return 1
    action = "planned" if args.dry_run else "downloaded"
    print(
        f"Done: objects={found}, {action}={found - skipped if args.dry_run else downloaded}, "
        f"skipped={skipped}, total={total_bytes / (1024 ** 2):.2f} MiB, destination={destination}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
