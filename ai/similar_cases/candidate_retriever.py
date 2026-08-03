"""Candidate retrieval and source-document profiling."""
from ai.retrieval.models import LegalSearchQuery
class CandidateRetriever:
 def __init__(self,retriever):self.retriever=retriever
 def source_profile(self,document_id,seed):
  chunks=self.retriever.search(LegalSearchQuery(seed,top_k=50,document_types=["judgment"],document_ids=[document_id]))
  return chunks," ".join(x.text_preview for x in chunks if x.text_preview).strip()
 def retrieve(self,query,exclude_document_id=None):
  results=self.retriever.search(query.to_search_query())
  return [x for x in results if x.document_type=="judgment" and x.document_id!=exclude_document_id and exclude_document_id not in x.duplicate_sources]
