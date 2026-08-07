"""Reusable dense model providers with explicit, resumable Hugging Face loading."""
from __future__ import annotations
import hashlib,logging,os,re,time
from abc import ABC,abstractmethod
from pathlib import Path
import numpy as np
LOGGER=logging.getLogger("wakulaw.embeddings")
class EmbeddingProvider(ABC):
 model_name:str;model_revision:str|None;dimension:int;device:str;pooling_method:str="mean";max_input_tokens:int=8192
 @abstractmethod
 def encode_dense(self,texts:list[str],batch_size:int,normalize:bool=True)->tuple[np.ndarray,int]:...
 def metadata(self):return {"model":self.model_name,"revision":self.model_revision,"dimension":self.dimension,"device":self.device,"pooling_method":self.pooling_method,"normalized":True}
class FakeEmbeddingProvider(EmbeddingProvider):
 def __init__(self,dimension=32,fail_above_batch=None):self.model_name="fake-deterministic";self.model_revision="test-v1";self.dimension=dimension;self.device="cpu";self.fail_above_batch=fail_above_batch;self.max_input_tokens=512
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
 def __init__(self,model_name="BAAI/bge-m3",device="auto",revision=None,*,cache_dir=None,local_files_only=False,download_timeout=60,retries=3,max_input_tokens=None):
  os.environ["HF_HUB_DOWNLOAD_TIMEOUT"]=str(download_timeout);os.environ.setdefault("HF_HUB_ETAG_TIMEOUT",str(min(download_timeout,30)))
  import torch
  from sentence_transformers import SentenceTransformer
  if device=="auto":device="cuda" if torch.cuda.is_available() else "cpu"
  if device=="cuda" and not torch.cuda.is_available():raise RuntimeError("CUDA requested but unavailable")
  self.model_name=model_name;self.model_revision=revision;self.device=device;cache_path=Path(cache_dir).expanduser() if cache_dir else None
  if cache_path and (cache_path / "hub").is_dir():cache_path=cache_path / "hub"
  cache=str(cache_path) if cache_path else None
  last=None
  for attempt in range(1,max(1,retries)+1):
   try:
    LOGGER.warning("Loading exact embedding model %s revision=%s device=%s cache=%s offline=%s (attempt %d/%d)",model_name,revision or "resolved-main",device,cache or "default",local_files_only,attempt,max(1,retries))
    started=time.monotonic();self.model=SentenceTransformer(model_name,device=device,revision=revision,cache_folder=cache,local_files_only=local_files_only,trust_remote_code=False)
    LOGGER.warning("Embedding model loaded in %.2f seconds",time.monotonic()-started);last=None;break
   except Exception as exc:
    last=exc
    if attempt>=max(1,retries):break
    delay=min(2**(attempt-1),8);LOGGER.warning("Model load/download attempt failed: %s; retrying in %s seconds",exc,delay);time.sleep(delay)
  if last is not None:
   mode="cache-only" if local_files_only else "online/resumable"
   raise RuntimeError(f"Could not load exact embedding model {model_name!r} revision={revision!r} in {mode} mode from cache={cache!r}; no fallback was used. Verify network/cache space, increase --download-timeout, or pre-download with huggingface_hub.snapshot_download. Cause: {last}") from last
  self.dimension=int(self.model.get_sentence_embedding_dimension());model_limit=int(getattr(self.model,"max_seq_length",8192));self.max_input_tokens=min(model_limit,int(max_input_tokens)) if max_input_tokens else model_limit;self.model.max_seq_length=self.max_input_tokens;self.pooling_method="sentence-transformers pooling"
  try:self.model_revision=self.model._first_module().auto_model.config._commit_hash or revision
  except Exception:self.model_revision=revision
 def encode_dense(self,texts,batch_size,normalize=True):
  used=batch_size
  while True:
   try:return np.asarray(self.model.encode(texts,batch_size=used,normalize_embeddings=normalize,show_progress_bar=False,convert_to_numpy=True),dtype=np.float32),used
   except (RuntimeError,MemoryError) as exc:
    if used<=1 or not any(x in str(exc).casefold() for x in ("memory","allocate","cuda")):raise
    new=max(1,used//2);LOGGER.warning("Embedding memory failure at batch size %d; retrying at %d",used,new);used=new
    try:
     import torch
     if torch.cuda.is_available():torch.cuda.empty_cache()
    except Exception:pass
def create_provider(model_name,device="auto",revision=None,dimension=None,cache_dir=None,local_files_only=False,download_timeout=60,retries=3,max_input_tokens=None):
 if model_name=="fake-deterministic":return FakeEmbeddingProvider(dimension or 32)
 return SentenceTransformerProvider(model_name,device,revision,cache_dir=cache_dir,local_files_only=local_files_only,download_timeout=download_timeout,retries=retries,max_input_tokens=max_input_tokens)


