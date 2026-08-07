"""Create or validate a Qdrant collection safely."""
from __future__ import annotations
import argparse,json,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:sys.path.insert(0,str(ROOT))
from ai.vectorstore.collection_manager import CollectionManager
from ai.vectorstore.config import QdrantSettings
from ai.vectorstore.qdrant_client import WakuQdrantClient
def main(argv=None):
    p=argparse.ArgumentParser();p.add_argument("--collection",default=None);p.add_argument("--dimension",type=int,required=True);p.add_argument("--distance",default="cosine");p.add_argument("--local-path",type=Path);p.add_argument("--url");p.add_argument("--api-key");p.add_argument("--recreate",action="store_true");p.add_argument("--confirm-recreate",action="store_true");a=p.parse_args(argv);settings=QdrantSettings.from_env(collection=a.collection,local_path=a.local_path,url=a.url,api_key=a.api_key);client=WakuQdrantClient(settings)
    try:spec=CollectionManager(client).create(settings.collection,a.dimension,a.distance,recreate=a.recreate,confirm_recreate=a.confirm_recreate);print(json.dumps({"collection":spec.name,"dimension":spec.dimension,"distance":spec.distance,"payload_indexes":spec.payload_indexes,"mode":"embedded" if client.embedded else "server"},indent=2));return 0
    except Exception as exc:print(f"collection creation failed: {exc}",file=sys.stderr);return 1
    finally:client.close()
if __name__=="__main__":raise SystemExit(main())
