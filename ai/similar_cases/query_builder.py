"""Build intelligence-backed, judgment-only candidate queries."""
from ai.rag.intelligence_adapter import IntelligenceAdapter


def build_candidate_query(request, intelligence, adapter=None):
    adapter = adapter or IntelligenceAdapter()
    user = {}
    if request.court:
        user["courts"] = [request.court]
    if request.jurisdiction:
        user["jurisdictions"] = [request.jurisdiction]
    if request.case_category:
        user["case_categories"] = [request.case_category]

    instructions = adapter.adapt(
        request.situation or request.case_number or request.document_id,
        intelligence,
        top_k=min(request.top_k * 3, 150),
        user_filters=user,
    )

    # Similar-case search should operate across every indexed court judgment,
    # regardless of which source dataset supplied it. Historical decisions in
    # WakuLAW can come from `judgments`, `labeled_cases`, or future judgment
    # datasets. Filtering by source_dataset="judgments" caused legitimate
    # Pakistani precedents to be discarded before ranking.
    instructions.document_types = ["judgment"]
    instructions.source_datasets = []
    instructions.require_outcome = False
    return instructions
