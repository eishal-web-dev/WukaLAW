"""Streaming, failure-isolation, and immutability tests for TASK-004."""
import json
from pathlib import Path
from ai.chunking.chunking_pipeline import process_documents
from ai.chunking.legal_chunker import ChunkingConfig
def rec(doc,text="Section 1 Rule\nLegal text remains intact.",dataset="laws"):
    return {"document_id":doc,"source_dataset":dataset,"source_path":doc,"source_file_name":doc+".txt","document_type":"law","cleaned_text":text,"task_003_metadata":{},"metadata":{"content_sha256":"source-hash"}}
def test_streams_jsonl_continues_after_malformed_input_and_preserves_source(tmp_path:Path):
    source=tmp_path/"clean.jsonl";output=tmp_path/"chunks.jsonl";raw=tmp_path/"raw.txt";raw.write_text("raw",encoding="utf-8")
    source.write_text(json.dumps(rec("a"))+"\n{bad}\n"+json.dumps(rec("b"))+"\n",encoding="utf-8");before=source.read_bytes();raw_before=raw.read_bytes()
    summary=process_documents(source,output,ChunkingConfig(40,10,60,8))
    rows=[json.loads(x) for x in output.read_text(encoding="utf-8").splitlines()]
    assert summary.processed==2 and summary.failures==1;assert source.read_bytes()==before and raw.read_bytes()==raw_before
    assert all(row["document_id"] and row["text"] for row in rows);assert all(row["duplicate_hash"] for row in rows)
def test_duplicate_hash_preserved_and_canonical_recommended(tmp_path:Path):
    source=tmp_path/"clean.jsonl";output=tmp_path/"chunks.jsonl";source.write_text(json.dumps(rec("a"))+"\n"+json.dumps(rec("b"))+"\n",encoding="utf-8")
    summary=process_documents(source,output,ChunkingConfig(40,10,60,8));groups=summary.duplicate_groups()
    assert groups and groups[0]["count"]==2 and groups[0]["recommended_canonical_chunk_id"]
def test_filters_limit_and_existing_output_guard(tmp_path:Path):
    source=tmp_path/"clean.jsonl";output=tmp_path/"chunks.jsonl";source.write_text(json.dumps(rec("a","text","laws"))+"\n"+json.dumps(rec("b","text","other"))+"\n",encoding="utf-8")
    summary=process_documents(source,output,ChunkingConfig(40,10,60,8),datasets={"laws"},limit=1);assert summary.processed==1 and summary.skipped==1
    try:process_documents(source,output,ChunkingConfig(40,10,60,8))
    except FileExistsError:pass
    else:raise AssertionError("overwrite should be required")
