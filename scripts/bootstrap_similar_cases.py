"""Build the complete local Similar Cases judgment index with one command."""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PROCESSED = ROOT / "datasets" / "processed"


def _run(*arguments: str) -> None:
    command = [sys.executable, *arguments]
    print("\n>", " ".join(command), flush=True)
    subprocess.run(command, cwd=ROOT, check=True)


def parser() -> argparse.ArgumentParser:
    value = argparse.ArgumentParser(description="Download, embed and index Pakistani judgments")
    value.add_argument("--limit", type=int, default=5000)
    value.add_argument("--collection", default=os.getenv("QDRANT_COLLECTION", "wakulaw_real_5000"))
    value.add_argument("--model", default=os.getenv("EMBEDDING_MODEL", "BAAI/bge-m3"))
    value.add_argument("--device", choices=("auto", "cpu", "cuda"), default=os.getenv("EMBEDDING_DEVICE", "auto"))
    value.add_argument("--batch-size", type=int, default=int(os.getenv("EMBEDDING_BATCH_SIZE", "8")))
    value.add_argument("--local-path", type=Path, default=Path(os.getenv("QDRANT_LOCAL_PATH", "datasets/processed/qdrant_real_5000")))
    value.add_argument("--download-only", action="store_true")
    return value


def main(argv=None) -> int:
    args = parser().parse_args(argv)
    if args.limit < 1:
        print("--limit must be at least 1")
        return 2
    try:
        _run("scripts/download_huggingface_judgments.py", "--limit", str(args.limit))
        if args.download_only:
            return 0
        _run("scripts/load_datasets.py", "--input", "datasets/raw", "--output", "datasets/processed/manifest.jsonl", "--dataset", "judgments", "--overwrite")
        _run("scripts/process_documents.py", "--input", "datasets/processed/manifest.jsonl", "--output", "datasets/processed/clean_documents.jsonl", "--overwrite")
        _run("scripts/chunk_documents.py", "--input", "datasets/processed/clean_documents.jsonl", "--output", "datasets/processed/chunks.jsonl", "--document-type", "judgment", "--overwrite")
        _run("scripts/generate_embeddings.py", "--input", "datasets/processed/chunks.jsonl", "--metadata-output", "datasets/processed/embeddings.jsonl", "--vectors-output", "datasets/processed/embedding_vectors.npy", "--index-output", "datasets/processed/embedding_index.json", "--document-type", "judgment", "--model", args.model, "--device", args.device, "--batch-size", str(args.batch_size), "--overwrite")
        artifact = json.loads((PROCESSED / "embedding_index.json").read_text(encoding="utf-8"))
        dimension = artifact.get("model", {}).get("dimension")
        if not isinstance(dimension, int) or dimension < 1:
            raise RuntimeError("embedding_index.json did not contain a valid vector dimension")
        qdrant_args = ["--collection", args.collection, "--local-path", str(args.local_path)]
        _run("scripts/create_vector_collection.py", *qdrant_args, "--dimension", str(dimension))
        _run("scripts/index_embeddings.py", "--metadata", "datasets/processed/embeddings.jsonl", "--vectors", "datasets/processed/embedding_vectors.npy", "--index", "datasets/processed/embedding_index.json", *qdrant_args)
    except (subprocess.CalledProcessError, OSError, RuntimeError, json.JSONDecodeError) as exc:
        print(f"\nSimilar Cases bootstrap failed: {exc}")
        return 1
    print(f"\nSimilar Cases is ready. Set QDRANT_COLLECTION={args.collection} and QDRANT_LOCAL_PATH={args.local_path}, then restart the API.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
