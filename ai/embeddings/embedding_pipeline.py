"""Two-pass, exact-deduplicating, atomic embedding pipeline."""
from __future__ import annotations
import hashlib,json,os,time
from dataclasses import dataclass,field
from datetime import datetime,timezone
from pathlib import Path
from typing import Any
import numpy as np
from .deduplication import CanonicalGroup,add_record
from .model_provider import EmbeddingProvider
from .models import EmbeddingRecord

@dataclass
class EmbeddingSummary:
    source_chunks:int=0;canonical_chunks:int=0;duplicates_mapped:int=0;operations_avoided:int=0
    embedded:int=0;failures:int=0;truncations:int=0;effective_batch_size:int=0;elapsed_seconds:float=0
    failed_chunk_ids:list[str]=field(default_factory=list);model_metadata:dict[str,Any]=field(default_factory=dict)

def _embedding_id(model:str,chunk_id:str,text_hash:str)->str:
    return "we_"+hashlib.sha256(f"{model}\0{chunk_id}\0{text_hash}".encode()).hexdigest()[:32]
def prepare_text(record:dict[str,Any],max_tokens:int)->tuple[str,list[str]]:
    labels=[]
    for label,key in (("Title","title"),("Court","court"),("Case category","case_category"),("Document type","document_type"),("Heading","heading"),("Section","section_number"),("Article","article_number")):
        value=record.get(key)
        if value not in (None,""):labels.append(f"{label}: {value}")
    body=str(record.get("text") or "");prefix="\n".join(labels);value=(prefix+"\n\n" if prefix else "")+body
    maximum=max_tokens*4;warnings=[]
    if len(value)>maximum:
        warnings.append(f"truncated_from_{len(value)}_characters")
        if record.get("explicit_outcome_phrase"):
            head=max(0,(maximum-len(prefix)-4)*2//3);tail=max(0,maximum-len(prefix)-4-head);body=body[:head]+"\n…\n"+body[-tail:]
        else:body=body[:max(0,maximum-len(prefix)-2)]
        value=(prefix+"\n\n" if prefix else "")+body
    return value,warnings
def _atomic_json(path:Path,value:Any):
    tmp=path.with_name(path.name+".tmp");tmp.write_text(json.dumps(value,ensure_ascii=False,indent=2),encoding="utf-8");os.replace(tmp,path)
def _read_existing(metadata_path:Path,vectors_path:Path,index_path:Path):
    if not (metadata_path.exists() and vectors_path.exists() and index_path.exists()):return [],None,{}
    records=[json.loads(x) for x in metadata_path.read_text(encoding="utf-8").splitlines() if x.strip()]
    vectors=np.load(vectors_path);index=json.loads(index_path.read_text(encoding="utf-8"))
    if len(records)!=len(vectors):raise ValueError("resume artifacts have misaligned metadata and vectors")
    return records,vectors,index
def generate_embeddings(input_path:Path,metadata_output:Path,vectors_output:Path,index_output:Path,provider:EmbeddingProvider,*,batch_size:int=16,normalize:bool=True,limit:int|None=None,datasets:set[str]|None=None,document_types:set[str]|None=None,overwrite:bool=False,resume:bool=False)->EmbeddingSummary:
    started=time.monotonic();source=input_path.resolve()
    if not source.is_file():raise FileNotFoundError(source)
    outputs=[metadata_output.resolve(),vectors_output.resolve(),index_output.resolve()]
    if any(p==source for p in outputs):raise ValueError("outputs must differ from input")
    if not overwrite and not resume and any(p.exists() for p in outputs):raise FileExistsError("embedding output exists; use --overwrite or --resume")
    for p in outputs:p.parent.mkdir(parents=True,exist_ok=True)
    summary=EmbeddingSummary(effective_batch_size=batch_size,model_metadata=provider.metadata());groups:dict[str,CanonicalGroup]={}
    with source.open(encoding="utf-8") as handle:
        for line in handle:
            try:
                record=json.loads(line);dataset=str(record.get("source_dataset") or "");dtype=str(record.get("document_type") or "").casefold()
                if datasets and dataset not in datasets:continue
                if document_types and dtype not in document_types:continue
                if not record.get("chunk_id") or not str(record.get("text") or "").strip():continue
                summary.source_chunks+=1;add_record(groups,record)
            except Exception:summary.failures+=1
    selected=sorted(groups.values(),key=lambda g:g.canonical_chunk_id)
    if limit is not None:selected=selected[:limit]
    selected_ids={g.canonical_chunk_id:g for g in selected};summary.canonical_chunks=len(selected);summary.duplicates_mapped=sum(len(g.source_chunk_ids)-1 for g in selected);summary.operations_avoided=summary.duplicates_mapped
    old_records:list[dict[str,Any]]=[];old_vectors=None;old_index={}
    if resume:old_records,old_vectors,old_index=_read_existing(*outputs)
    completed={r["canonical_chunk_id"] for r in old_records};needed=set(selected_ids)-completed
    canonical_records={}
    with source.open(encoding="utf-8") as handle:
        for line in handle:
            try:
                record=json.loads(line);cid=record.get("chunk_id")
                if cid in needed:canonical_records[cid]=record
            except Exception:continue
    created=datetime.now(timezone.utc).isoformat();new_records=[];new_vectors=[];ids=sorted(needed)
    checkpoint=outputs[0].with_suffix(".checkpoint.json")
    for offset in range(0,len(ids),batch_size):
        batch_ids=ids[offset:offset+batch_size];texts=[];prepared=[]
        for cid in batch_ids:
            record=canonical_records.get(cid)
            if not record:summary.failures+=1;summary.failed_chunk_ids.append(cid);continue
            value,warnings=prepare_text(record,provider.max_input_tokens);summary.truncations+=bool(warnings);texts.append(value);prepared.append((cid,record,warnings))
        if not texts:continue
        vectors,used=provider.encode_dense(texts,batch_size,normalize);summary.effective_batch_size=min(summary.effective_batch_size,used)
        if vectors.ndim!=2 or vectors.shape!=(len(prepared),provider.dimension):raise ValueError("model returned inconsistent vector dimensions")
        if normalize and len(vectors) and not np.allclose(np.linalg.norm(vectors,axis=1),1,atol=1e-4):raise ValueError("model returned non-normalized vectors")
        for vector,(cid,record,warnings) in zip(vectors,prepared):
            group=selected_ids[cid];idx=len(old_records)+len(new_records);meta=EmbeddingRecord(_embedding_id(provider.model_name,cid,group.text_hash),cid,sorted(group.source_chunk_ids),str(record.get("document_id") or ""),str(record.get("source_dataset") or ""),str(record.get("source_path") or ""),str(record.get("document_type") or ""),record.get("court"),record.get("jurisdiction"),record.get("case_category"),record.get("case_number"),record.get("title"),str(record.get("chunk_type") or ""),record.get("heading"),record.get("section_number"),record.get("article_number"),int(record.get("paragraph_start") or 0),int(record.get("paragraph_end") or 0),record.get("language"),record.get("explicit_outcome_phrase"),list(record.get("legal_citations") or []),list(record.get("laws_cited") or []),list(record.get("sections_cited") or []),list(record.get("articles_cited") or []),group.duplicate_hash,group.text_hash,str(record.get("text") or "")[:300],provider.model_name,provider.model_revision,provider.dimension,normalize,idx,"task-005-v1",created,warnings)
            new_records.append(meta.to_dict());new_vectors.append(vector)
        _atomic_json(checkpoint,{"completed":len(old_records)+len(new_records),"failed_chunk_ids":summary.failed_chunk_ids,"model":provider.model_name})
    all_records=old_records+new_records
    matrix=np.vstack(([old_vectors] if old_vectors is not None else [])+([np.asarray(new_vectors,dtype=np.float32)] if new_vectors else [])) if (old_vectors is not None or new_vectors) else np.empty((0,provider.dimension),dtype=np.float32)
    if len(all_records)!=len(matrix):raise ValueError("metadata/vector alignment failure")
    metadata_tmp=outputs[0].with_name(outputs[0].name+".tmp");metadata_tmp.write_text("".join(json.dumps(r,ensure_ascii=False,separators=(",",":"))+"\n" for r in all_records),encoding="utf-8")
    vector_tmp=outputs[1].with_name(outputs[1].name+".tmp");
    with vector_tmp.open("wb") as fh:np.save(fh,matrix,allow_pickle=False)
    embedding_to_index={r["embedding_id"]:r["vector_index"] for r in all_records};canonical_to_index={r["canonical_chunk_id"]:r["vector_index"] for r in all_records};duplicate_to_canonical={sid:r["canonical_chunk_id"] for r in all_records for sid in r["source_chunk_ids"]};document_to_canonical={}
    for r in all_records:document_to_canonical.setdefault(r["document_id"],[]).append(r["canonical_chunk_id"])
    index={"embedding_id_to_vector_index":embedding_to_index,"canonical_chunk_id_to_vector_index":canonical_to_index,"duplicate_chunk_id_to_canonical_chunk_id":duplicate_to_canonical,"document_id_to_canonical_chunk_ids":document_to_canonical,"text_hash_to_canonical_chunk_id":{r["text_hash"]:r["canonical_chunk_id"] for r in all_records},"model":provider.metadata()}
    index_tmp=outputs[2].with_name(outputs[2].name+".tmp");index_tmp.write_text(json.dumps(index,ensure_ascii=False),encoding="utf-8")
    os.replace(metadata_tmp,outputs[0]);os.replace(vector_tmp,outputs[1]);os.replace(index_tmp,outputs[2])
    if checkpoint.exists():checkpoint.unlink()
    summary.embedded=len(new_records);summary.elapsed_seconds=time.monotonic()-started;return summary
