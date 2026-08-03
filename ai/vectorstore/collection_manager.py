"""Idempotent and recreation-safe collection management."""
from __future__ import annotations
from qdrant_client.http import models as qm
from .models import CollectionSpec
PAYLOAD_INDEXES=("source_dataset","document_type","court","jurisdiction","case_category","language","chunk_type","explicit_outcome_phrase","document_id","canonical_chunk_id")
def distance(value:str):
    values={"cosine":qm.Distance.COSINE,"dot":qm.Distance.DOT,"euclid":qm.Distance.EUCLID,"manhattan":qm.Distance.MANHATTAN}
    try:return values[value.casefold()]
    except KeyError:raise ValueError("distance must be cosine, dot, euclid, or manhattan")
class CollectionManager:
    def __init__(self,client):self.client=client
    def exists(self,name):return self.client.client.collection_exists(name)
    def create(self,name,dimension,distance_name="cosine",*,recreate=False,confirm_recreate=False,index_payload=True)->CollectionSpec:
        if dimension<=0:raise ValueError("dimension must be positive")
        exists=self.exists(name)
        if recreate and not confirm_recreate:raise PermissionError("collection recreation requires --confirm-recreate")
        if exists and recreate:self.client.client.delete_collection(name);exists=False
        if not exists:self.client.client.create_collection(name,vectors_config=qm.VectorParams(size=dimension,distance=distance(distance_name)))
        else:
            size=self.vector_size(name)
            if size!=dimension:raise ValueError(f"existing collection dimension {size} does not match {dimension}")
        indexes=[]
        if index_payload:
            for field in PAYLOAD_INDEXES:
                self.client.client.create_payload_index(name,field_name=field,field_schema=qm.PayloadSchemaType.KEYWORD,wait=True);indexes.append(field)
        return CollectionSpec(name,dimension,distance_name,indexes)
    def vector_size(self,name):
        config=self.client.client.get_collection(name).config.params.vectors
        return int(config.size if hasattr(config,"size") else next(iter(config.values())).size)
    def count(self,name):return int(self.client.client.count(name,exact=True).count)
