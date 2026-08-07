"""Version-isolated Qdrant client adapter for server and embedded modes.

A shared client registry is used so the API's legal-corpus RAG and user-upload
index can safely share the same embedded Qdrant storage without opening the
same local path twice.
"""
from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from qdrant_client import QdrantClient

from .config import QdrantSettings


class WakuQdrantClient:
    def __init__(self, settings: QdrantSettings):
        self.settings = settings
        if settings.local_path:
            settings.local_path.mkdir(parents=True, exist_ok=True)
            self.client = QdrantClient(path=str(settings.local_path))
        else:
            self.client = QdrantClient(
                url=settings.url,
                api_key=settings.api_key,
                timeout=settings.timeout,
                prefer_grpc=settings.prefer_grpc,
            )

    @property
    def embedded(self) -> bool:
        return self.settings.local_path is not None

    def query(
        self,
        collection,
        vector,
        query_filter,
        limit,
        score_threshold=None,
        with_payload=True,
    ):
        return self.client.query_points(
            collection_name=collection,
            query=vector,
            query_filter=query_filter,
            limit=limit,
            score_threshold=score_threshold,
            with_payload=with_payload,
            with_vectors=False,
        ).points

    def close(self):
        self.client.close()


@lru_cache(maxsize=8)
def _shared_client(
    url: str,
    api_key: str | None,
    timeout: int,
    prefer_grpc: bool,
    local_path: str | None,
) -> WakuQdrantClient:
    settings = QdrantSettings(
        url=url,
        api_key=api_key,
        timeout=timeout,
        prefer_grpc=prefer_grpc,
        local_path=Path(local_path) if local_path else None,
    )
    return WakuQdrantClient(settings)


def get_shared_qdrant_client(settings: QdrantSettings) -> WakuQdrantClient:
    """Return one client per physical Qdrant backend, independent of collection."""
    local_path = str(settings.local_path.resolve()) if settings.local_path else None
    return _shared_client(
        settings.url,
        settings.api_key,
        settings.timeout,
        settings.prefer_grpc,
        local_path,
    )
