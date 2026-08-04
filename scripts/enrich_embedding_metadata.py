from __future__ import annotations

import json
from pathlib import Path


CHUNKS_PATH = Path("datasets/processed/chunks.jsonl")
METADATA_PATH = Path("datasets/processed/embeddings_first_5000.jsonl")
OUTPUT_PATH = Path("datasets/processed/embeddings_first_5000_fulltext.jsonl")


def main() -> None:
    wanted_ids: set[str] = set()

    with METADATA_PATH.open("r", encoding="utf-8") as handle:
        for line in handle:
            if not line.strip():
                continue
            record = json.loads(line)
            chunk_id = record.get("canonical_chunk_id")
            if chunk_id:
                wanted_ids.add(str(chunk_id))

    full_text_by_id: dict[str, str] = {}

    with CHUNKS_PATH.open("r", encoding="utf-8") as handle:
        for line in handle:
            if not line.strip():
                continue

            record = json.loads(line)
            chunk_id = str(
                record.get("canonical_chunk_id")
                or record.get("chunk_id")
                or ""
            )

            if chunk_id in wanted_ids:
                text = record.get("text")
                if isinstance(text, str) and text.strip():
                    full_text_by_id[chunk_id] = text

            if len(full_text_by_id) == len(wanted_ids):
                break

    written = 0
    missing: list[str] = []

    with (
        METADATA_PATH.open("r", encoding="utf-8") as source,
        OUTPUT_PATH.open("w", encoding="utf-8") as target,
    ):
        for line in source:
            if not line.strip():
                continue

            record = json.loads(line)
            chunk_id = str(record.get("canonical_chunk_id") or "")
            text = full_text_by_id.get(chunk_id)

            if text:
                record["text"] = text
            else:
                missing.append(chunk_id)

            target.write(
                json.dumps(record, ensure_ascii=False, separators=(",", ":"))
                + "\n"
            )
            written += 1

    print("Metadata rows written:", written)
    print("Full texts found:", len(full_text_by_id))
    print("Missing full texts:", len(missing))
    print("Output:", OUTPUT_PATH)

    if missing:
        print("First missing IDs:", missing[:10])


if __name__ == "__main__":
    main()