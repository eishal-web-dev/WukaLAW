"""CLI for streaming TASK-003 cleaning and metadata extraction."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Sequence

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from ai.preprocessing.processing_pipeline import process_manifest, render_report  # noqa: E402


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Clean and enrich a WakuLAW JSONL manifest.")
    parser.add_argument("--input", type=Path, default=Path("datasets/processed/manifest.jsonl"))
    parser.add_argument("--output", type=Path, default=Path("datasets/processed/clean_documents.jsonl"))
    parser.add_argument("--report", type=Path, default=ROOT / "docs" / "PREPROCESSING_REPORT.md")
    parser.add_argument("--overwrite", action="store_true")
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    try:
        summary = process_manifest(args.input, args.output, overwrite=args.overwrite)
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(render_report(summary), encoding="utf-8")
    except (FileNotFoundError, FileExistsError, ValueError, OSError) as exc:
        print(f"processing failed: {exc}", file=sys.stderr)
        return 1
    print(json.dumps({
        "documents_processed": summary.processed, "failures": summary.failures,
        "suspicious_cleaning_cases": summary.suspicious_cleaning_cases,
        "explicit_outcome_count": summary.explicit_outcome_count,
        "metadata_coverage": summary.coverage(), "output_path": summary.output_path,
        "report_path": args.report.resolve().as_posix(),
    }, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
