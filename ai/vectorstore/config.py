"""Environment-backed Qdrant configuration without secret defaults."""
from __future__ import annotations
import os
from dataclasses import dataclass
from pathlib import Path
def _bool(value:str|None)->bool:return str(value or "").casefold() in {"1","true","yes","on"}
@dataclass(frozen=True)
class QdrantSettings:
    url:str="http://localhost:6333";api_key:str|None=None;collection:str="wakulaw_legal_chunks"
    timeout:int=30;prefer_grpc:bool=False;local_path:Path|None=None
    @classmethod
    def from_env(cls,**overrides):
        values={"url":os.getenv("QDRANT_URL","http://localhost:6333"),"api_key":os.getenv("QDRANT_API_KEY") or None,"collection":os.getenv("QDRANT_COLLECTION","wakulaw_legal_chunks"),"timeout":int(os.getenv("QDRANT_TIMEOUT","30")),"prefer_grpc":_bool(os.getenv("QDRANT_PREFER_GRPC")),"local_path":Path(os.environ["QDRANT_LOCAL_PATH"]) if os.getenv("QDRANT_LOCAL_PATH") else None}
        values.update({k:v for k,v in overrides.items() if v is not None});return cls(**values)
