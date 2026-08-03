"""CLI entry point for WakuLAW's read-only unified dataset loader."""

from __future__ import annotations

import argparse
import json
import logging
import sys
from pathlib import Path
from typing import Sequence


REPOSITORY_ROOT = Path(__file__).resolve().parents[1]
if str(REPOSITORY_ROOT) not in sys.path:
    sys.path.insert(0, str(REPOSITORY_ROOT))

from ai.preprocessing.dataset_loader import SUPPORTED_DATASETS, load_datasets  # noqa: E402


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Stream WakuLAW raw datasets into a unified, traceable JSONL manifest."
    )
    parser.add_argument("--input", type=Path, default=Path("datasets/raw"), help="Raw dataset root")
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("datasets/processed/manifest.jsonl"),
        help="Unified JSONL manifest path",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Maximum total records to write (useful for smoke tests)",
    )
    parser.add_argument(
        "--dataset",
        action="append",
        default=None,
        help=(
            "Dataset to load; repeat or use comma-separated values. "
            f"Available: {', '.join(SUPPORTED_DATASETS)}"
        ),
    )
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Replace an existing output manifest",
    )
    parser.add_argument(
        "--report",
        type=Path,
        default=REPOSITORY_ROOT / "docs" / "DATASET_LOADER_REPORT.md",
        help="Markdown report path",
    )
    parser.add_argument(
        "--log-level",
        choices=("DEBUG", "INFO", "WARNING", "ERROR"),
        default="INFO",
        help="Logging verbosity",
    )
    return parser


def _parse_datasets(values: list[str] | None) -> list[str] | None:
    if not values:
        return None
    selected: list[str] = []
    for value in values:
        selected.extend(item.strip() for item in value.split(",") if item.strip())
    return selected


def main(argv: Sequence[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    logging.basicConfig(
        level=getattr(logging, args.log_level),
        format="%(levelname)s %(name)s: %(message)s",
    )
    try:
        summary = load_datasets(
            args.input,
            args.output,
            limit=args.limit,
            datasets=_parse_datasets(args.dataset),
            overwrite=args.overwrite,
            report_path=args.report,
        )
    except (FileNotFoundError, FileExistsError, ValueError, OSError) as exc:
        logging.getLogger("wakulaw.dataset_loader").error("Dataset load failed: %s", exc)
        return 1

    print(
        json.dumps(
            {
                "total_documents": summary.total_documents,
                "failed_documents": summary.failed_documents,
                "empty_documents": summary.empty_documents,
                "duplicate_group_count": len(summary.duplicate_groups),
                "raw_changed": summary.raw_changed,
                "output_path": summary.output_path,
                "report_path": args.report.resolve().as_posix(),
            },
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
