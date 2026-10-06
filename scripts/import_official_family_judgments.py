"""Copy verified family-law judgments from an official court into Supabase Storage.

The importer is intentionally conservative.  It accepts only records whose
metadata contains a family-law signal and rejects criminal/customs records even
when they happen to contain a word such as "custody".  Re-running it is safe:
objects are keyed by their official document id and uploaded only when missing.

This script stores the original judgment files and a JSONL manifest.  Run the
existing corpus indexer afterwards so Similar Cases can search their contents.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import sys
import time
from dataclasses import asdict, dataclass
from html.parser import HTMLParser
from pathlib import Path
from typing import Iterable
from urllib.parse import urljoin, urlparse

import boto3
import httpx
from botocore.exceptions import ClientError
from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parents[1]
SHC_INDEX_URL = (
    "https://caselaw.shc.gov.pk/caselaw/public/home/public/public/public/"
    "public/public/reported-judgements"
)
SHC_BASE_URL = "https://caselaw.shc.gov.pk/caselaw/public/"
DEFAULT_PREFIX = "datasets/raw/family_judgments"

CATEGORY_TERMS: dict[str, tuple[str, ...]] = {
    "dower_mehr": ("dower", "mehr", "mahr", "haq mehr", "haq mahar", "nikahnama", "nikah nama"),
    "dowry_recovery": ("dowry", "dowry articles", "jahez", "jahaiz"),
    "custody_guardianship": (
        "custody of minor", "custody of minors", "child custody", "guardian court",
        "guardians and wards", "welfare of minor", "visitation",
    ),
    "maintenance": (
        "maintenance of minor", "maintenance allowance", "child maintenance",
        "wife maintenance", "family maintenance",
    ),
    "khula_divorce": ("khula", "dissolution of marriage", "divorce", "talaq"),
}
FAMILY_SIGNALS = (
    "family matter", "family court", "family courts act", "guardian court",
    "guardians and wards", "custody of minor", "custody of minors", "dower",
    "dowry", "mehr", "mahr", "khula", "dissolution of marriage",
    "maintenance of minor", "maintenance allowance", "nikahnama", "nikah nama",
)
HARD_EXCLUSIONS = (
    "criminal appeal", "cr.bail", "cr. bail", "pre arrest bail", "post arrest bail",
    "custom matter", "customs", "sales tax", "income tax", "narcotic", "murder",
    "section 302", "anti-terrorism", "anti terrorism",
)


@dataclass(frozen=True)
class Judgment:
    official_id: str
    title: str
    category: str
    citation: str
    matter: str
    summary: str
    order_date: str
    download_url: str
    source_page: str = SHC_INDEX_URL
    court: str = "Sindh High Court"
    jurisdiction: str = "Pakistan"


class SHCParser(HTMLParser):
    """Parse the stable blockquote-based public SHC listing without browser code."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.records: list[dict[str, str]] = []
        self.current: dict[str, str] | None = None
        self.depth = 0
        self.capture: str | None = None

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        if tag == "blockquote":
            self.current = {"text": "", "title": "", "href": "", "matter": "", "summary": "", "date": "", "reference": ""}
            self.depth = 1
            return
        if self.current is None:
            return
        if tag == "blockquote":
            self.depth += 1
        if tag == "a" and values.get("href", "").startswith("download-file.php") and not self.current["href"]:
            self.current["href"] = values["href"] or ""
            self.capture = "title"
        elif tag == "b":
            self.capture = "matter"
        elif tag == "div" and "readmore" in (values.get("class") or "").split():
            self.capture = "summary"
        elif tag == "cite" and values.get("title") == "Source Title":
            self.capture = "date"
        elif tag == "textarea" and "reference" in (values.get("class") or "").split():
            self.capture = "reference"

    def handle_endtag(self, tag: str) -> None:
        if self.current is None:
            return
        if tag in {"a", "b", "div", "cite", "textarea"}:
            self.capture = None
        if tag == "blockquote":
            self.depth -= 1
            if self.depth == 0:
                self.records.append(self.current)
                self.current = None

    def handle_data(self, data: str) -> None:
        if self.current is None:
            return
        self.current["text"] += " " + data
        if self.capture:
            self.current[self.capture] += " " + data


def compact(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def classify(record: dict[str, str]) -> str | None:
    title = compact(record.get("title", ""))
    haystack = compact(" ".join(record.values())).lower()
    if any(term in haystack for term in HARD_EXCLUSIONS):
        return None
    if not any(term in haystack for term in FAMILY_SIGNALS):
        return None
    for category, terms in CATEGORY_TERMS.items():
        if any(term in haystack for term in terms):
            return category
    if "family matter" in haystack or "family court" in haystack:
        return "general_family"
    return None


def parse_listing(html: str) -> list[Judgment]:
    parser = SHCParser()
    parser.feed(html)
    judgments: list[Judgment] = []
    seen: set[str] = set()
    for record in parser.records:
        category = classify(record)
        href = record.get("href", "")
        match = re.search(r"[?&]doc=([^&]+)", href)
        if not category or not match:
            continue
        official_id = match.group(1)
        if official_id in seen:
            continue
        seen.add(official_id)
        reference = compact(record.get("reference", ""))
        citation_match = re.search(r"CITATION:\s*(.+?)(?:\s+SHC Citation:|\s+Tag:|\s+Bench:|$)", reference, re.I)
        date = compact(record.get("date", ""))
        date = re.sub(r"^Order Date:\s*", "", date, flags=re.I)
        judgments.append(Judgment(
            official_id=official_id,
            title=re.sub(r"^\d+\.\s*", "", compact(record.get("title", ""))),
            category=category,
            citation=compact(citation_match.group(1)) if citation_match else "",
            matter=compact(record.get("matter", "")),
            summary=compact(record.get("summary", "")),
            order_date=date,
            download_url=urljoin(SHC_BASE_URL, href),
        ))
    return judgments


def balanced_selection(judgments: Iterable[Judgment], limit: int) -> list[Judgment]:
    buckets: dict[str, list[Judgment]] = {name: [] for name in CATEGORY_TERMS}
    fallback: list[Judgment] = []
    for judgment in judgments:
        target = buckets.get(judgment.category)
        (target if target is not None else fallback).append(judgment)
    selected: list[Judgment] = []
    quota = max(1, limit // len(CATEGORY_TERMS))
    for category in CATEGORY_TERMS:
        selected.extend(buckets[category][:quota])
    selected_ids = {item.official_id for item in selected}
    remaining = [item for item in judgments if item.official_id not in selected_ids]
    selected.extend(remaining[: max(0, limit - len(selected))])
    return selected[:limit]


def object_exists(client, bucket: str, key: str) -> bool:
    try:
        client.head_object(Bucket=bucket, Key=key)
        return True
    except ClientError as exc:
        code = str(exc.response.get("Error", {}).get("Code", ""))
        if code in {"404", "NoSuchKey", "NotFound"}:
            return False
        raise


def extension_for(response: httpx.Response) -> str:
    content_type = response.headers.get("content-type", "").lower()
    if "pdf" in content_type or response.content.startswith(b"%PDF"):
        return ".pdf"
    return ".bin"


def validate_endpoint(endpoint: str) -> None:
    parsed = urlparse(endpoint)
    if parsed.scheme != "https" or not parsed.hostname or not parsed.hostname.endswith(".supabase.co"):
        raise SystemExit("AWS_S3_ENDPOINT_URL must be your HTTPS *.supabase.co/storage/v1/s3 endpoint")


def supabase_object_exists(http: httpx.Client, base_url: str, service_key: str, bucket: str, key: str) -> bool:
    response = http.get(
        f"{base_url.rstrip('/')}/storage/v1/object/info/{bucket}/{key}",
        headers={"Authorization": f"Bearer {service_key}", "apikey": service_key},
    )
    if response.status_code == 404:
        return False
    response.raise_for_status()
    return True


def supabase_put(
    http: httpx.Client, base_url: str, service_key: str, bucket: str, key: str,
    body: bytes, content_type: str,
) -> None:
    response = http.post(
        f"{base_url.rstrip('/')}/storage/v1/object/{bucket}/{key}",
        headers={
            "Authorization": f"Bearer {service_key}",
            "apikey": service_key,
            "Content-Type": content_type,
            "x-upsert": "true",
        },
        content=body,
    )
    response.raise_for_status()


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Copy official family judgments into Supabase Storage")
    parser.add_argument("--limit", type=int, default=500)
    parser.add_argument("--bucket", default=os.getenv("AWS_S3_BUCKET", "wakulaw-documents"))
    parser.add_argument("--prefix", default=DEFAULT_PREFIX)
    parser.add_argument("--endpoint-url", default=os.getenv("AWS_S3_ENDPOINT_URL"))
    parser.add_argument("--supabase-url", default=os.getenv("SUPABASE_URL"))
    parser.add_argument("--service-role-key", default=os.getenv("SUPABASE_SERVICE_ROLE_KEY"))
    parser.add_argument("--region", default=os.getenv("AWS_REGION", "ap-south-1"))
    parser.add_argument("--delay", type=float, default=0.35, help="Seconds between official-court downloads")
    parser.add_argument("--dry-run", action="store_true", help="Select records without downloading or uploading")
    return parser


def main() -> int:
    load_dotenv(PROJECT_ROOT / ".env", override=False)
    args = build_parser().parse_args()
    if args.limit < 1:
        raise SystemExit("--limit must be at least 1")

    with httpx.Client(timeout=60, follow_redirects=True, headers={"User-Agent": "WukaLAW legal-research importer/1.0"}) as http:
        listing = http.get(SHC_INDEX_URL)
        listing.raise_for_status()
        available = parse_listing(listing.text)
        selected = balanced_selection(available, args.limit)
        counts: dict[str, int] = {}
        for item in selected:
            counts[item.category] = counts.get(item.category, 0) + 1
        print(f"Official family-law records found={len(available)} selected={len(selected)} categories={counts}")
        if len(selected) < args.limit:
            print(f"WARNING: the verified official listing supplied only {len(selected)} safe records; no unrelated cases will be substituted.")
        if args.dry_run:
            return 0

        use_rest = bool(args.supabase_url and args.service_role_key)
        if not use_rest and not args.endpoint_url:
            raise SystemExit(
                "Set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY, or configure the Supabase S3 variables in .env"
            )
        client = None
        if not use_rest:
            validate_endpoint(args.endpoint_url)
            client = boto3.client("s3", endpoint_url=args.endpoint_url, region_name=args.region)
        prefix = args.prefix.strip("/")
        manifest: list[dict[str, object]] = []
        uploaded = skipped = failed = 0
        for index, judgment in enumerate(selected, start=1):
            try:
                response = http.get(judgment.download_url)
                response.raise_for_status()
                suffix = extension_for(response)
                key = f"{prefix}/{judgment.category}/{judgment.official_id}{suffix}"
                sha256 = hashlib.sha256(response.content).hexdigest()
                exists = (
                    supabase_object_exists(http, args.supabase_url, args.service_role_key, args.bucket, key)
                    if use_rest else object_exists(client, args.bucket, key)
                )
                if exists:
                    skipped += 1
                else:
                    content_type = response.headers.get("content-type", "application/octet-stream").split(";")[0]
                    if use_rest:
                        supabase_put(http, args.supabase_url, args.service_role_key, args.bucket, key, response.content, content_type)
                    else:
                        client.put_object(
                            Bucket=args.bucket, Key=key, Body=response.content, ContentType=content_type,
                            Metadata={"sha256": sha256, "source": "sindh-high-court", "category": judgment.category},
                        )
                    uploaded += 1
                row = asdict(judgment)
                row.update({"storage_bucket": args.bucket, "storage_key": key, "sha256": sha256, "bytes": len(response.content)})
                manifest.append(row)
                print(f"[{index}/{len(selected)}] {judgment.category}: {judgment.title[:80]}")
                time.sleep(max(0, args.delay))
            except Exception as exc:  # continue to produce an auditable partial manifest
                failed += 1
                print(f"ERROR {judgment.official_id}: {exc}", file=sys.stderr)

        manifest_bytes = "".join(json.dumps(row, ensure_ascii=False) + "\n" for row in manifest).encode("utf-8")
        manifest_key = f"{prefix}/manifest.jsonl"
        if use_rest:
            supabase_put(http, args.supabase_url, args.service_role_key, args.bucket, manifest_key, manifest_bytes, "application/x-ndjson")
        else:
            client.put_object(Bucket=args.bucket, Key=manifest_key, Body=manifest_bytes, ContentType="application/x-ndjson")
        print(f"Done uploaded={uploaded} skipped={skipped} failed={failed} manifest=s3://{args.bucket}/{manifest_key}")
        return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
