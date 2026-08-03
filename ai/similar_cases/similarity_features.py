"""Explainable deterministic similarity features."""
from __future__ import annotations
from dataclasses import dataclass,field
import re
from .models import MatchingFactor
@dataclass(frozen=True)
class FeatureWeights:
 vector_relevance:float=.70;same_legal_domain:float=.05;same_case_category:float=.05;same_court:float=.03;same_jurisdiction:float=.03;shared_law:float=.04;shared_section:float=.03;shared_article:float=.03;shared_citation:float=.02;shared_entity:float=.01;matching_outcome:float=.005;preferred_chunk_type:float=.005

def overlap(a,b):
 right={str(x).casefold() for x in b};return [str(x) for x in a if str(x).casefold() in right]
def compute_features(intelligence,candidate,request,weights=None):
 w=weights or FeatureWeights();f=[MatchingFactor("vector_relevance",f"{max(0,min(1,candidate.score)):.4f}",w.vector_relevance)]
 text=" ".join([candidate.case_category or "",candidate.text_preview or ""]).casefold();domain=intelligence.primary_domain.value.casefold().replace(" law","")
 if domain!="unknown" and domain in text:f.append(MatchingFactor("same_legal_domain",intelligence.primary_domain.value,w.same_legal_domain))
 if request.case_category and candidate.case_category==request.case_category:f.append(MatchingFactor("same_case_category",candidate.case_category,w.same_case_category))
 if request.court and candidate.court==request.court:f.append(MatchingFactor("same_court",candidate.court,w.same_court))
 if request.jurisdiction and candidate.jurisdiction==request.jurisdiction:f.append(MatchingFactor("same_jurisdiction",candidate.jurisdiction,w.same_jurisdiction))
 entities=intelligence.entities
 for name,items,citems,label,weight in (("acts",entities.get("acts",[]),candidate.laws_cited,"shared_law",w.shared_law),("sections",entities.get("sections",[]),candidate.sections_cited,"shared_section",w.shared_section),("articles",entities.get("articles",[]),candidate.articles_cited,"shared_article",w.shared_article),("citations",entities.get("legal_citations",[]),candidate.legal_citations,"shared_legal_citation",w.shared_citation)):
  for value in overlap(items,citems):f.append(MatchingFactor(label,value,weight))
 for key,values in entities.items():
  if key in {"acts","sections","articles","legal_citations"}:continue
  for value in values:
   if re.search(r"\b"+re.escape(value.casefold())+r"\b",text):f.append(MatchingFactor("shared_explicit_entity",value,w.shared_entity))
 if request.include_outcomes and candidate.explicit_outcome_phrase:
  terms=set(re.findall(r"\b(?:allowed|dismissed|granted|refused|acquitted|convicted)\b",(request.situation or "").casefold()))
  for term in terms:
   if term in candidate.explicit_outcome_phrase.casefold():f.append(MatchingFactor("matching_outcome_term",term,w.matching_outcome))
 if candidate.chunk_type in {"reasoning","findings","outcome","judgment_body"}:f.append(MatchingFactor("preferred_chunk_type",candidate.chunk_type,w.preferred_chunk_type))
 return f
