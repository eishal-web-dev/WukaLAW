"""Reusable dense model providers; sparse support can be added alongside encode_dense."""
from __future__ import annotations
import hashlib,re
from abc import ABC,abstractmethod
import numpy as np
class EmbeddingProvider(ABC):
    model_name:str;model_revision:str|None;dimension:int;device:str;pooling_method:str="mean"
    max_input_tokens:int=8192
    @abstractmethod
    def encode_dense(self,texts:list[str],batch_size:int,normalize:bool=True)->tuple[np.ndarray,int]:...
    def metadata(self):return {"model":self.model_name,"revision":self.model_revision,"dimension":self.dimension,"device":self.device,"pooling_method":self.pooling_method,"normalized":True}
class FakeEmbeddingProvider(EmbeddingProvider):
    def __init__(self,dimension:int=32,fail_above_batch:int|None=None):
        self.model_name="fake-deterministic";self.model_revision="test-v1";self.dimension=dimension;self.device="cpu";self.fail_above_batch=fail_above_batch;self.max_input_tokens=512
    def encode_dense(self,texts,batch_size,normalize=True):
        used=batch_size
        while self.fail_above_batch and used>self.fail_above_batch:used=max(1,used//2)
        vectors=np.zeros((len(texts),self.dimension),dtype=np.float32)
        for i,text in enumerate(texts):
            for token in re.findall(r"[a-z0-9]+",text.casefold()):vectors[i,int(hashlib.sha256(token.encode()).hexdigest(),16)%self.dimension]+=1
        if normalize and len(texts):
            norms=np.linalg.norm(vectors,axis=1,keepdims=True);norms[norms==0]=1;vectors/=norms
        return vectors,used
class SentenceTransformerProvider(EmbeddingProvider):
    def __init__(self,model_name:str="BAAI/bge-m3",device:str="auto",revision:str|None=None):
        import torch
        from sentence_transformers import SentenceTransformer
        if device=="auto":device="cuda" if torch.cuda.is_available() else "cpu"
        if device=="cuda" and not torch.cuda.is_available():raise RuntimeError("CUDA requested but unavailable")
        self.model_name=model_name;self.model_revision=revision;self.device=device
        try:self.model=SentenceTransformer(model_name,device=device,revision=revision)
        except Exception as exc:raise RuntimeError(f"Could not load requested embedding model {model_name!r}; no fallback was used: {exc}") from exc
        self.dimension=int(self.model.get_sentence_embedding_dimension());self.max_input_tokens=int(getattr(self.model,"max_seq_length",8192));self.pooling_method="sentence-transformers pooling"
        try:self.model_revision=self.model._first_module().auto_model.config._commit_hash or revision
        except Exception:self.model_revision=revision
    def encode_dense(self,texts,batch_size,normalize=True):
        used=batch_size
        while True:
            try:
                values=self.model.encode(texts,batch_size=used,normalize_embeddings=normalize,show_progress_bar=False,convert_to_numpy=True)
                return np.asarray(values,dtype=np.float32),used
            except (RuntimeError,MemoryError) as exc:
                if used<=1 or not any(x in str(exc).casefold() for x in ("memory","allocate","cuda")):raise
                used=max(1,used//2)
                try:
                    import torch
                    if torch.cuda.is_available():torch.cuda.empty_cache()
                except Exception:pass
def create_provider(model_name:str,device:str="auto",revision:str|None=None,dimension:int|None=None)->EmbeddingProvider:
    if model_name=="fake-deterministic":return FakeEmbeddingProvider(dimension or 32)
    return SentenceTransformerProvider(model_name,device,revision)
