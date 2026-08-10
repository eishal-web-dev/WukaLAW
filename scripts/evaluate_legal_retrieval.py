"""Run WukaLAW's small retrieval golden set against the configured local collection."""
from __future__ import annotations
import argparse
import json
from pathlib import Path
from ai.evaluation.legal_regression import evaluate_gold_set
from ai.similar_cases.models import SimilarCaseRequest
from app.routers.similar_cases import get_similar_case_pipeline

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--fixture",type=Path,default=Path("tests/fixtures/legal_retrieval_gold.json"))
    parser.add_argument("--output",type=Path,default=Path("datasets/processed/legal_retrieval_regression.json"))
    args=parser.parse_args()
    items=json.loads(args.fixture.read_text(encoding="utf-8-sig"))
    pipeline=get_similar_case_pipeline()
    result_sets={}
    for item in items:
        response=pipeline.run(SimilarCaseRequest(situation=item["query"],top_k=5))
        result_sets[item["query_id"]]=[row.__dict__ for row in response.results]
    report=evaluate_gold_set(items,result_sets)
    args.output.parent.mkdir(parents=True,exist_ok=True)
    args.output.write_text(json.dumps(report,indent=2),encoding="utf-8")
    print(json.dumps(report,indent=2))
if __name__=="__main__": main()
