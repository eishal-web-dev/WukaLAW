from __future__ import annotations
import argparse,json,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:sys.path.insert(0,str(ROOT))
from ai.evaluation.stratified_sampler import write_sample
from ai.evaluation.retrieval_dataset import write_queries
def main():
 p=argparse.ArgumentParser();p.add_argument("--input",type=Path,required=True);p.add_argument("--output",type=Path,required=True);p.add_argument("--manifest",type=Path,required=True);p.add_argument("--target-size",type=int,default=600);p.add_argument("--seed",type=int,default=42);p.add_argument("--queries-output",type=Path,default=ROOT/"tests"/"fixtures"/"stratified_legal_queries.json");p.add_argument("--overwrite",action="store_true");a=p.parse_args();m=write_sample(a.input,a.output,a.manifest,a.target_size,a.seed,a.overwrite);records=[json.loads(x) for x in a.output.read_text(encoding="utf-8").splitlines() if x];queries=write_queries(records,a.queries_output,40);print(json.dumps({"selected":m.selected_size,"strata":[{"name":x.name,"selected":x.selected_count,"shortfall":x.shortfall} for x in m.strata],"queries":len(queries)},indent=2))
if __name__=="__main__":main()
