"""Vector-store models and deterministic point identifiers."""
from __future__ import annotations
import uuid
from dataclasses import dataclass,field
from typing import Any
_NAMESPACE=uuid.UUID("632803df-295a-4d69-a55f-4c18d33111ab")
def stable_point_id(canonical_chunk_id:str)->str:
    if not canonical_chunk_id:raise ValueError("canonical_chunk_id is required")
    return str(uuid.uuid5(_NAMESPACE,canonical_chunk_id))
@dataclass
class IndexingSummary:
    metadata_rows:int=0;vector_rows:int=0;accepted:int=0;rejected:int=0;upserted:int=0
    point_count:int=0;batches:int=0;elapsed_seconds:float=0;rejected_records:list[str]=field(default_factory=list)
@dataclass
class CollectionSpec:
    name:str;dimension:int;distance:str="cosine";payload_indexes:list[str]=field(default_factory=list)
