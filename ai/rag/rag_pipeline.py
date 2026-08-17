"""Integrated Legal Intelligence and grounded RAG orchestration."""
from __future__ import annotations
import time
from dataclasses import asdict
from typing import Any,Protocol
from ai.legal_intelligence.pipeline import analyze as analyze_legal_question
from ai.retrieval.models import LegalSearchQuery,LegalSearchResult
from .context_builder import build_context
from .intelligence_adapter import IntelligenceAdapter,RetrievalInstructions
from .llm_provider import LLMProvider
from .models import RagResult,ValidationResult,ValidationStatus
from .prompt_builder import build_prompt
from .query_analyzer import analyze_query
from .response_validator import validate_response
class Retriever(Protocol):
 def search(self,query:LegalSearchQuery)->list[LegalSearchResult]:...
class RagPipeline:
 def __init__(self,retriever:Retriever,llm:LLMProvider,*,top_k=10,token_budget=4000,intelligence_analyzer=analyze_legal_question,intelligence_adapter=None):
  self.retriever=retriever;self.llm=llm;self.top_k=top_k;self.token_budget=token_budget;self.intelligence_analyzer=intelligence_analyzer;self.intelligence_adapter=intelligence_adapter or IntelligenceAdapter()
 def run(self,question:str,filters:dict[str,Any]|None=None,*,top_k:int|None=None,score_threshold:float|None=None,use_legal_intelligence=True)->RagResult:
  started=time.perf_counter()
  if not isinstance(question,str) or not question.strip():raise ValueError("question must be a non-empty string")
  analysis=analyze_query(question);warnings=[];intelligence_data=None;instructions=None
  if use_legal_intelligence:
   try:
    intelligence=self.intelligence_analyzer(question);instructions=self.intelligence_adapter.adapt(question,intelligence,top_k=top_k or self.top_k,score_threshold=score_threshold,user_filters=filters);intelligence_data=intelligence.to_dict()
   except Exception as exc:warnings.append(f"Legal Intelligence failed; legacy RAG fallback used: {exc}")
  if instructions is None:instructions=self._legacy(question,filters or {},top_k or self.top_k,score_threshold)
  warnings.extend(instructions.adapter_warnings);search=instructions.to_search_query();results=self.retriever.search(search);context=build_context(results,self.token_budget)
  if not context:answer="INSUFFICIENT_EVIDENCE";validation=ValidationResult(ValidationStatus.INSUFFICIENT_EVIDENCE,["Retrieval returned no usable chunks."])
  else:answer=self.llm.generate(build_prompt(analysis,context)).strip();validation=validate_response(answer,context)
  confidence={ValidationStatus.PASS:"high",ValidationStatus.LOW_CONFIDENCE:"low",ValidationStatus.INSUFFICIENT_EVIDENCE:"insufficient"}[validation.status]
  llm_provider=getattr(self.llm,"last_used",None) or getattr(self.llm,"name",None)
  fallback_errors=getattr(self.llm,"last_errors",None)
  if fallback_errors:warnings.append("LLM fallback attempts before success: "+"; ".join(fallback_errors))
  return RagResult(answer=answer,confidence=confidence,citations=[x.citation for x in context],retrieved_chunks=[asdict(x) for x in results],processing_time_ms=(time.perf_counter()-started)*1000,validation=validation,analysis=analysis,original_question=question,retrieval_query=search.query,legal_intelligence=intelligence_data,applied_filters=instructions.applied_filters(),pipeline_warnings=list(dict.fromkeys(warnings)),llm_provider=llm_provider)
 @staticmethod
 def _legacy(question,filters,top_k,score_threshold):
  legacy=analyze_query(question,filters);f=legacy.filters;out=RetrievalInstructions(legacy.normalized_question,top_k=top_k,score_threshold=score_threshold,courts=list(f.get("court",[])),jurisdictions=list(f.get("jurisdiction",[])),section_numbers=list(f.get("section",[])),article_numbers=[],document_ids=list(f.get("document_id",[])));IntelligenceAdapter().merge_user_filters(out,filters);return out
