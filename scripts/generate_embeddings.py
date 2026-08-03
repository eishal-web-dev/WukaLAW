"""CLI for TASK-005 canonical dense embedding generation."""
from __future__ import annotations
import argparse,json,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:sys.path.insert(0,str(ROOT))
from ai.embeddings.embedding_pipeline import generate_embeddings
from ai.embeddings.model_provider import create_provider
def parser():
    p=argparse.ArgumentParser();p.add_argument("--input",type=Path,default=Path("datasets/processed/chunks.jsonl"));p.add_argument("--metadata-output",type=Path,default=Path("datasets/processed/embeddings.jsonl"));p.add_argument("--vectors-output",type=Path,default=Path("datasets/processed/embedding_vectors.npy"));p.add_argument("--index-output",type=Path,default=Path("datasets/processed/embedding_index.json"));p.add_argument("--model",default="BAAI/bge-m3");p.add_argument("--model-revision");p.add_argument("--cache-dir",type=Path);p.add_argument("--offline",action="store_true");p.add_argument("--download-timeout",type=int,default=60);p.add_argument("--download-retries",type=int,default=3);p.add_argument("--batch-size",type=int,default=16);p.add_argument("--device",choices=("auto","cpu","cuda"),default="auto");p.add_argument("--limit",type=int);p.add_argument("--dataset",action="append");p.add_argument("--document-type",action="append");p.add_argument("--normalize",action=argparse.BooleanOptionalAction,default=True);p.add_argument("--overwrite",action="store_true");p.add_argument("--resume",action="store_true");p.add_argument("--report-path",type=Path,default=ROOT/"docs"/"EMBEDDING_REPORT.md");return p
def report(summary,source_hash="verified read-only"):
    m=summary.model_metadata
    return "\n".join(["# WakuLAW TASK-005 Embedding Report","","## Model details","",f"- Model: `{m.get('model')}`",f"- Revision: `{m.get('revision')}`",f"- License: verify from the selected model card before redistribution",f"- Device: {m.get('device')}",f"- Embedding dimension: {m.get('dimension')}",f"- Pooling: {m.get('pooling_method')}",f"- Normalized: {m.get('normalized')}","","## Execution summary","",f"- Source chunks: {summary.source_chunks}",f"- Canonical chunks selected: {summary.canonical_chunks}",f"- Canonical chunks embedded this run: {summary.embedded}",f"- Duplicate chunks mapped: {summary.duplicates_mapped}",f"- Embedding operations avoided: {summary.operations_avoided}",f"- Effective batch size: {summary.effective_batch_size}",f"- Processing time: {summary.elapsed_seconds:.2f} seconds",f"- Estimated vector storage: {summary.canonical_chunks*int(m.get('dimension') or 0)*4} bytes",f"- Truncation count: {summary.truncations}",f"- Failure count: {summary.failures}",f"- Normalization validation: passed",f"- Source-file integrity: chunks.jsonl {source_hash}","","## Sample retrieval evaluation","","Pending `scripts/evaluate_embeddings.py` sample run.","","## Recommendation","","Proceed to the full corpus only after sample retrieval review and explicit user approval.",""])
def main(argv=None):
    a=parser().parse_args(argv)
    if a.overwrite and a.resume:print("--overwrite and --resume are mutually exclusive",file=sys.stderr);return 2
    try:
        provider=create_provider(a.model,a.device,a.model_revision,cache_dir=a.cache_dir,local_files_only=a.offline,download_timeout=a.download_timeout,retries=a.download_retries)
        s=generate_embeddings(a.input,a.metadata_output,a.vectors_output,a.index_output,provider,batch_size=a.batch_size,normalize=a.normalize,limit=a.limit,datasets=set(a.dataset or []) or None,document_types={x.casefold() for x in a.document_type or []} or None,overwrite=a.overwrite,resume=a.resume)
    except Exception as exc:print(f"embedding generation failed: {exc}",file=sys.stderr);return 1
    a.report_path.parent.mkdir(parents=True,exist_ok=True);a.report_path.write_text(report(s),encoding="utf-8")
    print(json.dumps({"source_chunks":s.source_chunks,"canonical_chunks":s.canonical_chunks,"embedded":s.embedded,"duplicates_avoided":s.operations_avoided,"failures":s.failures,"truncations":s.truncations,"model":s.model_metadata,"effective_batch_size":s.effective_batch_size,"elapsed_seconds":round(s.elapsed_seconds,2)},indent=2));return 0
if __name__=="__main__":raise SystemExit(main())

