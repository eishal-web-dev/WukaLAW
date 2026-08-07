import json
import numpy as np
import pytest
from ai.vectorstore.collection_manager import CollectionManager
from ai.vectorstore.config import QdrantSettings
from ai.vectorstore.indexer import index_embeddings
from ai.vectorstore.qdrant_client import WakuQdrantClient
def record(cid,index,sources=None):
    return {"embedding_id":"e"+cid,"canonical_chunk_id":cid,"source_chunk_ids":sources or [cid],"document_id":"d","source_dataset":"judgments","source_path":cid,"document_type":"judgment","court":"Supreme Court","jurisdiction":"Pakistan","case_category":"Civil Appeal","case_number":None,"title":"Case","chunk_type":"outcome","heading":"ORDER","section_number":None,"article_number":None,"language":"English","explicit_outcome_phrase":"appeal dismissed","legal_citations":["PLD 2024 SC 1"],"laws_cited":[],"sections_cited":[],"articles_cited":[],"duplicate_hash":cid,"text_hash":cid,"text_preview":"appeal dismissed","pipeline_version":"task-005-v1","vector_index":index,"normalized":True}
def artifacts(tmp_path,rows=None,vectors=None):
    rows=rows or [record("a",0,["a","dup-a"]),record("b",1)];vectors=np.asarray(vectors if vectors is not None else [[1,0,0,0],[0,1,0,0]],dtype=np.float32);m=tmp_path/"m.jsonl";v=tmp_path/"v.npy";i=tmp_path/"i.json";m.write_text("".join(json.dumps(x)+"\n" for x in rows));np.save(v,vectors);i.write_text(json.dumps({"model":{"dimension":4}}));return m,v,i
def test_batch_idempotent_upserts_duplicate_payload_and_immutability(tmp_path):
    c=WakuQdrantClient(QdrantSettings(local_path=tmp_path/"q",collection="test"));m,v,i=artifacts(tmp_path);before=(m.read_bytes(),v.read_bytes(),i.read_bytes())
    try:
        CollectionManager(c).create("test",4,index_payload=False);s=index_embeddings(c,"test",m,v,i,batch_size=1);again=index_embeddings(c,"test",m,v,i,batch_size=2,resume=True);assert s.upserted==2 and s.batches==2 and again.point_count==2;points,_=c.client.scroll("test",limit=10,with_payload=True);assert points[0].payload["duplicate_sources"] or points[1].payload["duplicate_sources"]
    finally:c.close()
    assert before==(m.read_bytes(),v.read_bytes(),i.read_bytes())
def test_alignment_dimension_and_malformed_validation(tmp_path):
    c=WakuQdrantClient(QdrantSettings(local_path=tmp_path/"q",collection="test"))
    try:
        CollectionManager(c).create("test",4,index_payload=False);m,v,i=artifacts(tmp_path,rows=[record("a",0)])
        with pytest.raises(ValueError):index_embeddings(c,"test",m,v,i)
        m,v,i=artifacts(tmp_path,vectors=[[1,0,0],[0,1,0]])
        with pytest.raises(ValueError):index_embeddings(c,"test",m,v,i)
        m.write_text("{bad\n")
        with pytest.raises(ValueError):index_embeddings(c,"test",m,v,i)
    finally:c.close()
