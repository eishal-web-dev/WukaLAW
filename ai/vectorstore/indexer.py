"""Validated, idempotent embedding artifact ingestion."""
from __future__ import annotations
import json,time
from pathlib import Path
import numpy as np
from qdrant_client.http import models as qm
from .collection_manager import CollectionManager
from .models import IndexingSummary,stable_point_id
PAYLOAD_FIELDS=("embedding_id","canonical_chunk_id","source_chunk_ids","document_id","source_dataset","source_path","document_type","court","jurisdiction","case_category","case_number","title","chunk_type","heading","section_number","article_number","language","explicit_outcome_phrase","legal_citations","laws_cited","sections_cited","articles_cited","duplicate_hash","text_hash","text_preview","pipeline_version")
def index_embeddings(client,collection:str,metadata_path:Path,vectors_path:Path,index_path:Path,*,batch_size:int=100,limit:int|None=None,dry_run:bool=False,resume:bool=False)->IndexingSummary:
    started=time.monotonic();summary=IndexingSummary();metadata=[]
    with metadata_path.open(encoding="utf-8") as handle:
        for line_number,line in enumerate(handle,1):
            try:metadata.append(json.loads(line))
            except Exception as exc:summary.rejected+=1;summary.rejected_records.append(f"line {line_number}: {exc}")
    vectors=np.load(vectors_path,mmap_mode="r");summary.metadata_rows=len(metadata);summary.vector_rows=len(vectors)
    if summary.rejected:raise ValueError("malformed embedding metadata")
    if len(metadata)!=len(vectors):raise ValueError("metadata row count does not equal vector row count")
    artifact_index=json.loads(index_path.read_text(encoding="utf-8"));dimension=CollectionManager(client).vector_size(collection)
    if vectors.ndim!=2 or vectors.shape[1]!=dimension:raise ValueError(f"vector dimension {vectors.shape[1] if vectors.ndim==2 else None} does not match collection {dimension}")
    rows=min(len(metadata),limit) if limit is not None else len(metadata);summary.accepted=rows
    for start in range(0,rows,batch_size):
        points=[]
        for offset in range(start,min(rows,start+batch_size)):
            record=metadata[offset]
            if record.get("vector_index")!=offset:raise ValueError(f"non-sequential vector index at row {offset}")
            cid=record.get("canonical_chunk_id")
            if not cid:summary.rejected+=1;summary.rejected_records.append(f"row {offset}: missing canonical_chunk_id");continue
            payload={key:record.get(key) for key in PAYLOAD_FIELDS};payload["duplicate_sources"]=[x for x in record.get("source_chunk_ids",[]) if x!=cid]
            points.append(qm.PointStruct(id=stable_point_id(cid),vector=np.asarray(vectors[offset],dtype=np.float32).tolist(),payload=payload))
        if not dry_run and points:client.client.upsert(collection_name=collection,points=points,wait=True);summary.upserted+=len(points)
        summary.batches+=1
    summary.point_count=CollectionManager(client).count(collection) if not dry_run else 0
    summary.elapsed_seconds=time.monotonic()-started;return summary
