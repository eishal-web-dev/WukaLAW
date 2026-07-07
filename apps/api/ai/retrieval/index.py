"""FAISS vector index over document chunks.

Uses inner product on L2-normalized vectors (= cosine similarity).
The index and its chunk-id mapping persist to disk; on startup, if the
files are missing, the index is rebuilt from the database.
"""

import json
import threading
from pathlib import Path

import faiss
import numpy as np

from ai.embeddings.embedder import DIMENSION, embed
from app.config import settings

_lock = threading.Lock()
_index: faiss.IndexFlatIP | None = None
_chunk_ids: list[int] = []  # row position in FAISS -> chunk DB id


def _index_path() -> Path:
    return settings.storage_dir / "faiss.index"


def _ids_path() -> Path:
    return settings.storage_dir / "chunk_ids.json"


def _load_or_create() -> None:
    global _index, _chunk_ids
    if _index_path().exists() and _ids_path().exists():
        _index = faiss.read_index(str(_index_path()))
        _chunk_ids = json.loads(_ids_path().read_text())
    else:
        _index = faiss.IndexFlatIP(DIMENSION)
        _chunk_ids = []


def _persist() -> None:
    faiss.write_index(_index, str(_index_path()))
    _ids_path().write_text(json.dumps(_chunk_ids))


def _ensure_loaded() -> None:
    if _index is None:
        _load_or_create()


def add_chunks(chunk_ids: list[int], texts: list[str]) -> None:
    with _lock:
        _ensure_loaded()
        vectors = embed(texts)
        _index.add(vectors)
        _chunk_ids.extend(chunk_ids)
        _persist()


def search(query: str, top_k: int) -> list[tuple[int, float]]:
    """Return [(chunk_id, cosine_score)] for the top_k most similar chunks."""
    with _lock:
        _ensure_loaded()
        if _index.ntotal == 0:
            return []
        vector = embed([query])
        scores, rows = _index.search(vector, min(top_k, _index.ntotal))
        return [
            (_chunk_ids[row], float(score))
            for row, score in zip(rows[0], scores[0])
            if row != -1
        ]


def rebuild(all_chunks: list[tuple[int, str]]) -> None:
    """Rebuild the whole index from (chunk_id, text) pairs."""
    global _index, _chunk_ids
    with _lock:
        _index = faiss.IndexFlatIP(DIMENSION)
        _chunk_ids = []
        if all_chunks:
            ids, texts = zip(*all_chunks)
            _index.add(embed(list(texts)))
            _chunk_ids = list(ids)
        _persist()


def reset_for_tests() -> None:
    global _index, _chunk_ids
    with _lock:
        _index = faiss.IndexFlatIP(DIMENSION)
        _chunk_ids = []
