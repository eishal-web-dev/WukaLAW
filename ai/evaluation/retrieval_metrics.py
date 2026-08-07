"""Standard deterministic retrieval metrics."""
from __future__ import annotations
import math
def query_metrics(ranked,relevant,ks=(1,3,5,10)):
 rel=set(relevant);binary=[1 if x in rel else 0 for x in ranked];first=next((i+1 for i,x in enumerate(binary) if x),None);out={f"recall_at_{k}":(len(set(ranked[:k])&rel)/len(rel) if rel else 0.0) for k in ks};out.update({f"precision_at_{k}":sum(binary[:k])/k for k in (5,10)});out["mrr"]=1/first if first else 0.0
 for k in (5,10):
  dcg=sum(v/math.log2(i+2) for i,v in enumerate(binary[:k]));ideal=sum(1/math.log2(i+2) for i in range(min(len(rel),k)));out[f"ndcg_at_{k}"]=dcg/ideal if ideal else 0.0
 return out,first
def aggregate(rows):
 if not rows:return {}
 keys=rows[0].keys();return {k:round(sum(r[k] for r in rows)/len(rows),4) for k in keys}
