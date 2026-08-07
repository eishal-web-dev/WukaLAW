from ai.legal_intelligence.models import Intent,Jurisdiction,Language,LegalDomain,LegalQuery
from ai.rag.intelligence_adapter import CorpusCapabilities,IntelligenceAdapter

def q(domain=LegalDomain.LABOUR,intent=Intent.RIGHTS,confidence=.9,entities=None,jurisdiction=Jurisdiction.PAKISTAN,normalized="normalized legal query"):
 return LegalQuery(intent,confidence,domain,[],Language.ENGLISH,jurisdiction,entities or {},[],normalized,[])
def test_labour_and_low_confidence_query_selection():
 assert IntelligenceAdapter().adapt("My boss fired me",q()).retrieval_query=="normalized legal query"
 low=IntelligenceAdapter().adapt("  My boss fired me  ",q(confidence=.1))
 assert low.retrieval_query=="My boss fired me" and low.adapter_warnings
def test_validated_domain_categories_and_unsupported_warning():
 caps=CorpusCapabilities(case_categories=frozenset({"Family Law Cases","Constitutional Cases","Tax Revenue Cases"}))
 adapter=IntelligenceAdapter(caps)
 assert adapter.adapt("family",q(LegalDomain.FAMILY)).case_categories==["Family Law Cases"]
 assert adapter.adapt("constitution",q(LegalDomain.CONSTITUTIONAL)).case_categories==["Constitutional Cases"]
 assert adapter.adapt("tax",q(LegalDomain.TAX)).case_categories==["Tax Revenue Cases"]
 assert not IntelligenceAdapter().adapt("family",q(LegalDomain.FAMILY)).case_categories
def test_entities_intents_outcome_and_user_override():
 value=q(intent=Intent.LAW_LOOKUP,entities={"articles":["25"],"sections":["302"]})
 out=IntelligenceAdapter().adapt("What does Article 25 say?",value,user_filters={"article_numbers":["14"],"courts":["High Court"]})
 assert out.document_types==["law"] and out.source_datasets==["laws"]
 assert out.article_numbers==["14"] and out.section_numbers==["302"] and out.courts==["High Court"]
 similar=IntelligenceAdapter().adapt("similar decided cases",q(intent=Intent.SIMILAR_CASE))
 assert similar.document_types==["judgment"] and similar.require_outcome
 assert not IntelligenceAdapter().adapt("Should I sue?",q(intent=Intent.LEGAL_ADVICE)).require_outcome
def test_unsafe_filter_ignored_and_warnings_deduplicated():
 out=IntelligenceAdapter().adapt("question",q(),user_filters={"raw_expression":"x"})
 assert not hasattr(out,"raw_expression") and len(out.adapter_warnings)==len(set(out.adapter_warnings))
