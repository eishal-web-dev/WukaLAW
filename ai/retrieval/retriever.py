"""Dense Qdrant legal retrieval with filters and traceability."""
from __future__ import annotations
import logging,time
from .filters import build_filter
from .models import LegalSearchQuery,LegalSearchResult
from .query_builder import build_query_text
from ai.vectorstore.collection_manager import CollectionManager
LOGGER=logging.getLogger("wakulaw.retrieval")
class LegalRetriever:
    def __init__(self,client,collection,provider):self.client=client;self.collection=collection;self.provider=provider
    def search(self,query:LegalSearchQuery)->list[LegalSearchResult]:
        started=time.monotonic();vectors,_=self.provider.encode_dense([build_query_text(query)],1,True);dimension=CollectionManager(self.client).vector_size(self.collection)
        if vectors.shape!=(1,dimension):raise ValueError(f"query vector dimension {vectors.shape[1]} does not match collection {dimension}")
        points=self.client.query(self.collection,vectors[0].tolist(),build_filter(query),query.top_k,query.score_threshold,True);results=[];seen=set()
        for point in points:
            p=dict(point.payload or {});cid=str(p.get("canonical_chunk_id") or "")
            if not cid or cid in seen:continue
            seen.add(cid);sources=list(p.get("source_chunk_ids") or [cid]);duplicates=list(p.get("duplicate_sources") or []) if query.include_duplicate_sources else []
            results.append(LegalSearchResult(len(results)+1,float(point.score),cid,sources,str(p.get("document_id") or ""),p.get("title"),str(p.get("source_path") or ""),str(p.get("source_dataset") or ""),str(p.get("document_type") or ""),p.get("court"),p.get("jurisdiction"),p.get("case_category"),p.get("case_number"),str(p.get("chunk_type") or ""),p.get("heading"),p.get("section_number"),p.get("article_number"),p.get("language"),str(p.get("text_preview") or ""),p.get("explicit_outcome_phrase"),list(p.get("legal_citations") or []),list(p.get("laws_cited") or []),list(p.get("sections_cited") or []),list(p.get("articles_cited") or []),duplicates,p,[]))
        LOGGER.info("Qdrant search completed in %.2f ms",(time.monotonic()-started)*1000);return results
