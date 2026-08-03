"""Build intelligence-backed, judgment-only candidate queries."""
from ai.rag.intelligence_adapter import IntelligenceAdapter
from ai.retrieval.models import LegalSearchQuery

def build_candidate_query(request,intelligence,adapter=None):
 adapter=adapter or IntelligenceAdapter();user={}
 if request.court:user["courts"]=[request.court]
 if request.jurisdiction:user["jurisdictions"]=[request.jurisdiction]
 if request.case_category:user["case_categories"]=[request.case_category]
 instructions=adapter.adapt(request.situation or request.case_number or request.document_id,intelligence,top_k=min(request.top_k*3,150),user_filters=user)
 instructions.document_types=["judgment"];instructions.source_datasets=["judgments"];instructions.require_outcome=False
 return instructions
