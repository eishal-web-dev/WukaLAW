import json
from pathlib import Path
import numpy as np
from ai.embeddings.embedding_pipeline import generate_embeddings
from ai.embeddings.model_provider import FakeEmbeddingProvider
def chunk(cid,text="appeal dismissed",dup=None,doc="d",dataset="judgments"):
    return {"chunk_id":cid,"document_id":doc,"source_dataset":dataset,"source_path":cid,"document_type":"judgment","court":"Court","jurisdiction":"Pakistan","case_category":"Civil Appeal","case_number":None,"title":"Case","chunk_type":"outcome","heading":"ORDER","section_number":None,"article_number":None,"paragraph_start":0,"paragraph_end":1,"language":"English","explicit_outcome_phrase":"appeal dismissed","legal_citations":[],"laws_cited":[],"sections_cited":[],"articles_cited":[],"duplicate_hash":dup or cid,"text":text}
def run(tmp_path,lines,**kwargs):
    tmp_path.mkdir(parents=True,exist_ok=True)
    src=tmp_path/"chunks.jsonl";meta=tmp_path/"embeddings.jsonl";vec=tmp_path/"vectors.npy";idx=tmp_path/"index.json";src.write_text("\n".join(lines)+"\n",encoding="utf-8");before=src.read_bytes();summary=generate_embeddings(src,meta,vec,idx,FakeEmbeddingProvider(12,2),batch_size=8,overwrite=kwargs.pop("overwrite",True),**kwargs);return src,meta,vec,idx,before,summary
def test_alignment_index_duplicate_reuse_and_immutability(tmp_path):
    lines=[json.dumps(chunk("a",dup="same")),json.dumps(chunk("b",dup="same")),json.dumps(chunk("c",text="bail granted"))];src,meta,vec,idx,before,s=run(tmp_path,lines)
    records=[json.loads(x) for x in meta.read_text().splitlines()];vectors=np.load(vec);index=json.loads(idx.read_text())
    assert len(records)==len(vectors)==2 and [r["vector_index"] for r in records]==[0,1];assert s.operations_avoided==1 and s.effective_batch_size==2;assert src.read_bytes()==before
    assert index["duplicate_chunk_id_to_canonical_chunk_id"]["b"]==index["duplicate_chunk_id_to_canonical_chunk_id"]["a"]
    assert np.allclose(np.linalg.norm(vectors,axis=1),1)
def test_malformed_and_empty_are_skipped_safely(tmp_path):
    lines=["{bad",json.dumps(chunk("empty",text="")),json.dumps(chunk("ok"))];*_,s=run(tmp_path,lines);assert s.source_chunks==1 and s.embedded==1 and s.failures==1
def test_resume_does_not_repeat_completed_embeddings(tmp_path):
    lines=[json.dumps(chunk("a")),json.dumps(chunk("b",text="bail"))];src,meta,vec,idx,before,s=run(tmp_path,lines)
    resumed=generate_embeddings(src,meta,vec,idx,FakeEmbeddingProvider(12),batch_size=2,resume=True);assert resumed.embedded==0;assert len(np.load(vec))==2
def test_stable_embedding_ids(tmp_path):
    lines=[json.dumps(chunk("a"))];_,m1,_,_,_,_=run(tmp_path/"one",lines);_,m2,_,_,_,_=run(tmp_path/"two",lines);assert json.loads(m1.read_text())["embedding_id"]==json.loads(m2.read_text())["embedding_id"]
