"""Dense and lexical evaluation without LLM judging."""
from __future__ import annotations
import collections,math,re
import numpy as np
from .retrieval_metrics import aggregate,query_metrics
def _failure(q,first,records):
 if first:return None
 if not q.get("relevant_chunk_ids"):return "relevant content absent from sample"
 ids={r["canonical_chunk_id"] for r in records}
 if not set(q["relevant_chunk_ids"])&ids:return "relevant content absent from sample"
 if len(q["query"].split())<4:return "overly generic query"
 return "low semantic score"
def evaluate(records,vectors,queries,provider,top_k=10):
 per=[]
 for q in queries:
  qv,_=provider.encode_dense([q["query"]],1,True);scores=vectors@qv[0];order=np.argsort(-scores)[:top_k];ranked=[records[i]["canonical_chunk_id"] for i in order];metrics,first=query_metrics(ranked,q.get("relevant_chunk_ids",[]));shown=[{"rank":n+1,"score":round(float(scores[i]),4),"canonical_chunk_id":records[i]["canonical_chunk_id"],"title":records[i].get("title"),"relevant":records[i]["canonical_chunk_id"] in set(q.get("relevant_chunk_ids",[]))} for n,i in enumerate(order)];per.append({**q,"metrics":metrics,"first_relevant_rank":first,"failure":_failure(q,first,records),"ranked_results":shown})
 labeled=[x for x in per if x["relevant_chunk_ids"]];overall=aggregate([x["metrics"] for x in labeled]);groups={}
 for field in ("domain","difficulty","query_style","filtered"):
  for value in sorted({str(x[field]) for x in labeled}):groups[f"{field}:{value}"]=aggregate([x["metrics"] for x in labeled if str(x[field])==value])
 for value in sorted({str(v) for x in labeled for v in x.get("expected_document_types",[])}):
  groups[f"document_type:{value}"]=aggregate([x["metrics"] for x in labeled if value in {str(v) for v in x.get("expected_document_types",[])}])
 for value in ("exact_lookup","semantic"):
  subset=[x["metrics"] for x in labeled if ("exact_lookup" if x.get("query_style")=="exact_lookup" else "semantic")==value]
  if subset:groups[f"lookup_kind:{value}"]=aggregate(subset)
 return {"overall":overall,"groups":groups,"queries":per}
def lexical_evaluate(records,queries,top_k=10):
 docs=[collections.Counter(re.findall(r"[a-z0-9]+",str(r.get("text_preview") or "").casefold())) for r in records];df=collections.Counter(t for d in docs for t in d);n=len(docs);per=[]
 for q in queries:
  terms=re.findall(r"[a-z0-9]+",q["query"].casefold());scores=[sum((1+math.log(c.get(t,1)))*math.log((n+1)/(df[t]+1)) for t in terms if c.get(t)) for c in docs];order=np.argsort(-np.asarray(scores))[:top_k];ranked=[records[i]["canonical_chunk_id"] for i in order];m,_=query_metrics(ranked,q.get("relevant_chunk_ids",[]));per.append(m)
 labeled=[m for m,q in zip(per,queries) if q.get("relevant_chunk_ids")];return aggregate(labeled)


