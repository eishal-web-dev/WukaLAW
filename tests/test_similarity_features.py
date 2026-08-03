from ai.legal_intelligence.models import Intent,Jurisdiction,Language,LegalDomain,LegalQuery
from ai.similar_cases.models import SimilarCaseRequest
from ai.similar_cases.similarity_features import compute_features
from test_similar_case_ranker import hit
def intelligence():return LegalQuery(Intent.SIMILAR_CASE,.9,LegalDomain.CRIMINAL,[],Language.ENGLISH,Jurisdiction.PAKISTAN,{"acts":["PPC"],"sections":["302"],"articles":["25"],"bail":["bail"]},[],"criminal bail PPC section 302 article 25",[])
def test_features_only_when_explicit():
 f=compute_features(intelligence(),hit(laws=["PPC"],sections=["302"],articles=["25"],text="criminal bail",chunk="reasoning"),SimilarCaseRequest("bail",jurisdiction="Pakistan"));names={x.factor for x in f}
 assert {"vector_relevance","same_legal_domain","shared_law","shared_section","shared_article","shared_explicit_entity","preferred_chunk_type"}<=names
def test_missing_metadata_does_not_invent_features():
 names={x.factor for x in compute_features(intelligence(),hit(),SimilarCaseRequest("bail",jurisdiction=None))}
 assert "shared_law" not in names and "shared_section" not in names

