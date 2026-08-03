"""Offline integrated RAG smoke test using only fake retrieval and generation."""
from __future__ import annotations
import json,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:sys.path.insert(0,str(ROOT))
from ai.rag.llm_provider import FakeLLMProvider
from ai.rag.rag_pipeline import RagPipeline
from ai.retrieval.models import LegalSearchResult
class FakeRetriever:
 def __init__(self):self.last=None
 def search(self,q):
  self.last=q
  return [LegalSearchResult(1,.9,"fake-1",["fake-1"],"fake-doc","Offline evidence","fake.txt","judgments","judgment","Supreme Court of Pakistan","Pakistan",None,None,"body",None,None,None,"English","This is deterministic fake retrieved evidence for pipeline validation.",None,[],[],[],[],[],{},[])]
questions=["My boss fired me in Lahore without notice.","Show similar family cases about recovery of dowry.","What protection does Article 25 provide?","Find tax appeals where the appeal was dismissed.","Explain my rights under Section 302."]
for question in questions:
 retriever=FakeRetriever();result=RagPipeline(retriever,FakeLLMProvider("The fake evidence addresses the question [C1].")).run(question)
 info=result.legal_intelligence or {}
 print(json.dumps({"question":question,"domain":info.get("primary_domain"),"intent":info.get("intent"),"retrieval_query":result.retrieval_query,"applied_filters":result.applied_filters,"fake_evidence":result.retrieved_chunks[0]["text_preview"],"validation_status":result.validation.status.value},ensure_ascii=False))
