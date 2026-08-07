"""Grounded deterministic query-set construction from sampled records."""
from __future__ import annotations
import json,re
from pathlib import Path
from .models import RetrievalQuery
DOMAINS={"Constitutional Cases":"constitutional","Constitutional Petitions":"constitutional","Criminal Appeals":"criminal","Civil Appeals":"civil","Family Law Cases":"family","Family Cases":"family","Service Cases":"service","Tax Cases":"tax","Tax Revenue Cases":"tax","Human Rights Cases":"human_rights","Suo Moto Cases":"suo_moto","Review Petitions":"review"}
def _keywords(r):
 words=re.findall(r"[A-Za-z]{5,}"," ".join([str(r.get("title") or ""),str(r.get("heading") or ""),str(r.get("text") or "")[:400]]).casefold());stop={"court","shall","under","where","which","their","there","this","that","have","from","with","section"};return list(dict.fromkeys(w for w in words if w not in stop))[:3]
def _domain(r):
 cat=str(r.get("case_category") or "")
 if cat in DOMAINS:return DOMAINS[cat]
 text=(str(r.get("title") or "")+" "+str(r.get("text") or "")[:600]).casefold()
 for domain,terms in (("family",("dowry","custody","maintenance","divorce")),("labour",("labour","employment","employee","dismissal")),("service",("civil servant","promotion","seniority")),("tax",("income tax","revenue","fbr")),("bail",("bail",)),("evidence",("evidence","admissibility"))):
  if any(t in text for t in terms):return domain
 return "laws" if r.get("document_type")=="law" else "general"
def build_query_set(records,count=40):
 groups={}
 for r in sorted(records,key=lambda x:x["chunk_id"]):groups.setdefault(_domain(r),[]).append(r)
 order=sorted(groups);chosen=[];used=set();cursor=0
 while len(chosen)<count-2 and any(groups.values()):
  domain=order[cursor%len(order)];cursor+=1
  if not groups[domain]:continue
  r=groups[domain].pop(0);key=(domain,r.get("document_id"))
  if key in used:continue
  chosen.append((domain,r));used.add(key)
 queries=[];styles=("exact_lookup","paraphrased_lookup","fact_pattern","similar_case","outcome")
 for domain,r in chosen:
  words=_keywords(r);laws=list(r.get("laws_cited") or [])[:2];sections=list(r.get("sections_cited") or [])[:2];articles=list(r.get("articles_cited") or [])[:2];anchor=(r.get("heading") or r.get("title") or " ".join(words)).strip();style=styles[len(queries)%len(styles)]
  if style=="exact_lookup":query=anchor
  elif style=="paraphrased_lookup":query="legal rules concerning "+" ".join(words)
  elif style=="fact_pattern":query="What law applies to a dispute involving "+" ".join(words)+"?"
  elif style=="similar_case":query="Find similar Pakistani cases about "+" ".join(words)
  else:query="What outcome was recorded regarding "+" ".join(words)
  queries.append(RetrievalQuery(f"sq{len(queries)+1:03d}",query,domain,[r.get("document_type")],[r.get("case_category")] if r.get("case_category") else [],words,laws,sections,articles,[r["chunk_id"]],f"Ground truth is sampled chunk {r['chunk_id']} selected from its text and metadata.",("easy","medium","hard")[len(queries)%3],style,bool(r.get("case_category"))))
 for text in ("quantum computing patents on Mars","Antarctic maritime whaling treaty dispute"):queries.append(RetrievalQuery(f"sq{len(queries)+1:03d}",text,"no_match",[],[],[],[],[],[],[],"Deliberate no-match control query.","hard","no_match",False))
 return queries
def load_queries(path):return json.loads(Path(path).read_text(encoding="utf-8"))
def write_queries(records,path,count=40):
 values=[q.to_dict() for q in build_query_set(records,count)];Path(path).write_text(json.dumps(values,ensure_ascii=False,indent=2),encoding="utf-8");return values


