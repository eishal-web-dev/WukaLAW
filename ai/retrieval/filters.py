"""Typed Qdrant filter construction; no string query concatenation."""
from qdrant_client.http import models as qm
from .models import LegalSearchQuery
def _condition(key,values):
    if not values:return None
    return qm.FieldCondition(key=key,match=qm.MatchValue(value=values[0]) if len(values)==1 else qm.MatchAny(any=values))
def build_filter(query:LegalSearchQuery):
    mapping=(("source_dataset",query.source_datasets),("document_type",query.document_types),("court",query.courts),("jurisdiction",query.jurisdictions),("case_category",query.case_categories),("language",query.languages),("chunk_type",query.chunk_types),("document_id",query.document_ids),("section_number",query.section_numbers),("article_number",query.article_numbers))
    must=[condition for key,values in mapping if (condition:=_condition(key,values))]
    must_not=[]
    if query.require_outcome:must_not.append(qm.IsEmptyCondition(is_empty=qm.PayloadField(key="explicit_outcome_phrase")))
    return qm.Filter(must=must or None,must_not=must_not or None) if must or must_not else None
