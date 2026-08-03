from ai.legal_intelligence.models import Intent,Jurisdiction,Language,LegalDomain,LegalQuery
from ai.similar_cases.explanation_builder import build_differences,build_explanation
from ai.similar_cases.models import MatchingFactor,SimilarCaseRequest
from test_similar_case_ranker import hit
def intelligence():return LegalQuery(Intent.SIMILAR_CASE,.9,LegalDomain.CRIMINAL,[],Language.ENGLISH,Jurisdiction.PAKISTAN,{"sections":["302"]},[],"criminal",[])
def test_explanation_is_deterministic_and_guarded():
 text=build_explanation(hit(),[MatchingFactor("shared_section","302",.03)])
 assert "shared section 302" in text and "does not mean" in text and "win" not in text
def test_known_differences_and_missing_outcome():
 differences=build_differences(hit(),SimilarCaseRequest("x",court="Supreme Court",jurisdiction="Punjab",case_category="Family",include_outcomes=True),intelligence())
 assert any("Different court" in x for x in differences) and any("Outcome unavailable" in x for x in differences)

