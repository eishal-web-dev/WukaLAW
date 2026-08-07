"""Offline similar-case smoke scenarios using deterministic fake judgments."""
from __future__ import annotations
import json,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:sys.path.insert(0,str(ROOT))
from ai.retrieval.models import LegalSearchResult
from ai.similar_cases import SimilarCasePipeline,SimilarCaseRequest
class FakeRetriever:
 def search(self,q):
  topic=q.query.casefold();title="Constitutional Service Judgment" if "employment" in topic or "article" in topic else "Pakistani Reported Judgment"
  law="Constitution" if "article" in topic else ("Income Tax Ordinance" if "tax" in topic else "Pakistan Penal Code")
  return [LegalSearchResult(1,.82,"fake-case-1",["fake-case-1"],"fake-doc-1",title,"offline/judgment.txt","judgments","judgment","Supreme Court of Pakistan","Pakistan","Constitutional Cases",None,"reasoning","REASONS",None,None,"English",f"Judgment reasoning concerning {topic}.","appeal dismissed" if "dismiss" in topic else None,[],[law],["302"] if "302" in topic else [],["25"] if "25" in topic else [],[],{"decision_date":"2020-01-01","judges":["Justice Example"]},[])]
questions=["Government employee dismissed without a hearing","Husband refusing to return dowry","Bail request in a criminal matter","Income-tax assessment appeal","Constitutional challenge involving Article 25"]
for question in questions:
 out=SimilarCasePipeline(FakeRetriever()).run(SimilarCaseRequest(question,top_k=3));result=out.results[0]
 print(json.dumps({"question":question,"domain":out.legal_intelligence["primary_domain"],"normalized_query":out.normalized_query,"filters":out.applied_filters,"titles":[x.title for x in out.results],"scores":[x.similarity_score for x in out.results],"matching_factors":[f.factor for f in result.matching_factors],"explanation":result.explanation,"outcome":result.explicit_outcome_phrase,"warnings":out.warnings},ensure_ascii=False))
