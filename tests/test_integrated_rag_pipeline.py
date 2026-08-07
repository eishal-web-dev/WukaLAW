import pytest
from ai.legal_intelligence.models import Intent,Jurisdiction,Language,LegalDomain,LegalQuery
from ai.rag.llm_provider import FakeLLMProvider
from ai.rag.models import ValidationStatus
from ai.rag.rag_pipeline import RagPipeline
from ai.retrieval.models import LegalSearchResult
class FakeRetriever:
 def __init__(self,results):self.results=results;self.queries=[]
 def search(self,q):self.queries.append(q);return self.results
def intelligence(question):return LegalQuery(Intent.RIGHTS,.9,LegalDomain.LABOUR,[],Language.ENGLISH,Jurisdiction.PAKISTAN,{"employment":["fired"]},["labour laws"],"employment termination labour law pakistan",[])
def hit():return LegalSearchResult(1,.9,"c1",["c1"],"d1","Labour case","x","judgments","judgment","Supreme Court of Pakistan","Pakistan",None,"A/1","body",None,None,None,"English","Employment termination requires notice.",None,[],[],[],[],[],{},[])
def test_normalized_for_retrieval_original_for_prompt():
 retriever=FakeRetriever([hit()]);llm=FakeLLMProvider("Termination requires notice [C1].");out=RagPipeline(retriever,llm,intelligence_analyzer=intelligence).run("My boss fired me without notice")
 assert retriever.queries[0].query.startswith("employment termination")
 assert "My boss fired me without notice" in llm.prompts[0]
 assert "employment termination labour law pakistan" not in llm.prompts[0].split("CONVERSATION QUESTION",1)[1]
 assert out.original_question.startswith("My boss") and out.legal_intelligence
def test_no_evidence_skips_llm():
 llm=FakeLLMProvider("unused");out=RagPipeline(FakeRetriever([]),llm,intelligence_analyzer=intelligence).run("My rights")
 assert out.validation.status==ValidationStatus.INSUFFICIENT_EVIDENCE and not llm.prompts
def test_intelligence_exception_falls_back_and_disabled_stays_legacy():
 def broken(q):raise RuntimeError("boom")
 r=FakeRetriever([]);out=RagPipeline(r,FakeLLMProvider(),intelligence_analyzer=broken).run("What does Article 25 say?")
 assert any("boom" in warning for warning in out.pipeline_warnings) and out.legal_intelligence is None
 r2=FakeRetriever([]);RagPipeline(r2,FakeLLMProvider(),intelligence_analyzer=broken).run("What does Article 25 say?",use_legal_intelligence=False)
 assert not any("boom" in warning for warning in r2.queries[0].metadata.get("warnings",[]))
def test_user_filters_override_and_malformed():
 r=FakeRetriever([]);RagPipeline(r,FakeLLMProvider(),intelligence_analyzer=intelligence).run("question",{"jurisdictions":["Sindh"]})
 assert r.queries[0].jurisdictions==["Sindh"]
 with pytest.raises(ValueError):RagPipeline(r,FakeLLMProvider()).run("   ")
