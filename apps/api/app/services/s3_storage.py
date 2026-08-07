"""Private S3 storage helpers for direct browser uploads.

The browser never receives AWS credentials. FastAPI creates a short-lived
presigned PUT URL for one object key, the browser uploads directly to S3, and
then FastAPI ingests that object into the normal WakuLAW document pipeline.
"""
from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path
from uuid import uuid4

from botocore.exceptions import BotoCoreError, ClientError

from app.config import settings

_SAFE_NAME = re.compile(r"[^A-Za-z0-9._-]+")


class S3StorageError(RuntimeError):
    pass


@dataclass(frozen=True)
class PresignedUpload:
    upload_url: str
    object_key: str
    expires_in: int
    headers: dict[str, str]


def enabled() -> bool:
    return bool(settings.aws_s3_bucket)


def _client():
    if not enabled():
        raise S3StorageError("AWS S3 storage is not configured")
    try:
        import boto3
    except ImportError as exc:
        raise S3StorageError("boto3 is not installed") from exc

    kwargs: dict[str, object] = {"region_name": settings.aws_region}
    # Useful for LocalStack/MinIO integration tests; leave unset in AWS.
    if settings.aws_s3_endpoint_url:
        kwargs["endpoint_url"] = settings.aws_s3_endpoint_url
    return boto3.client("s3", **kwargs)


def _safe_filename(filename: str) -> str:
    name = Path(filename).name.strip() or "upload.bin"
    safe = _SAFE_NAME.sub("_", name)
    return safe[:180]


def owner_prefix(owner_id: int) -> str:
    return f"users/{owner_id}/documents/raw/"


def new_object_key(owner_id: int, filename: str) -> str:
    return f"{owner_prefix(owner_id)}{uuid4().hex}_{_safe_filename(filename)}"


def assert_owned_key(owner_id: int, object_key: str) -> None:
    if not object_key.startswith(owner_prefix(owner_id)):
        raise S3StorageError("S3 object does not belong to the authenticated user")


def create_presigned_upload(
    owner_id: int,
    filename: str,
    content_type: str,
    *,
    expires_in: int | None = None,
) -> PresignedUpload:
    key = new_object_key(owner_id, filename)
    ttl = int(expires_in or settings.aws_presign_expiry_seconds)
    params = {
        "Bucket": settings.aws_s3_bucket,
        "Key": key,
        "ContentType": content_type,
    }
    try:
        url = _client().generate_presigned_url(
            "put_object",
            Params=params,
            ExpiresIn=ttl,
            HttpMethod="PUT",
        )
    except (BotoCoreError, ClientError) as exc:
        raise S3StorageError(f"Could not create S3 upload URL: {exc}") from exc
    return PresignedUpload(url, key, ttl, {"Content-Type": content_type})


def head_object(owner_id: int, object_key: str) -> dict:
    assert_owned_key(owner_id, object_key)
    try:
        return _client().head_object(Bucket=settings.aws_s3_bucket, Key=object_key)
    except (BotoCoreError, ClientError) as exc:
        raise S3StorageError(f"Could not read S3 object metadata: {exc}") from exc


def read_object(owner_id: int, object_key: str) -> tuple[bytes, str | None]:
    assert_owned_key(owner_id, object_key)
    try:
        response = _client().get_object(Bucket=settings.aws_s3_bucket, Key=object_key)
        body = response["Body"].read()
        return body, response.get("ContentType")
    except (BotoCoreError, ClientError) as exc:
        raise S3StorageError(f"Could not download S3 object: {exc}") from exc


def delete_object(owner_id: int, object_key: str) -> None:
    assert_owned_key(owner_id, object_key)
    try:
        _client().delete_object(Bucket=settings.aws_s3_bucket, Key=object_key)
    except (BotoCoreError, ClientError) as exc:
        raise S3StorageError(f"Could not delete S3 object: {exc}") from exc
