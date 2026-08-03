import pytest
from apps.api.app.routers import similar_cases as api
from ai.legal_intelligence.models import Intent,Jurisdiction,Language,LegalDomain,LegalQuery
from ai.similar_cases import SimilarCasePipeline
class Empty:
 def search(self,q):return []
def intel(q):return LegalQuery(Intent.SIMILAR_CASE,.9,LegalDomain.FAMILY,[],Language.ENGLISH,Jurisdiction.PAKISTAN,{},[],"family case pakistan",[])
def test_api_contract(monkeypatch):
 monkeypatch.setattr(api,"get_similar_case_pipeline",lambda:SimilarCasePipeline(Empty(),intelligence_analyzer=intel))
 out=api.similar_cases(api.SimilarCasesRequest(situation="dowry case"))
 for key in ("original_situation","normalized_query","legal_intelligence","applied_filters","total_candidates","results","warnings","processing_time_ms"):assert key in out
def test_api_validation():
 with pytest.raises(Exception):api.SimilarCasesRequest()
 with pytest.raises(Exception):api.SimilarCasesRequest(situation="x",top_k=51)
