"""User-upload vector index backed by the shared WakuLAW embedding stack.

Production uses BGE-M3 + Qdrant, the same embedding family as the legal corpus.
Tests keep a deterministic in-memory backend when FAKE_EMBEDDINGS is enabled.
"""
from __future__ import annotations

import threading

import numpy as np
from qdrant_client.http import models as qm

from ai.embeddings.model_provider import FakeEmbeddingProvider, create_provider
from ai.vectorstore.collection_manager import CollectionManager
from ai.vectorstore.config import QdrantSettings
from ai.vectorstore.qdrant_client import get_shared_qdrant_client
from app.config import settings

_lock = threading.RLock()
_provider = None
_collection_ready = False

# Test-only deterministic store: chunk_id -> (vector, owner_id)
_fake_vectors: dict[int, tuple[np.ndarray, int | None]] = {}


def _embedding_provider():
    global _provider
    if _provider is None:
        if settings.fake_embeddings:
            _provider = FakeEmbeddingProvider(dimension=384)
        else:
            _provider = create_provider(settings.embedding_model, settings.embedding_device)
    return _provider


def _qdrant_settings() -> QdrantSettings:
    return QdrantSettings.from_env(collection=settings.upload_qdrant_collection)


def _client():
    return get_shared_qdrant_client(_qdrant_settings())


def _ensure_collection() -> None:
    global _collection_ready
    if settings.fake_embeddings or _collection_ready:
        return
    provider = _embedding_provider()
    client = _client()
    manager = CollectionManager(client)
    manager.create(
        settings.upload_qdrant_collection,
        provider.dimension,
        "cosine",
        index_payload=False,
    )
    # Owner filtering is mandatory for user-upload retrieval. Payload indexes are
    # useful on server Qdrant and harmlessly skipped for embedded mode.
    if not client.embedded:
        try:
            client.client.create_payload_index(
                settings.upload_qdrant_collection,
                field_name="owner_id",
                field_schema=qm.PayloadSchemaType.INTEGER,
                wait=True,
            )
        except Exception:
            # Collection creation is idempotent and some Qdrant versions report
            # an already-existing index as an error. Retrieval still works.
            pass
    _collection_ready = True


def add_chunks(
    chunk_ids: list[int],
    texts: list[str],
    *,
    owner_id: int | None = None,
    document_id: int | None = None,
    document_title: str | None = None,
) -> None:
    """Embed and index uploaded-document chunks.

    Real indexing requires owner_id so private document vectors can never be
    retrieved across users.
    """
    if len(chunk_ids) != len(texts):
        raise ValueError("chunk_ids and texts must have the same length")
    if not chunk_ids:
        return

    provider = _embedding_provider()
    vectors, _ = provider.encode_dense(
        texts,
        batch_size=max(1, settings.embedding_batch_size),
        normalize=True,
    )

    with _lock:
        if settings.fake_embeddings:
            for chunk_id, vector in zip(chunk_ids, vectors):
                _fake_vectors[int(chunk_id)] = (np.asarray(vector, dtype=np.float32), owner_id)
            return

        if owner_id is None:
            raise ValueError("owner_id is required for real upload indexing")

        _ensure_collection()
        points = []
        for chunk_id, text, vector in zip(chunk_ids, texts, vectors):
            points.append(
                qm.PointStruct(
                    id=int(chunk_id),
                    vector=np.asarray(vector, dtype=np.float32).tolist(),
                    payload={
                        "db_chunk_id": int(chunk_id),
                        "owner_id": int(owner_id),
                        "document_id": str(document_id) if document_id is not None else None,
                        "title": document_title,
                        "source_dataset": "user_uploads",
                        "document_type": "uploaded_document",
                        "jurisdiction": "Pakistan",
                        "canonical_chunk_id": f"user_chunk_{chunk_id}",
                        "text": text,
                        "text_preview": text[:1200],
                    },
                )
            )
        _client().client.upsert(
            collection_name=settings.upload_qdrant_collection,
            points=points,
            wait=True,
        )


def search(query: str, top_k: int, *, owner_id: int | None = None) -> list[tuple[int, float]]:
    """Return [(database chunk id, cosine score)] for one user's documents."""
    if top_k <= 0:
        return []
    provider = _embedding_provider()
    vector, _ = provider.encode_dense([query], batch_size=1, normalize=True)
    query_vector = vector[0]

    with _lock:
        if settings.fake_embeddings:
            scored: list[tuple[int, float]] = []
            for chunk_id, (candidate, candidate_owner) in _fake_vectors.items():
                if owner_id is not None and candidate_owner not in {None, owner_id}:
                    continue
                score = float(np.dot(query_vector, candidate))
                scored.append((chunk_id, score))
            scored.sort(key=lambda item: item[1], reverse=True)
            return scored[:top_k]

        if owner_id is None:
            raise ValueError("owner_id is required for upload search")
        _ensure_collection()
        query_filter = qm.Filter(
            must=[
                qm.FieldCondition(
                    key="owner_id",
                    match=qm.MatchValue(value=int(owner_id)),
                )
            ]
        )
        points = _client().query(
            settings.upload_qdrant_collection,
            query_vector.tolist(),
            query_filter,
            top_k,
            None,
            True,
        )
        return [
            (int((point.payload or {}).get("db_chunk_id") or point.id), float(point.score))
            for point in points
        ]


def delete_chunks(chunk_ids: list[int]) -> None:
    if not chunk_ids:
        return
    with _lock:
        if settings.fake_embeddings:
            for chunk_id in chunk_ids:
                _fake_vectors.pop(int(chunk_id), None)
            return
        _ensure_collection()
        _client().client.delete(
            collection_name=settings.upload_qdrant_collection,
            points_selector=qm.PointIdsList(points=[int(value) for value in chunk_ids]),
            wait=True,
        )


def rebuild(all_chunks: list[tuple[int, str]]) -> None:
    """Compatibility helper used by legacy maintenance code.

    Production rebuilds should use the document ingestion pipeline so owner
    metadata is preserved. Tests may rebuild the deterministic backend.
    """
    if not settings.fake_embeddings:
        raise RuntimeError("Production upload-index rebuild requires owner metadata")
    reset_for_tests()
    if all_chunks:
        ids, texts = zip(*all_chunks)
        add_chunks(list(ids), list(texts))


def reset_for_tests() -> None:
    global _provider, _collection_ready
    with _lock:
        _fake_vectors.clear()
        _provider = None
        _collection_ready = False
