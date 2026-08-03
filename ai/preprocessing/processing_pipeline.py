"""Streaming TASK-003 document processing pipeline."""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path

from ai.preprocessing.metadata_extractor import extract_metadata
from ai.preprocessing.text_cleaner import clean_legal_text


@dataclass
class ProcessingSummary:
    input_path: str
    output_path: str
    processed: int = 0
    failures: int = 0
    suspicious_cleaning_cases: int = 0
    explicit_outcome_count: int = 0
    metadata_counts: dict[str, int] = field(default_factory=dict)
    failure_messages: list[str] = field(default_factory=list)

    def coverage(self) -> dict[str, dict[str, float | int]]:
        return {
            key: {"count": count, "percent": round(count * 100 / self.processed, 2) if self.processed else 0.0}
            for key, count in sorted(self.metadata_counts.items())
        }


def process_manifest(input_path: Path, output_path: Path, *, overwrite: bool = False) -> ProcessingSummary:
    input_path = input_path.resolve()
    output_path = output_path.resolve()
    if not input_path.is_file():
        raise FileNotFoundError(input_path)
    if input_path == output_path:
        raise ValueError("input and output must be different files")
    if output_path.exists() and not overwrite:
        raise FileExistsError(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    summary = ProcessingSummary(input_path.as_posix(), output_path.as_posix())
    with input_path.open("r", encoding="utf-8") as source, output_path.open("w", encoding="utf-8", newline="\n") as destination:
        for line_number, line in enumerate(source, 1):
            if not line.strip():
                continue
            try:
                record = json.loads(line)
                original = record.get("text", "")
                if not isinstance(original, str):
                    raise TypeError("record text is not a string")
                cleaned, warnings = clean_legal_text(original)
                metadata = extract_metadata(cleaned, record)
                result = dict(record)
                result["original_text"] = original
                result["cleaned_text"] = cleaned
                result["task_003_metadata"] = metadata
                result["processing_warnings"] = warnings
                destination.write(json.dumps(result, ensure_ascii=False, separators=(",", ":")) + "\n")
                summary.processed += 1
                if "suspicious_size_reduction" in warnings:
                    summary.suspicious_cleaning_cases += 1
                if metadata["explicit_outcome_phrases"]:
                    summary.explicit_outcome_count += 1
                for key, value in metadata.items():
                    if key == "outcome_label":
                        continue
                    if value not in (None, "", []):
                        summary.metadata_counts[key] = summary.metadata_counts.get(key, 0) + 1
            except Exception as exc:
                summary.failures += 1
                if len(summary.failure_messages) < 25:
                    summary.failure_messages.append(f"line {line_number}: {type(exc).__name__}: {exc}")
    return summary


def render_report(summary: ProcessingSummary) -> str:
    rows = [f"| {key} | {value['count']} | {value['percent']:.2f}% |" for key, value in summary.coverage().items()]
    failures = "\n".join(f"- {message}" for message in summary.failure_messages) or "- None"
    return "\n".join([
        "# WakuLAW TASK-003 Preprocessing Report", "", "## Run summary", "",
        f"- Input: `{summary.input_path}`", f"- Output: `{summary.output_path}`",
        f"- Documents processed: {summary.processed}", f"- Failures: {summary.failures}",
        f"- Suspicious cleaning cases: {summary.suspicious_cleaning_cases}",
        f"- Documents with explicit outcome phrases: {summary.explicit_outcome_count}", "",
        "## Metadata coverage", "", "| Field | Documents | Coverage |", "|---|---:|---:|", *rows, "",
        "## Failures", "", failures, "",
        "The pipeline is deterministic and rule-based. It does not infer win/loss labels.", "",
    ])
