"""TASK-005 embedding metadata models."""
from __future__ import annotations
from dataclasses import asdict,dataclass,field
from typing import Any
@dataclass
class EmbeddingRecord:
    embedding_id:str;canonical_chunk_id:str;source_chunk_ids:list[str];document_id:str;source_dataset:str
    source_path:str;document_type:str;court:str|None;jurisdiction:str|None;case_category:str|None
    case_number:str|None;title:str|None;chunk_type:str;heading:str|None;section_number:str|None
    article_number:str|None;paragraph_start:int;paragraph_end:int;language:str|None
    explicit_outcome_phrase:str|None;legal_citations:list[str];laws_cited:list[str];sections_cited:list[str]
    articles_cited:list[str];duplicate_hash:str;text_hash:str;text_preview:str;embedding_model:str
    model_revision:str|None;embedding_dimension:int;normalized:bool;vector_index:int
    pipeline_version:str="task-005-v1";created_at:str="";warnings:list[str]=field(default_factory=list)
    def to_dict(self)->dict[str,Any]:return asdict(self)
