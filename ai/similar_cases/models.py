"""Typed contracts for traceable similar-case search."""
from __future__ import annotations
from dataclasses import asdict,dataclass,field
from typing import Any
@dataclass
class SimilarCaseRequest:
 situation:str|None=None;top_k:int=10;court:str|None=None;jurisdiction:str|None="Pakistan";case_category:str|None=None;include_outcomes:bool=True;document_id:str|None=None;case_number:str|None=None
 def validate(self):
  if not any(isinstance(x,str) and x.strip() for x in (self.situation,self.document_id,self.case_number)):raise ValueError("situation, document_id, or case_number is required")
  if not 1<=self.top_k<=50:raise ValueError("top_k must be between 1 and 50")
  if self.document_id and not __import__('re').fullmatch(r"[A-Za-z0-9_.:-]{2,160}",self.document_id):raise ValueError("malformed document_id")
@dataclass
class MatchingFactor:
 factor:str;value:str;weight:float
@dataclass
class SimilarCaseResult:
 rank:int;similarity_score:float;similarity_label:str;canonical_chunk_id:str;document_id:str;title:str|None;court:str|None;jurisdiction:str|None;case_category:str|None;case_number:str|None;decision_date:str|None;judges:list[str];source_path:str;source_dataset:str;matched_chunk_type:str;matched_heading:str|None;text_preview:str;explicit_outcome_phrase:str|None;legal_citations:list[str];laws_cited:list[str];sections_cited:list[str];articles_cited:list[str];matching_factors:list[MatchingFactor];differences:list[str];explanation:str;duplicate_sources:list[str];warnings:list[str]=field(default_factory=list)
@dataclass
class SimilarCaseResponse:
 original_situation:str|None;normalized_query:str;legal_intelligence:dict[str,Any];applied_filters:dict[str,Any];total_candidates:int;results:list[SimilarCaseResult];warnings:list[str];processing_time_ms:float
 def to_dict(self):return asdict(self)
