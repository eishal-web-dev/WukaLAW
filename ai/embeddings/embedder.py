"""Sentence embeddings. Real model: sentence-transformers all-MiniLM-L6-v2.

With FAKE_EMBEDDINGS enabled (tests/CI) a deterministic hash-based embedder
is used so no model download or heavy compute is needed.
"""

import hashlib
import re

import numpy as np

from app.config import settings

DIMENSION = 384  # all-MiniLM-L6-v2 output size; fake embedder matches it

_model = None


def _fake_embed(texts: list[str]) -> np.ndarray:
    """Deterministic bag-of-hashed-words embedding — similar words → similar vectors."""
    vectors = np.zeros((len(texts), DIMENSION), dtype=np.float32)
    for i, text in enumerate(texts):
        for word in re.findall(r"[a-z]+", text.lower()):
            slot = int(hashlib.md5(word.encode()).hexdigest(), 16) % DIMENSION
            vectors[i, slot] += 1.0
    norms = np.linalg.norm(vectors, axis=1, keepdims=True)
    norms[norms == 0] = 1.0
    return vectors / norms


def embed(texts: list[str]) -> np.ndarray:
    """Return L2-normalized float32 embeddings, shape (len(texts), DIMENSION)."""
    if not texts:
        return np.zeros((0, DIMENSION), dtype=np.float32)
    if settings.fake_embeddings:
        return _fake_embed(texts)

    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer

        _model = SentenceTransformer(settings.embedding_model)
    vectors = _model.encode(texts, normalize_embeddings=True, show_progress_bar=False)
    return np.asarray(vectors, dtype=np.float32)
