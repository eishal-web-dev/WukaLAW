"""Case-level deduplication and configurable deterministic ranking."""
from __future__ import annotations
from dataclasses import dataclass
from .similarity_features import compute_features,FeatureWeights
@dataclass(frozen=True)
class SimilarityThresholds:
 highly_relevant:float=.85;relevant:float=.65;possibly_relevant:float=.40

def label(score,thresholds=None):
 t=thresholds or SimilarityThresholds()
 if score>=t.highly_relevant:return "highly_relevant"
 if score>=t.relevant:return "relevant"
 if score>=t.possibly_relevant:return "possibly_relevant"
 return "weak_match"
def rank_candidates(candidates,intelligence,request,weights=None,thresholds=None):
 weights=weights or FeatureWeights();best={}
 for candidate in candidates:
  factors=compute_features(intelligence,candidate,request,weights);raw=max(0,min(1,float(candidate.score)));boost=sum(x.weight for x in factors if x.factor!="vector_relevance");ranking=raw*weights.vector_relevance+boost
  current=best.get(candidate.document_id)
  if current is None or ranking>current[0]:best[candidate.document_id]=(ranking,raw,candidate,factors)
 return sorted(best.values(),key=lambda x:(-x[0],-x[1],x[2].document_id))
