"""CLI for WakuLAW TASK-004 legal-aware chunking."""
from __future__ import annotations
import argparse,json,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:sys.path.insert(0,str(ROOT))
from ai.chunking.chunking_pipeline import process_documents,render_report
from ai.chunking.legal_chunker import ChunkingConfig
def parser():
    p=argparse.ArgumentParser();p.add_argument("--input",type=Path,default=Path("datasets/processed/clean_documents.jsonl"));p.add_argument("--output",type=Path,default=Path("datasets/processed/chunks.jsonl"));p.add_argument("--limit",type=int);p.add_argument("--dataset",action="append");p.add_argument("--document-type",action="append");p.add_argument("--target-tokens",type=int,default=700);p.add_argument("--min-tokens",type=int,default=250);p.add_argument("--max-tokens",type=int,default=1000);p.add_argument("--overlap-tokens",type=int,default=100);p.add_argument("--overwrite",action="store_true");p.add_argument("--report-path",type=Path,default=ROOT/"docs"/"CHUNKING_REPORT.md");return p
def main(argv=None):
    a=parser().parse_args(argv);config=ChunkingConfig(a.target_tokens,a.min_tokens,a.max_tokens,a.overlap_tokens)
    try: summary=process_documents(a.input,a.output,config,overwrite=a.overwrite,limit=a.limit,datasets=set(a.dataset or []) or None,document_types={x.casefold() for x in a.document_type or []} or None)
    except (OSError,ValueError) as exc:print(f"chunking failed: {exc}",file=sys.stderr);return 1
    a.report_path.parent.mkdir(parents=True,exist_ok=True);a.report_path.write_text(render_report(summary,config,{"clean_documents.jsonl":"opened read-only; post-run hash verified separately","manifest.jsonl":"not opened for writing","datasets/raw":"not opened for writing"}),encoding="utf-8")
    print(json.dumps({"documents_processed":summary.processed,"documents_skipped":summary.skipped,"chunks_generated":summary.chunks,"failures":summary.failures,"duplicate_chunk_groups":len(summary.duplicate_groups()),"chunks_above_maximum":summary.above_maximum,"tiny_chunks":summary.tiny_chunks,"output_path":str(a.output.resolve()),"report_path":str(a.report_path.resolve())},indent=2));return 0
if __name__=="__main__":raise SystemExit(main())
