"""Check the configured local judgments index without downloading or changing data.

Run from the repository root: apps/api/.venv/Scripts/python.exe scripts/diagnose_similar_cases.py
"""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from ai.vectorstore.config import QdrantSettings
from ai.vectorstore.qdrant_client import get_shared_qdrant_client


def main() -> int:
    settings = QdrantSettings.from_env()
    print(f"Configured collection: {settings.collection}")
    print(f"Qdrant mode: {'local' if settings.local_path else 'server'}")
    print(f"Location: {settings.local_path if settings.local_path else settings.url}")
    if settings.local_path and not settings.local_path.exists():
        print("No index directory exists at this path. Locate your existing Qdrant data and set QDRANT_LOCAL_PATH in the repository .env.")
        return 1
    try:
        client = get_shared_qdrant_client(settings).client
        names = [item.name for item in client.get_collections().collections]
        print(f"Available collections: {', '.join(names) if names else '(none)'}")
        if settings.collection not in names:
            print("The configured judgments collection is missing. If an indexed judgments collection appears above, set QDRANT_COLLECTION to its name and restart the API.")
            return 1
        count = client.count(collection_name=settings.collection, exact=True).count
        print(f"Indexed judgment passages: {count}")
        if count == 0:
            print("The collection is empty. Import real Pakistani judgments and their embeddings before searching.")
            return 1
        print("Judgments index is available. Similar Cases can search this collection.")
        return 0
    except Exception as exc:
        print(f"Cannot inspect Qdrant ({type(exc).__name__}). Check that the configured server is running or use an existing QDRANT_LOCAL_PATH.")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
