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


def test_names_do_not_create_false_dower_match():
 request=SimilarCaseRequest("wife claims haq meher and unpaid dower",jurisdiction="Pakistan")
 criminal=hit(text="Petitioner Mehran seeks post-arrest bail under the Criminal Procedure Code.")
 names={x.factor for x in compute_features(intelligence(),criminal,request)}
 assert "same_specific_issue" not in names
 assert "missing_specific_issue" in names


def test_criminal_custody_is_not_child_custody_and_bad_folder_is_not_domain_evidence():
 request=SimilarCaseRequest("mother seeks child custody and visitation rights",jurisdiction="Pakistan")
 criminal=hit(text="The accused remains in police custody pending the criminal bail hearing.")
 criminal.case_category="Family Law Cases"
 family_intelligence=LegalQuery(Intent.SIMILAR_CASE,.9,LegalDomain.FAMILY,[],Language.ENGLISH,Jurisdiction.PAKISTAN,{},[],"child custody",[])
 names={x.factor for x in compute_features(family_intelligence,criminal,request)}
 assert "same_specific_issue" not in names
 assert "same_legal_domain" not in names
 assert "missing_specific_issue" in names
