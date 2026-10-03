"""Stream TXT judgments from Supabase Storage into the pgvector index."""
from __future__ import annotations

import argparse
import hashlib
import os
import re
import sys
from pathlib import PurePosixPath
from urllib.parse import quote

import httpx
from dotenv import load_dotenv

ROOT = __import__("pathlib").Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

# The API may be launched from apps/api while maintenance scripts are normally
# launched from the repository root. Support both established .env locations;
# existing process variables always win and secrets are never logged.
load_dotenv(ROOT / ".env", override=False)
load_dotenv(ROOT / "apps" / "api" / ".env", override=False)

from ai.embeddings.model_provider import create_provider  # noqa: E402

OUTCOME_PATTERNS = (
    re.compile(
        r"\b(?:the\s+)?(?:appeals?|petitions?|applications?|complaints?|revisions?|references?|"
        r"leave(?:\s+to\s+appeal)?|bails?)\s+(?:are|is|be|stand(?:s)?|was|were)?\s*"
        r"(?:hereby\s+)?(?:accordingly\s+)?(?:partly|partially)?\s*"
        r"(?:allowed|accepted|dismissed|rejected|refused|declined|granted|disposed\s+of)\b",
        re.I,
    ),
    re.compile(
        r"\b(?:the\s+)?(?:suits?|claims?)\s+(?:are|is|be|stand(?:s)?|was|were)?\s*"
        r"(?:hereby\s+)?(?:accordingly\s+)?(?:partly|partially)?\s*"
        r"(?:decreed|allowed|accepted|dismissed|rejected)\b",
        re.I,
    ),
    re.compile(
        r"\b(?:impugned\s+)?(?:judg(?:e)?ments?|orders?|decrees?)\s+(?:are|is|be|stand(?:s)?|was|were)?\s*"
        r"(?:hereby\s+)?(?:accordingly\s+)?(?:set\s+aside|upheld|maintained|modified|affirmed)\b",
        re.I,
    ),
    re.compile(
        r"\b(?:conviction|sentence|acquittal)\s+(?:and\s+sentence\s+)?"
        r"(?:are|is|be|stand(?:s)?|was|were)?\s*(?:hereby\s+)?"
        r"(?:set\s+aside|upheld|maintained|modified|affirmed)\b",
        re.I,
    ),
)


def arguments():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--prefix", default="datasets/raw/")
    parser.add_argument("--limit", type=int)
    parser.add_argument("--batch-size", type=int, default=8)
    parser.add_argument("--model", default=os.getenv("EMBEDDING_MODEL", "BAAI/bge-m3"))
    parser.add_argument("--device", default=os.getenv("EMBEDDING_DEVICE", "auto"))
    return parser.parse_args()


def chunk_text(text: str, size: int = 700, overlap: int = 100):
    words = text.split()
    step = size - overlap
    for start in range(0, len(words), step):
        chunk = " ".join(words[start:start + size]).strip()
        if len(chunk) >= 120:
            yield start // step, chunk


def outcome(text: str) -> str | None:
    # Dispositions normally occur at the end. Select the last explicit match,
    # not the first reference to an earlier order in the judgment's reasoning.
    tail = text[-12000:]
    matches = [match for pattern in OUTCOME_PATTERNS for match in pattern.finditer(tail)]
    if not matches:
        return None
    match = max(matches, key=lambda item: item.start())
    return " ".join(match.group(0).split())


def metadata(path: str) -> dict:
    parts = PurePosixPath(path).parts
    category = None
    if "Labeled Data" in parts:
        index = parts.index("Labeled Data")
        category = parts[index + 1] if len(parts) > index + 1 else None
    court = "Supreme Court of Pakistan" if "supreme" in path.casefold() or "Supreme Court Judgements" in path else None
    title = PurePosixPath(path).stem.replace("_", " ")
    return {"title": title, "case_category": category, "court": court}


class SupabaseCorpusIndexer:
    def __init__(self, url: str, key: str, bucket: str, provider):
        self.url, self.key, self.bucket, self.provider = url.rstrip("/"), key, bucket, provider
        self.headers = {"apikey": key, "Authorization": f"Bearer {key}", "Content-Type": "application/json"}
        self.client = httpx.Client(headers=self.headers, timeout=60.0)

    def paths(self, prefix: str):
        offset = 0
        while True:
            response = self.client.post(f"{self.url}/rest/v1/rpc/list_legal_storage_objects", json={
                "target_bucket": self.bucket, "path_prefix": prefix,
                "page_limit": 1000, "page_offset": offset,
            })
            response.raise_for_status()
            rows = response.json()
            for row in rows:
                if str(row["name"]).casefold().endswith(".txt"):
                    yield str(row["name"])
            if len(rows) < 1000:
                return
            offset += len(rows)

    def download(self, path: str) -> str:
        encoded = quote(path, safe="/")
        response = self.client.get(f"{self.url}/storage/v1/object/authenticated/{self.bucket}/{encoded}")
        response.raise_for_status()
        return response.content.decode("utf-8", errors="replace")

    def upsert(self, rows: list[dict]):
        response = self.client.post(
            f"{self.url}/rest/v1/legal_judgment_chunks?on_conflict=canonical_chunk_id",
            headers={**self.headers, "Prefer": "resolution=merge-duplicates,return=minimal"}, json=rows,
        )
        response.raise_for_status()

    def run(self, prefix: str, limit: int | None, batch_size: int):
        documents = chunks = 0
        pending: list[tuple[str, int, str, dict, str | None]] = []
        for path in self.paths(prefix):
            if limit is not None and documents >= limit:
                break
            text = self.download(path)
            info, disposition = metadata(path), outcome(text)
            for number, chunk in chunk_text(text):
                pending.append((path, number, chunk, info, disposition))
                if len(pending) >= batch_size:
                    chunks += self.flush(pending)
                    pending.clear()
            documents += 1
            print(f"indexed documents={documents} chunks={chunks}", end="\r", flush=True)
        if pending:
            chunks += self.flush(pending)
        print(f"\nDone. documents={documents} chunks={chunks}")

    def flush(self, pending):
        vectors, _ = self.provider.encode_dense([item[2] for item in pending], len(pending), True)
        if vectors.shape[1] != 1024:
            raise RuntimeError(f"Expected 1024-dimensional BGE-M3 vectors, got {vectors.shape[1]}")
        rows = []
        for (path, number, text, info, disposition), vector in zip(pending, vectors):
            document_id = hashlib.sha256(path.encode()).hexdigest()[:24]
            chunk_id = hashlib.sha256(f"{path}:{number}".encode()).hexdigest()
            rows.append({
                "canonical_chunk_id": chunk_id, "source_path": path,
                "source_dataset": "supabase-storage", "document_id": document_id,
                **info, "jurisdiction": "Pakistan", "language": "en",
                "chunk_type": "judgment", "text_content": text,
                "text_preview": text[:700], "explicit_outcome_phrase": disposition,
                "metadata": {"bucket": self.bucket, "chunk_number": number},
                "embedding": vector.tolist(), "embedding_model": self.provider.model_name,
            })
        self.upsert(rows)
        return len(rows)


def main():
    args = arguments()
    url = os.getenv("SUPABASE_URL", "").strip()
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip()
    bucket = os.getenv("SUPABASE_LEGAL_BUCKET", "wakulaw-documents").strip()
    if not url or not key:
        raise SystemExit("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.")
    provider = create_provider(args.model, args.device)
    SupabaseCorpusIndexer(url, key, bucket, provider).run(args.prefix, args.limit, args.batch_size)


if __name__ == "__main__":
    main()
