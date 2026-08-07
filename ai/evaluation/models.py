from __future__ import annotations
from dataclasses import asdict,dataclass,field
from typing import Any
@dataclass
class StratumSummary:
 name:str;requested_count:int;available_count:int;selected_count:int;shortfall:int;source_datasets:list[str];document_ids:list[str];chunk_ids:list[str]
@dataclass
class SampleManifest:
 seed:int;target_size:int;selected_size:int;source_chunks:int;unique_duplicate_hashes:int;strata:list[StratumSummary];warnings:list[str]=field(default_factory=list);pipeline_version:str="task-012-v1"
 def to_dict(self):return asdict(self)
@dataclass
class RetrievalQuery:
 query_id:str;query:str;domain:str;expected_document_types:list[str];expected_case_categories:list[str];expected_keywords:list[str];expected_laws:list[str];expected_sections:list[str];expected_articles:list[str];relevant_chunk_ids:list[str];relevance_notes:str;difficulty:str;query_style:str;filtered:bool=False
 def to_dict(self):return asdict(self)
