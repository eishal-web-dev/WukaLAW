from ai.legal_intelligence.models import Intent,Jurisdiction,Language,LegalDomain,LegalQuery
from ai.similar_cases import SimilarCasePipeline,SimilarCaseRequest
from test_similar_case_ranker import hit
class FakeRetriever:
 def __init__(self,candidates,source=None):self.candidates=candidates;self.source=source or [];self.queries=[]
 def search(self,q):self.queries.append(q);return self.source if q.document_ids else self.candidates
def intel(q):return LegalQuery(Intent.SIMILAR_CASE,.9,LegalDomain.CRIMINAL,[],Language.ENGLISH,Jurisdiction.PAKISTAN,{"sections":["302"]},[],"criminal section 302 pakistan",[])
def test_natural_search_judgment_only_dedup_outcome():
 values=[hit("d1","c1",.8,outcome="appeal allowed",sections=["302"]),hit("d1","c2",.7),hit("law","law",.99)];values[-1].document_type="law"
 retriever=FakeRetriever(values);out=SimilarCasePipeline(retriever,intelligence_analyzer=intel).run(SimilarCaseRequest("similar criminal case",include_outcomes=True))
 assert len(out.results)==1 and out.results[0].explicit_outcome_phrase=="appeal allowed"
 assert retriever.queries[0].document_types==["judgment"] and out.results[0].matching_factors
def test_document_search_excludes_source_and_exact_duplicate():
 source=hit("source","s1",.9,payload={"duplicate_hash":"same"});duplicate=hit("copy","copy",.95,payload={"duplicate_hash":"same"});other=hit("other","o",.7,payload={"duplicate_hash":"other"})
 out=SimilarCasePipeline(FakeRetriever([duplicate,other],source=[source]),intelligence_analyzer=intel).run(SimilarCaseRequest(document_id="source"))
 assert [x.document_id for x in out.results]==["other"]
def test_missing_outcome_and_no_results():
 out=SimilarCasePipeline(FakeRetriever([hit(outcome=None)]),intelligence_analyzer=intel).run(SimilarCaseRequest("criminal",include_outcomes=True))
 assert out.results[0].explicit_outcome_phrase is None and any("Outcome unavailable" in x for x in out.results[0].differences)
 empty=SimilarCasePipeline(FakeRetriever([]),intelligence_analyzer=intel).run(SimilarCaseRequest("criminal"))
 assert empty.results==[] and empty.warnings
def test_document_not_found_safe():
 out=SimilarCasePipeline(FakeRetriever([]),intelligence_analyzer=intel).run(SimilarCaseRequest(document_id="missing"));assert out.results==[] and out.warnings
