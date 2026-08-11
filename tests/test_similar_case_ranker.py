from ai.retrieval.models import LegalSearchResult
from ai.legal_intelligence.models import Intent,Jurisdiction,Language,LegalDomain,LegalQuery
from ai.similar_cases.models import SimilarCaseRequest
from ai.similar_cases.result_ranker import label,rank_candidates
def hit(doc="d1",cid="c1",score=.8,chunk="case_header",laws=None,sections=None,articles=None,text="This judgment contains readable legal reasoning and sufficient contextual text.",outcome=None,payload=None):return LegalSearchResult(1,score,cid,[cid],doc,"Case "+doc,"path","judgments","judgment","High Court","Pakistan","Criminal Appeals",None,chunk,None,None,None,"English",text,outcome,[],laws or [],sections or [],articles or [],[],payload or {},[])
def intel():return LegalQuery(Intent.SIMILAR_CASE,.9,LegalDomain.CRIMINAL,[],Language.ENGLISH,Jurisdiction.PAKISTAN,{},[],"criminal matter",[])
def test_labels_are_safe_and_configurable():
 assert label(.9)=="highly_relevant" and label(.7)=="relevant" and label(.5)=="possibly_relevant" and label(.1)=="weak_match"
def test_case_dedup_and_strongest_substantive_chunk():
 ranked=rank_candidates([hit(cid="header",score=.80),hit(cid="reason",score=.80,chunk="reasoning")],intel(),SimilarCaseRequest("criminal"))
 assert len(ranked)==1 and ranked[0][2].canonical_chunk_id=="reason"
def test_raw_similarity_not_probability():
 ranked=rank_candidates([hit(score=1.2)],intel(),SimilarCaseRequest("criminal"));assert ranked[0][1]==1
