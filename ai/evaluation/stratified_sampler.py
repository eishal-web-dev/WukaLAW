"""Deterministic document-first, duplicate-aware legal corpus sampling."""
from __future__ import annotations
import hashlib,json,random
from collections import Counter,defaultdict
from pathlib import Path
from .models import SampleManifest,StratumSummary
STRATA=("laws_acts","constitutional_cases","constitutional_petitions","criminal_appeals","civil_appeals","family","labour_employment","service","tax_revenue","bail","evidence","human_rights","suo_moto","review_petitions","explicit_outcomes","templates")
TERMS={"constitutional_petitions":("constitutional petition","const. p."),"criminal_appeals":("criminal appeal",),"civil_appeals":("civil appeal",),"family":("family law","dowry","maintenance","custody","divorce","khula"),"labour_employment":("labour","employment","employee","worker","dismissal"),"service":("service matter","civil servant","promotion","seniority","service tribunal"),"tax_revenue":("income tax","sales tax","revenue","fbr"),"bail":("bail",),"evidence":("evidence","qanoon-e-shahadat","admissibility"),"human_rights":("human rights","fundamental rights"),"suo_moto":("suo moto","suo motu"),"review_petitions":("review petition",),"templates":("template","specimen","form of")}
PRIORITY={"outcome":0,"reasoning":1,"findings":1,"article":2,"section":2,"judgment_body":3,"body":4,"chapter":5,"part":5,"case_header":9}
def strata_for(r):
 text=" ".join(str(r.get(k) or "") for k in ("title","case_category","chunk_type","heading","text")).casefold();out=[];category=str(r.get("case_category") or "")
 category_map={"Constitutional Cases":"constitutional_cases","Constitutional Petitions":"constitutional_petitions","Criminal Appeals":"criminal_appeals","Civil Appeals":"civil_appeals","Family Law Cases":"family","Family Cases":"family","Service Cases":"service","Tax Cases":"tax_revenue","Tax Revenue Cases":"tax_revenue","Human Rights Cases":"human_rights","Suo Moto Cases":"suo_moto","Review Petitions":"review_petitions"}
 if r.get("document_type")=="law":out.append("laws_acts")
 if category in category_map:out.append(category_map[category])
 if r.get("explicit_outcome_phrase"):out.append("explicit_outcomes")
 # Topic strata without reliable categories use explicit text, but do not relabel
 # strongly categorized cases as unrelated labour/family/service/tax material.
 for name in ("bail","evidence","templates"):
  if any(term in text for term in TERMS[name]):out.append(name)
 if not category:
  for name in ("family","labour_employment","service","tax_revenue"):
   if any(term in text for term in TERMS[name]):out.append(name)
 return list(dict.fromkeys(out))
def _order(seed,name,value):return hashlib.sha256(f"{seed}:{name}:{value}".encode()).hexdigest()
def sample_records(input_path,target_size=600,seed=42):
 records=[];source=0;seen_hash=set()
 for line in Path(input_path).open(encoding="utf-8"):
  source+=1
  try:r=json.loads(line)
  except Exception:continue
  text=str(r.get("text") or "").strip();dh=str(r.get("duplicate_hash") or hashlib.sha256(text.encode()).hexdigest())
  if not r.get("chunk_id") or not r.get("document_id") or not text or "ocr pending" in text.casefold()  :continue
  seen_hash.add(dh);r["_strata"]=strata_for(r);r["_duplicate_hash"]=dh;records.append(r)
 quota={name:target_size//len(STRATA)+(1 if i<target_size%len(STRATA) else 0) for i,name in enumerate(STRATA)};selected=[];selected_ids=set();selected_hashes=set();doc_counts=Counter();summaries=[]
 for name in STRATA:
  candidates=[r for r in records if name in r["_strata"]];bydoc=defaultdict(list)
  for r in candidates:bydoc[r["document_id"]].append(r)
  docs=sorted(bydoc,key=lambda d:_order(seed,name,d));chosen=[]
  for doc in docs:
   if len(chosen)>=quota[name]:break
   options=sorted(bydoc[doc],key=lambda r:(PRIORITY.get(r.get("chunk_type"),7),_order(seed,name,r["chunk_id"])))
   for r in options:
    if r["chunk_id"] not in selected_ids and r["_duplicate_hash"] not in selected_hashes and doc_counts[doc]<2:
     selected.append(r);chosen.append(r);selected_ids.add(r["chunk_id"]);selected_hashes.add(r["_duplicate_hash"]);doc_counts[doc]+=1;break
  summaries.append(StratumSummary(name,quota[name],len(candidates),len(chosen),max(0,quota[name]-len(chosen)),sorted({r.get("source_dataset") for r in chosen}),sorted({r["document_id"] for r in chosen}),[r["chunk_id"] for r in chosen]))
 if len(selected)<target_size:
  rest=sorted((r for r in records if r["chunk_id"] not in selected_ids and r["_duplicate_hash"] not in selected_hashes and r.get("chunk_type")!="case_header"),key=lambda r:(doc_counts[r["document_id"]],PRIORITY.get(r.get("chunk_type"),7),_order(seed,"fill",r["chunk_id"])))
  for r in rest:
   if len(selected)>=target_size:break
   if doc_counts[r["document_id"]]<2:selected.append(r);selected_ids.add(r["chunk_id"]);selected_hashes.add(r["_duplicate_hash"]);doc_counts[r["document_id"]]+=1
 selected=sorted(selected,key=lambda r:r["chunk_id"])
 for r in selected:r.pop("_strata",None);r.pop("_duplicate_hash",None)
 manifest=SampleManifest(seed,target_size,len(selected),source,len(seen_hash),summaries,[] if len(selected)==target_size else ["Target size could not be reached."])
 return selected,manifest
def write_sample(input_path,output,manifest_path,target_size=600,seed=42,overwrite=False):
 output=Path(output);manifest_path=Path(manifest_path)
 if not overwrite and (output.exists() or manifest_path.exists()):raise FileExistsError("sample output exists; use --overwrite")
 records,manifest=sample_records(input_path,target_size,seed);output.parent.mkdir(parents=True,exist_ok=True);output.write_text("".join(json.dumps(r,ensure_ascii=False,separators=(",",":"))+"\n" for r in records),encoding="utf-8");manifest_path.write_text(json.dumps(manifest.to_dict(),ensure_ascii=False,indent=2),encoding="utf-8");return manifest


