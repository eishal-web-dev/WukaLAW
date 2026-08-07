"""Search Qdrant for traceable legal chunks; does not generate answers."""
from __future__ import annotations
import argparse,json,sys,time
from dataclasses import asdict
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:sys.path.insert(0,str(ROOT))
from ai.embeddings.model_provider import FakeEmbeddingProvider,SentenceTransformerProvider
from ai.retrieval.models import LegalSearchQuery
from ai.retrieval.retriever import LegalRetriever
from ai.vectorstore.config import QdrantSettings
from ai.vectorstore.qdrant_client import WakuQdrantClient
def main(argv=None):
    p=argparse.ArgumentParser();p.add_argument("--query",required=True);p.add_argument("--top-k",type=int,default=10);p.add_argument("--score-threshold",type=float);p.add_argument("--collection");p.add_argument("--local-path",type=Path);p.add_argument("--url");p.add_argument("--api-key");p.add_argument("--provider",choices=("fake","bge-m3"),default="bge-m3");p.add_argument("--dimension",type=int,default=1024)
    for name in ("court","case-category","document-type","source-dataset","language","chunk-type"):p.add_argument("--"+name,action="append")
    p.add_argument("--require-outcome",action="store_true");a=p.parse_args(argv);settings=QdrantSettings.from_env(collection=a.collection,local_path=a.local_path,url=a.url,api_key=a.api_key);client=WakuQdrantClient(settings)
    try:
        provider=FakeEmbeddingProvider(a.dimension) if a.provider=="fake" else SentenceTransformerProvider("BAAI/bge-m3")
        query=LegalSearchQuery(a.query,a.top_k,a.score_threshold,a.source_dataset or [],a.document_type or [],a.court or [],[],a.case_category or [],a.language or [],a.chunk_type or [],[],[],[],a.require_outcome)
        started=time.monotonic();results=LegalRetriever(client,settings.collection,provider).search(query);print(json.dumps({"engineering_validation_only":a.provider=="fake","latency_ms":round((time.monotonic()-started)*1000,2),"results":[asdict(x) for x in results]},ensure_ascii=False,indent=2));return 0
    except Exception as exc:print(f"search failed: {exc}",file=sys.stderr);return 1
    finally:client.close()
if __name__=="__main__":raise SystemExit(main())
