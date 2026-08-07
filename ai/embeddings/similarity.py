"""NumPy cosine retrieval without a vector database."""
from __future__ import annotations
import numpy as np
def normalize_rows(vectors:np.ndarray)->np.ndarray:
    values=np.asarray(vectors,dtype=np.float32);norms=np.linalg.norm(values,axis=1,keepdims=True);norms[norms==0]=1;return values/norms
def cosine_scores(query:np.ndarray,vectors:np.ndarray)->np.ndarray:
    q=normalize_rows(np.asarray(query,dtype=np.float32).reshape(1,-1))[0];return normalize_rows(vectors)@q
def top_k(query:np.ndarray,vectors:np.ndarray,k:int)->list[tuple[int,float]]:
    if k<=0 or len(vectors)==0:return []
    scores=cosine_scores(query,vectors);indices=np.argsort(-scores,kind="stable")[:k];return [(int(i),float(scores[i])) for i in indices]
