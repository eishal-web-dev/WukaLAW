"""Version-isolated Qdrant client adapter for server and embedded modes."""
from __future__ import annotations
from qdrant_client import QdrantClient
from .config import QdrantSettings
class WakuQdrantClient:
    def __init__(self,settings:QdrantSettings):
        self.settings=settings
        if settings.local_path:
            settings.local_path.mkdir(parents=True,exist_ok=True);self.client=QdrantClient(path=str(settings.local_path))
        else:self.client=QdrantClient(url=settings.url,api_key=settings.api_key,timeout=settings.timeout,prefer_grpc=settings.prefer_grpc)
    @property
    def embedded(self)->bool:return self.settings.local_path is not None
    def query(self,collection,vector,query_filter,limit,score_threshold=None,with_payload=True):
        return self.client.query_points(collection_name=collection,query=vector,query_filter=query_filter,limit=limit,score_threshold=score_threshold,with_payload=with_payload,with_vectors=False).points
    def close(self):self.client.close()
