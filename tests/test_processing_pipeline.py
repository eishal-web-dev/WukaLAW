"""Tests for streaming and failure isolation in TASK-003."""

import json
from pathlib import Path

from ai.preprocessing.processing_pipeline import process_manifest


def test_pipeline_preserves_text_streams_jsonl_and_continues_after_failure(tmp_path: Path) -> None:
    source = tmp_path / "manifest.jsonl"
    output = tmp_path / "clean.jsonl"
    source.write_text(
        json.dumps({"document_id": "one", "text": "Page 1 of 1\nThe appeal is allowed."})
        + "\n{broken json}\n"
        + json.dumps({"document_id": "two", "text": "Section 5 remains intact."})
        + "\n",
        encoding="utf-8",
    )
    before = source.read_bytes()
    summary = process_manifest(source, output)
    records = [json.loads(line) for line in output.read_text(encoding="utf-8").splitlines()]
    assert source.read_bytes() == before
    assert summary.processed == 2
    assert summary.failures == 1
    assert len(records) == 2
    assert records[0]["text"] == records[0]["original_text"]
    assert records[0]["cleaned_text"] == "The appeal is allowed."
    assert records[1]["cleaned_text"] == "Section 5 remains intact."
    assert records[0]["task_003_metadata"]["outcome_label"] is None


def test_pipeline_requires_overwrite_for_existing_output(tmp_path: Path) -> None:
    source = tmp_path / "manifest.jsonl"
    output = tmp_path / "clean.jsonl"
    source.write_text(json.dumps({"text": "Legal text"}) + "\n", encoding="utf-8")
    output.write_text("existing", encoding="utf-8")
    try:
        process_manifest(source, output)
    except FileExistsError:
        pass
    else:
        raise AssertionError("existing output should require overwrite=True")
