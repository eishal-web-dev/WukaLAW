"""Typed legal search request and response models."""
from __future__ import annotations
from dataclasses import dataclass,field
from typing import Any
@dataclass
class LegalSearchQuery:
    query:str;top_k:int=10;score_threshold:float|None=None;source_datasets:list[str]=field(default_factory=list)
    document_types:list[str]=field(default_factory=list);courts:list[str]=field(default_factory=list)
    jurisdictions:list[str]=field(default_factory=list);case_categories:list[str]=field(default_factory=list)
    languages:list[str]=field(default_factory=list);chunk_types:list[str]=field(default_factory=list)
    document_ids:list[str]=field(default_factory=list);section_numbers:list[str]=field(default_factory=list)
    article_numbers:list[str]=field(default_factory=list);require_outcome:bool=False
    include_duplicate_sources:bool=True;metadata:dict[str,Any]=field(default_factory=dict)
    def __post_init__(self):
        if not self.query.strip():raise ValueError("query must not be empty")
        if self.top_k<=0:raise ValueError("top_k must be positive")
@dataclass
class LegalSearchResult:
    rank:int;score:float;canonical_chunk_id:str;source_chunk_ids:list[str];document_id:str;title:str|None
    source_path:str;source_dataset:str;document_type:str;court:str|None;jurisdiction:str|None
    case_category:str|None;case_number:str|None;chunk_type:str;heading:str|None;section_number:str|None
    article_number:str|None;language:str|None;text_preview:str;explicit_outcome_phrase:str|None
    legal_citations:list[str];laws_cited:list[str];sections_cited:list[str];articles_cited:list[str]
    duplicate_sources:list[str];payload:dict[str,Any];warnings:list[str]=field(default_factory=list)
