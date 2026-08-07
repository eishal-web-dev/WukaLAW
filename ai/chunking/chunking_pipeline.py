"""Streaming JSONL pipeline and reporting for TASK-004."""
from __future__ import annotations
import json, statistics
from collections import Counter
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from .legal_chunker import ChunkingConfig, chunk_document

@dataclass
class ChunkingSummary:
    input_path: str; output_path: str; processed: int=0; skipped: int=0; chunks: int=0; failures: int=0
    documents_no_chunks: int=0; above_maximum: int=0; tiny_chunks: int=0; outcome_chunks: int=0
    by_document_type: Counter=field(default_factory=Counter); by_chunk_type: Counter=field(default_factory=Counter)
    structural_splits: Counter=field(default_factory=Counter); token_sizes: list[int]=field(default_factory=list)
    duplicate_index: dict[str,dict[str,Any]]=field(default_factory=dict); warnings: Counter=field(default_factory=Counter)
    failure_messages: list[str]=field(default_factory=list); samples: dict[str,dict[str,Any]]=field(default_factory=dict)
    def duplicate_groups(self): return [v for v in self.duplicate_index.values() if v["count"]>1]

def process_documents(input_path: Path, output_path: Path, config: ChunkingConfig, *, overwrite: bool=False,
                      limit: int|None=None, datasets: set[str]|None=None, document_types: set[str]|None=None) -> ChunkingSummary:
    source=input_path.resolve(); destination=output_path.resolve()
    if not source.is_file(): raise FileNotFoundError(source)
    if source==destination: raise ValueError("input and output must differ")
    if destination.exists() and not overwrite: raise FileExistsError(destination)
    destination.parent.mkdir(parents=True,exist_ok=True)
    summary=ChunkingSummary(source.as_posix(),destination.as_posix()); created=datetime.now(timezone.utc).isoformat()
    with source.open("r",encoding="utf-8") as handle, destination.open("w",encoding="utf-8",newline="\n") as out:
        for line_number,line in enumerate(handle,1):
            if not line.strip(): continue
            try:
                record=json.loads(line); dataset=str(record.get("source_dataset") or ""); dtype=str(record.get("document_type") or "unknown").casefold()
                if datasets and dataset not in datasets: summary.skipped+=1; continue
                if document_types and dtype not in document_types: summary.skipped+=1; continue
                if limit is not None and summary.processed>=limit: summary.skipped+=1; continue
                chunks=chunk_document(record,config,created_at=created); summary.processed+=1
                if not chunks: summary.documents_no_chunks+=1
                cleaned=record.get("cleaned_text","")
                if cleaned.strip() and chunks:
                    intervals=sorted((c.character_start,c.character_end) for c in chunks)
                    cursor=0
                    for start,end in intervals:
                        if start>cursor: raise ValueError(f"unrepresented source range {cursor}:{start}")
                        cursor=max(cursor,end)
                    if cursor<len(cleaned): raise ValueError(f"unrepresented source tail {cursor}:{len(cleaned)}")
                for chunk in chunks:
                    if not chunk.document_id or not chunk.text: raise ValueError("invalid empty chunk or document ID")
                    out.write(json.dumps(chunk.to_dict(),ensure_ascii=False,separators=(",",":"))+"\n")
                    summary.chunks+=1; summary.token_sizes.append(chunk.estimated_token_count)
                    summary.by_document_type[dtype]+=1; summary.by_chunk_type[chunk.chunk_type]+=1
                    summary.structural_splits[chunk.metadata.get("structural_kind","body")]+=1
                    if chunk.chunk_type=="outcome": summary.outcome_chunks+=1
                    if chunk.estimated_token_count>config.max_tokens: summary.above_maximum+=1
                    if chunk.estimated_token_count<config.min_tokens: summary.tiny_chunks+=1
                    for warning in chunk.warnings: summary.warnings[warning]+=1
                    duplicate=summary.duplicate_index.setdefault(chunk.duplicate_hash,{"duplicate_hash":chunk.duplicate_hash,"count":0,"recommended_canonical_chunk_id":chunk.chunk_id})
                    duplicate["count"]+=1
                    duplicate["recommended_canonical_chunk_id"]=min(duplicate["recommended_canonical_chunk_id"],chunk.chunk_id)
                    sample_key="labeled_case" if dataset=="labeled_cases" else dtype
                    if sample_key in {"law","judgment","labeled_case","template"} and sample_key not in summary.samples: summary.samples[sample_key]=chunk.to_dict()
            except Exception as exc:
                summary.failures+=1
                if len(summary.failure_messages)<50: summary.failure_messages.append(f"line {line_number}: {type(exc).__name__}: {exc}")
    return summary

def _metrics(values: list[int]) -> dict[str,float|int]:
    if not values:return {k:0 for k in ("minimum","median","average","p95","maximum")}
    ordered=sorted(values); p95=ordered[min(len(ordered)-1,max(0,round(.95*len(ordered))-1))]
    return {"minimum":min(values),"median":statistics.median(values),"average":round(statistics.mean(values),2),"p95":p95,"maximum":max(values)}
def render_report(summary: ChunkingSummary, config: ChunkingConfig, integrity: dict[str,str]|None=None) -> str:
    metrics=_metrics(summary.token_sizes); integrity=integrity or {}
    lines=["# WakuLAW TASK-004 Chunking Report","","## Execution summary","",f"- Source documents processed: {summary.processed}",f"- Source documents skipped: {summary.skipped}",f"- Total chunks generated: {summary.chunks}",f"- Average chunks per document: {summary.chunks/summary.processed:.2f}" if summary.processed else "- Average chunks per document: 0",f"- Failures: {summary.failures}",f"- Documents with no chunks: {summary.documents_no_chunks}",f"- Outcome chunks: {summary.outcome_chunks}",f"- Duplicate chunk groups: {len(summary.duplicate_groups())}",f"- Chunks above hard maximum: {summary.above_maximum}",f"- Tiny chunks below soft minimum: {summary.tiny_chunks}","","## Token-size distribution","",*(f"- {k}: {v}" for k,v in metrics.items()),"","## Chunk counts by document type","",*(f"- {k}: {v}" for k,v in sorted(summary.by_document_type.items())),"","## Chunk counts by chunk type","",*(f"- {k}: {v}" for k,v in sorted(summary.by_chunk_type.items())),"","## Structural splits","",*(f"- {k}: {v}" for k,v in sorted(summary.structural_splits.items())),"","## Warnings and failures","",*(f"- {k}: {v}" for k,v in sorted(summary.warnings.items())),*(f"- {x}" for x in summary.failure_messages)]
    if not summary.warnings and not summary.failure_messages: lines.append("- None")
    lines += ["","## Duplicate chunk groups",""]
    groups=sorted(summary.duplicate_groups(),key=lambda x:(-x["count"],x["recommended_canonical_chunk_id"]))
    lines += [f"- `{x['duplicate_hash']}`: {x['count']} chunks; canonical `{x['recommended_canonical_chunk_id']}`" for x in groups[:100]] or ["- None"]
    lines += ["","## Sample chunks",""]
    for kind,sample in summary.samples.items(): lines += [f"### {kind}","","```json",json.dumps(sample,ensure_ascii=False,indent=2)[:8000],"```",""]
    lines += ["## Integrity confirmation","",*(f"- {k}: `{v}`" for k,v in integrity.items()),"","No embeddings, OCR, LLM inference, summarization, paraphrasing, or source rewriting was performed.",""]
    return "\n".join(lines)
