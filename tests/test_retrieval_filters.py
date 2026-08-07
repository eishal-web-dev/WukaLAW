from qdrant_client.http import models as qm
from ai.retrieval.filters import build_filter
from ai.retrieval.models import LegalSearchQuery
def test_exact_multiple_and_outcome_filters_are_typed():
    f=build_filter(LegalSearchQuery("appeal",courts=["Supreme Court","High Court"],case_categories=["Civil Appeal"],document_types=["judgment"],require_outcome=True));assert isinstance(f,qm.Filter);assert len(f.must)==3 and len(f.must_not)==1;assert all(isinstance(x,qm.FieldCondition) for x in f.must)
def test_empty_filter_and_query_validation():
    assert build_filter(LegalSearchQuery("law")) is None
