"""Deterministic, non-LLM legal retrieval evaluation."""
from __future__ import annotations
import argparse,json,sys
from pathlib import Path
import numpy as np
ROOT=Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:sys.path.insert(0,str(ROOT))
from ai.embeddings.model_provider import create_provider
from ai.embeddings.similarity import top_k
def evaluate(metadata_path,vectors_path,queries_path,provider,topk=10):
    records=[json.loads(x) for x in Path(metadata_path).read_text(encoding="utf-8").splitlines() if x.strip()];vectors=np.load(vectors_path);queries=json.loads(Path(queries_path).read_text(encoding="utf-8"));hits={1:0,5:0,10:0};rr=[];results=[];labeled=0
    for q in queries:
        qv,_=provider.encode_dense([q["query"]],1,True);ranked=top_k(qv[0],vectors,min(topk,len(vectors)));shown=[];first=None
        has_label=bool(q.get("expected_document_type_or_category") or q.get("expected_keywords") or q.get("expected_source_chunk_ids"));labeled+=has_label
        for rank,(idx,score) in enumerate(ranked,1):
            r=records[idx];hay=" ".join(str(r.get(k) or "") for k in ("document_type","case_category","title","text_preview")).casefold();expected=str(q.get("expected_document_type_or_category") or "").casefold();keywords=[x.casefold() for x in q.get("expected_keywords",[])];ids=set(q.get("expected_source_chunk_ids") or [])
            match=(not expected or expected in hay) and (not keywords or any(x in hay for x in keywords))
            if ids:match=match and bool(ids&set(r.get("source_chunk_ids") or []))
            if match and first is None:first=rank
            shown.append({"rank":rank,"score":round(score,4),"canonical_chunk_id":r["canonical_chunk_id"],"title":r.get("title"),"document_type":r.get("document_type"),"match":match})
        if has_label:
            for k in hits:hits[k]+=bool(first and first<=k)
            rr.append(1/first if first else 0)
        results.append({"query_id":q["query_id"],"query":q["query"],"first_relevant_rank":first,"suspicious":has_label and first is None,"results":shown})
    metrics={f"recall_at_{k}":round(hits[k]/labeled,4) if labeled else 0 for k in hits};metrics["mrr"]=round(sum(rr)/len(rr),4) if rr else 0;return {"metrics":metrics,"labeled_queries":labeled,"queries":results}
def main(argv=None):
    p=argparse.ArgumentParser();p.add_argument("--metadata",type=Path,required=True);p.add_argument("--vectors",type=Path,required=True);p.add_argument("--index",type=Path,required=True);p.add_argument("--queries",type=Path,required=True);p.add_argument("--top-k",type=int,default=10);a=p.parse_args(argv);index=json.loads(a.index.read_text());m=index["model"]
    try:provider=create_provider(m["model"],m.get("device","auto"),m.get("revision"),m.get("dimension"));result=evaluate(a.metadata,a.vectors,a.queries,provider,a.top_k)
    except Exception as exc:print(f"evaluation failed: {exc}",file=sys.stderr);return 1
    print(json.dumps(result,ensure_ascii=False,indent=2));return 0
if __name__=="__main__":raise SystemExit(main())
