"""Conservative LegalQuery to LegalSearchQuery adapter."""
from __future__ import annotations
from dataclasses import asdict,dataclass,field
import re
from typing import Any
from ai.legal_intelligence.models import Intent,Jurisdiction,LegalDomain,LegalQuery
from ai.retrieval.models import LegalSearchQuery
ALLOWED={"source_datasets","document_types","courts","jurisdictions","case_categories","languages","chunk_types","section_numbers","article_numbers","document_ids","require_outcome"}
ALIASES={"court":"courts","jurisdiction":"jurisdictions","section":"section_numbers","article":"article_numbers","document_id":"document_ids"}
@dataclass(frozen=True)
class CorpusCapabilities:
 source_datasets:frozenset[str]=frozenset({"judgments","laws","labeled_cases"});document_types:frozenset[str]=frozenset({"judgment","law"});jurisdictions:frozenset[str]=frozenset({"Pakistan"});case_categories:frozenset[str]=frozenset({"Constitutional Cases","Civil Appeals"});languages:frozenset[str]=frozenset({"English","Urdu","Urdu and English","Unknown"})
@dataclass
class RetrievalInstructions:
 retrieval_query:str;source_datasets:list[str]=field(default_factory=list);document_types:list[str]=field(default_factory=list);courts:list[str]=field(default_factory=list);jurisdictions:list[str]=field(default_factory=list);case_categories:list[str]=field(default_factory=list);languages:list[str]=field(default_factory=list);chunk_types:list[str]=field(default_factory=list);section_numbers:list[str]=field(default_factory=list);article_numbers:list[str]=field(default_factory=list);document_ids:list[str]=field(default_factory=list);require_outcome:bool=False;top_k:int=10;score_threshold:float|None=None;adapter_warnings:list[str]=field(default_factory=list);intelligence_snapshot:dict[str,Any]|None=None
 def to_search_query(self):
  return LegalSearchQuery(query=self.retrieval_query,top_k=self.top_k,score_threshold=self.score_threshold,source_datasets=self.source_datasets,document_types=self.document_types,courts=self.courts,jurisdictions=self.jurisdictions,case_categories=self.case_categories,languages=self.languages,chunk_types=self.chunk_types,document_ids=self.document_ids,section_numbers=self.section_numbers,article_numbers=self.article_numbers,require_outcome=self.require_outcome,metadata={"intelligence_snapshot":self.intelligence_snapshot or {}})
 def applied_filters(self):
  data=asdict(self)
  for key in ("retrieval_query","top_k","score_threshold","adapter_warnings","intelligence_snapshot"):data.pop(key,None)
  return {k:v for k,v in data.items() if v not in ([],False,None)}
CATEGORIES={LegalDomain.FAMILY:"Family Law Cases",LegalDomain.CONSTITUTIONAL:"Constitutional Cases",LegalDomain.TAX:"Tax Revenue Cases",LegalDomain.CRIMINAL:"Criminal Appeals",LegalDomain.SERVICE:"Service Cases",LegalDomain.CIVIL:"Civil Appeals"}
JURIS={Jurisdiction.PAKISTAN:"Pakistan",Jurisdiction.PUNJAB:"Punjab",Jurisdiction.SINDH:"Sindh",Jurisdiction.KPK:"KPK",Jurisdiction.BALOCHISTAN:"Balochistan",Jurisdiction.ICT:"Islamabad Capital Territory",Jurisdiction.AJK:"Azad Jammu and Kashmir",Jurisdiction.GILGIT_BALTISTAN:"Gilgit-Baltistan"}
def unique(values):return list(dict.fromkeys(str(v).strip() for v in values if str(v).strip()))
def entities(data,*keys):return unique([v for key in keys for v in data.get(key,[])])
def requires_outcome(question,intent):return bool(re.search(r"\b(outcome|result|disposition|appeal (?:was )?(?:allowed|dismissed)|allowed appeal|dismissed appeal)\b",question,re.I)) or (intent==Intent.SIMILAR_CASE and bool(re.search(r"\bdecided\b",question,re.I)))
class IntelligenceAdapter:
 def __init__(self,capabilities=None,confidence_threshold=.5):self.capabilities=capabilities or CorpusCapabilities();self.confidence_threshold=confidence_threshold
 def adapt(self,original,intelligence,*,top_k=10,score_threshold=None,user_filters=None):
  warnings=list(intelligence.warnings);use=intelligence.confidence>=self.confidence_threshold and bool(intelligence.normalized_query.strip());query=intelligence.normalized_query.strip() if use else " ".join(original.split())
  if not use:warnings.append("Legal Intelligence confidence was low; cleaned original question used for retrieval.")
  out=RetrievalInstructions(query,top_k=top_k,score_threshold=score_threshold,intelligence_snapshot=intelligence.to_dict())
  if intelligence.language.value in self.capabilities.languages:out.languages=[intelligence.language.value]
  jurisdiction=JURIS.get(intelligence.jurisdiction)
  if jurisdiction:
   if jurisdiction in self.capabilities.jurisdictions:out.jurisdictions=[jurisdiction]
   else:warnings.append(f"Jurisdiction metadata value {jurisdiction!r} is not validated in the corpus; filter omitted.")
  category=CATEGORIES.get(intelligence.primary_domain)
  if category:
   if category in self.capabilities.case_categories:out.case_categories=[category]
   else:warnings.append(f"Case category {category!r} is not validated in the corpus; filter omitted.")
  out.section_numbers=entities(intelligence.entities,"sections");out.article_numbers=entities(intelligence.entities,"articles");out.courts=entities(intelligence.entities,"courts");out.document_ids=entities(intelligence.entities,"document_ids")
  for term in entities(intelligence.entities,"case_numbers","dowry","fir","bail","employment","inheritance","cheque"):
   if term.casefold() not in out.retrieval_query.casefold():out.retrieval_query+=" "+term
  if intelligence.intent==Intent.LAW_LOOKUP:out.document_types=["law"];out.source_datasets=["laws"]
  elif intelligence.intent in {Intent.SIMILAR_CASE,Intent.APPEAL}:out.document_types=["judgment"];out.source_datasets=["judgments"]
  elif intelligence.intent==Intent.EVIDENCE_QUESTION:out.document_types=["law","judgment"];out.source_datasets=["laws","judgments"]
  elif intelligence.intent==Intent.DOCUMENT_GENERATION:warnings.append("Document generation is not implemented; retrieval remains informational only.")
  out.require_outcome=requires_outcome(original,intelligence.intent);self.merge_user_filters(out,user_filters or {});out.adapter_warnings=unique(warnings+out.adapter_warnings);return out
 def merge_user_filters(self,out,filters):
  for raw,value in filters.items():
   key=ALIASES.get(raw,raw)
   if key not in ALLOWED:out.adapter_warnings.append(f"Unsupported user filter {raw!r} was ignored.");continue
   if key=="require_outcome":
    if isinstance(value,bool):setattr(out,key,value)
    else:out.adapter_warnings.append("Invalid require_outcome filter was ignored.")
   else:setattr(out,key,unique(value if isinstance(value,list) else [value]))
