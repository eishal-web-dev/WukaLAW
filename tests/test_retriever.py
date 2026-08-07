from qdrant_client.http import models as qm
import pytest
from ai.embeddings.model_provider import FakeEmbeddingProvider
from ai.retrieval.models import LegalSearchQuery
from ai.retrieval.retriever import LegalRetriever
from ai.vectorstore.collection_manager import CollectionManager
from ai.vectorstore.config import QdrantSettings
from ai.vectorstore.models import stable_point_id
from ai.vectorstore.qdrant_client import WakuQdrantClient
def setup(tmp_path):
    c=WakuQdrantClient(QdrantSettings(local_path=tmp_path/"q",collection="test"));CollectionManager(c).create("test",16,index_payload=False);p=FakeEmbeddingProvider(16);texts=["income tax assessment appeal","criminal bail application","family maintenance order"];vectors,_=p.encode_dense(texts,3)
    payloads=[{"canonical_chunk_id":"tax","source_chunk_ids":["tax","tax-copy"],"duplicate_sources":["tax-copy"],"document_id":"d1","title":"Income Tax","source_path":"tax","source_dataset":"laws","document_type":"law","court":None,"jurisdiction":"Pakistan","case_category":"Tax","case_number":None,"chunk_type":"section","heading":"Assessment","section_number":"10","article_number":None,"language":"English","text_preview":texts[0],"explicit_outcome_phrase":None,"legal_citations":[],"laws_cited":[],"sections_cited":["10"],"articles_cited":[]},{"canonical_chunk_id":"bail","source_chunk_ids":["bail"],"duplicate_sources":[],"document_id":"d2","title":"Bail","source_path":"bail","source_dataset":"judgments","document_type":"judgment","court":"High Court","jurisdiction":"Pakistan","case_category":"Criminal","case_number":None,"chunk_type":"outcome","heading":"ORDER","section_number":None,"article_number":None,"language":"English","text_preview":texts[1],"explicit_outcome_phrase":"bail granted","legal_citations":[],"laws_cited":[],"sections_cited":[],"articles_cited":[]},{"canonical_chunk_id":"family","source_chunk_ids":["family"],"duplicate_sources":[],"document_id":"d3","title":"Family","source_path":"family","source_dataset":"judgments","document_type":"judgment","court":"Family Court","jurisdiction":"Pakistan","case_category":"Family","case_number":None,"chunk_type":"judgment_body","heading":None,"section_number":None,"article_number":None,"language":"English","text_preview":texts[2],"explicit_outcome_phrase":None,"legal_citations":[],"laws_cited":[],"sections_cited":[],"articles_cited":[]}]
    c.client.upsert("test",[qm.PointStruct(id=stable_point_id(x["canonical_chunk_id"]),vector=v.tolist(),payload=x) for x,v in zip(payloads,vectors)],wait=True);return c,p
def test_dense_order_filters_threshold_duplicates_and_no_results(tmp_path):
    c,p=setup(tmp_path)
    try:
        r=LegalRetriever(c,"test",p);results=r.search(LegalSearchQuery("income tax assessment appeal",top_k=3));assert results[0].canonical_chunk_id=="tax" and results[0].duplicate_sources==["tax-copy"]
        filtered=r.search(LegalSearchQuery("bail",courts=["High Court"],document_types=["judgment"],require_outcome=True));assert [x.canonical_chunk_id for x in filtered]==["bail"]
        assert r.search(LegalSearchQuery("tax",score_threshold=1.1))==[]
    finally:c.close()
def test_dimension_mismatch(tmp_path):
    c,_=setup(tmp_path)
    try:
        with pytest.raises(ValueError):LegalRetriever(c,"test",FakeEmbeddingProvider(8)).search(LegalSearchQuery("tax"))
    finally:c.close()
