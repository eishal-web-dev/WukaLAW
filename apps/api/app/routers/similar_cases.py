"""Similar Pakistani judgment search API."""
from __future__ import annotations
import os
from functools import lru_cache
from fastapi import APIRouter,HTTPException
from pydantic import BaseModel,Field,model_validator
from ai.embeddings.model_provider import create_provider
from ai.retrieval import LegalRetriever
from ai.similar_cases import SimilarCasePipeline,SimilarCaseRequest
from ai.vectorstore.config import QdrantSettings
from ai.vectorstore.qdrant_client import WakuQdrantClient
router=APIRouter(prefix="/api/cases",tags=["similar-cases"])
class SimilarCasesRequest(BaseModel):
 situation:str|None=None;top_k:int=Field(10,ge=1,le=50);court:str|None=None;jurisdiction:str|None="Pakistan";case_category:str|None=None;include_outcomes:bool=True;document_id:str|None=None;case_number:str|None=None
 @model_validator(mode="after")
 def source_required(self):
  if not any(isinstance(x,str) and x.strip() for x in (self.situation,self.document_id,self.case_number)):raise ValueError("situation, document_id, or case_number is required")
  return self
@lru_cache(maxsize=1)
def get_similar_case_pipeline():
 settings=QdrantSettings.from_env();client=WakuQdrantClient(settings);provider=create_provider(os.getenv("EMBEDDING_MODEL","BAAI/bge-m3"),os.getenv("EMBEDDING_DEVICE","auto"));return SimilarCasePipeline(LegalRetriever(client,settings.collection,provider))
@router.post("/similar")
def similar_cases(request:SimilarCasesRequest):
 try:return get_similar_case_pipeline().run(SimilarCaseRequest(**request.model_dump())).to_dict()
 except ValueError as exc:raise HTTPException(status_code=422,detail=str(exc)) from exc
 except RuntimeError as exc:raise HTTPException(status_code=503,detail=f"Similar-case service unavailable: {exc}") from exc
