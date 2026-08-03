from ai.legal_intelligence.models import Intent,Jurisdiction,Language,LegalDomain,LegalQuery
from ai.similar_cases.models import SimilarCaseRequest
from ai.similar_cases.query_builder import build_candidate_query
def intel():return LegalQuery(Intent.SIMILAR_CASE,.9,LegalDomain.FAMILY,[],Language.ENGLISH,Jurisdiction.PAKISTAN,{"sections":["5"]},[],"dowry recovery family law pakistan",[])
def test_overfetch_judgment_only_and_filters():
 q=build_candidate_query(SimilarCaseRequest("dowry",top_k=7,court="Family Court"),intel())
 assert q.top_k==21 and q.document_types==["judgment"] and q.source_datasets==["judgments"] and q.courts==["Family Court"]
def test_request_validation():
 import pytest
 with pytest.raises(ValueError):SimilarCaseRequest().validate()
 with pytest.raises(ValueError):SimilarCaseRequest("x",top_k=51).validate()
 with pytest.raises(ValueError):SimilarCaseRequest(document_id="bad id!").validate()
