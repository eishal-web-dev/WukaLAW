"""Read-only dataset inventory and suitability audit for WakuLAW.

The auditor deliberately performs no cleaning, preprocessing, OCR, embedding, or
mutation of source files. It uses only Python's standard library.
"""

from __future__ import annotations

import argparse
import csv
import json
import logging
import re
import sys
from collections import Counter, defaultdict
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable, Sequence


LOGGER = logging.getLogger("wakulaw.dataset_audit")

SUPPORTED_EXTENSIONS = {".txt", ".pdf", ".json", ".csv", ".md"}
TEXT_EXTENSIONS = {".txt", ".md", ".json", ".csv"}
MAX_TEXT_SAMPLE_BYTES = 1_000_000
MAX_JSON_PARSE_BYTES = 20_000_000
MAX_SAMPLE_FILES_PER_DATASET = 5

COURT_PATTERNS: tuple[tuple[str, tuple[str, ...]], ...] = (
    ("Supreme Court of Pakistan", ("supreme court of pakistan", "supreme court pakistan", "scmr")),
    ("Federal Shariat Court", ("federal shariat court", "fsc")),
    ("Lahore High Court", ("lahore high court", "lhc")),
    ("Sindh High Court", ("sindh high court", "shc")),
    ("Islamabad High Court", ("islamabad high court", "ihc")),
    ("Peshawar High Court", ("peshawar high court", "phc")),
    ("Balochistan High Court", ("balochistan high court", "bhc")),
    ("High Court", ("high court",)),
    ("District and Sessions Court", ("district and sessions", "sessions court", "district court")),
    ("Special Court/Tribunal", ("special court", "tribunal", "banking court", "anti-terrorism court")),
)

DOCUMENT_TYPE_PATTERNS: tuple[tuple[str, tuple[str, ...]], ...] = (
    ("Judgment", ("judgment", "judgement", "reported case", "pld ", "scmr ")),
    ("Court order", ("court order", "short order", "order sheet", "ordered that")),
    ("Petition/pleading", ("petition", "plaint", "written statement", "appeal", "application under")),
    ("Legislation", ("act,", "act 19", "ordinance", "statute", "section ", "rules,", "constitution of pakistan")),
    ("Contract/agreement", ("agreement", "contract", "memorandum of understanding")),
    ("Template/form", ("template", "sample form", "form no", "draft ", "placeholder")),
    ("Legal article/commentary", ("law review", "legal article", "commentary", "case note")),
)

OUTCOME_FIELD_TERMS = {
    "outcome",
    "outcome_label",
    "decision",
    "decision_label",
    "verdict",
    "result",
    "judgment_result",
    "label",
    "target",
    "allowed",
    "dismissed",
}


@dataclass(frozen=True)
class DecodedSample:
    """A bounded decoded text sample and its detected encoding."""

    text: str
    encoding: str
    issue: str | None = None


def _normalise_path(path: Path) -> str:
    """Return a portable path for report output."""

    return path.as_posix()


def _read_prefix(path: Path, limit: int = MAX_TEXT_SAMPLE_BYTES) -> bytes:
    with path.open("rb") as handle:
        return handle.read(limit)


def decode_text_sample(path: Path) -> DecodedSample:
    """Decode a bounded sample without modifying the source file."""

    raw = _read_prefix(path)
    if raw.startswith(b"\xef\xbb\xbf"):
        return DecodedSample(raw.decode("utf-8-sig"), "utf-8-sig")
    if raw.startswith((b"\xff\xfe", b"\xfe\xff")):
        try:
            return DecodedSample(raw.decode("utf-16"), "utf-16")
        except UnicodeDecodeError as exc:
            return DecodedSample(
                raw.decode("utf-16", errors="replace"),
                "utf-16",
                f"Invalid UTF-16 sequence: {exc}",
            )
    try:
        return DecodedSample(raw.decode("utf-8"), "utf-8")
    except UnicodeDecodeError as utf8_error:
        for encoding in ("cp1252", "latin-1"):
            try:
                text = raw.decode(encoding)
                return DecodedSample(
                    text,
                    encoding,
                    f"Not valid UTF-8; decoded sample as {encoding}: {utf8_error}",
                )
            except UnicodeDecodeError:
                continue
    return DecodedSample(
        raw.decode("utf-8", errors="replace"),
        "utf-8-replacement",
        "Unable to decode sample without replacement characters",
    )


def probable_language(text: str) -> str:
    """Estimate English/Urdu script from character counts."""

    if not text.strip():
        return "Unknown"
    urdu = sum(1 for char in text if "\u0600" <= char <= "\u06ff")
    english = sum(1 for char in text if char.isascii() and char.isalpha())
    meaningful = urdu + english
    if meaningful < 10:
        return "Unknown"
    urdu_ratio = urdu / meaningful
    if urdu_ratio >= 0.7:
        return "Urdu"
    if urdu_ratio >= 0.1:
        return "Urdu and English"
    return "English"


def _match_label(text: str, patterns: Iterable[tuple[str, tuple[str, ...]]]) -> str:
    lowered = text.lower()
    for label, needles in patterns:
        if any(needle in lowered for needle in needles):
            return label
    return "Unknown"


def probable_court(text: str) -> str:
    return _match_label(text, COURT_PATTERNS)


def probable_document_type(text: str) -> str:
    return _match_label(text, DOCUMENT_TYPE_PATTERNS)


def _text_structure(text: str, extension: str) -> dict[str, Any]:
    lines = text.splitlines()
    nonempty = [line for line in lines if line.strip()]
    structure: dict[str, Any] = {
        "kind": "markdown" if extension == ".md" else "plain_text",
        "sample_character_count": len(text),
        "sample_line_count": len(lines),
        "sample_nonempty_line_count": len(nonempty),
    }
    if extension == ".md":
        headings = [line.lstrip("# ").strip() for line in nonempty if line.startswith("#")]
        structure["heading_count_in_sample"] = len(headings)
        structure["heading_examples"] = headings[:5]
    return structure


def _json_structure(path: Path, decoded: DecodedSample, size: int) -> tuple[dict[str, Any], str | None]:
    if size > MAX_JSON_PARSE_BYTES:
        return (
            {
                "kind": "json",
                "top_level_type": "Not parsed",
                "note": f"File exceeds {MAX_JSON_PARSE_BYTES} byte safe parse limit; sampled only",
            },
            None,
        )
    try:
        with path.open("r", encoding=decoded.encoding, errors="strict") as handle:
            payload = json.load(handle)
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        return {"kind": "json", "top_level_type": "Invalid"}, str(exc)

    structure: dict[str, Any] = {"kind": "json", "top_level_type": type(payload).__name__}
    if isinstance(payload, dict):
        structure["keys"] = sorted(str(key) for key in payload.keys())[:50]
        structure["key_count"] = len(payload)
    elif isinstance(payload, list):
        structure["item_count"] = len(payload)
        if payload and isinstance(payload[0], dict):
            structure["first_item_keys"] = sorted(str(key) for key in payload[0].keys())[:50]
        elif payload:
            structure["first_item_type"] = type(payload[0]).__name__
    return structure, None


def _csv_structure(path: Path, decoded: DecodedSample) -> tuple[dict[str, Any], str | None]:
    structure: dict[str, Any] = {"kind": "csv"}
    try:
        sample = decoded.text[:65536]
        try:
            dialect = csv.Sniffer().sniff(sample, delimiters=",;\t|")
            delimiter = dialect.delimiter
        except csv.Error:
            delimiter = ","
        structure["delimiter"] = "\\t" if delimiter == "\t" else delimiter
        with path.open("r", encoding=decoded.encoding, errors="strict", newline="") as handle:
            reader = csv.reader(handle, delimiter=delimiter, strict=True)
            header = next(reader, [])
            structure["columns"] = header[:100]
            structure["column_count"] = len(header)
            sampled_rows = 0
            inconsistent_rows = 0
            for row in reader:
                sampled_rows += 1
                if header and len(row) != len(header):
                    inconsistent_rows += 1
                if sampled_rows >= 100:
                    break
            structure["rows_inspected"] = sampled_rows
            structure["inconsistent_rows_in_sample"] = inconsistent_rows
        if not header:
            return structure, "CSV contains no header or rows"
    except (OSError, UnicodeError, csv.Error) as exc:
        return structure, str(exc)
    return structure, None


def _unescape_pdf_literal(value: bytes) -> str:
    value = re.sub(rb"\\([()\\])", rb"\1", value)
    value = value.replace(b"\\n", b"\n").replace(b"\\r", b"\r").replace(b"\\t", b"\t")
    return value.decode("latin-1", errors="ignore")


def _pdf_structure(path: Path) -> tuple[dict[str, Any], str, str | None]:
    try:
        size = path.stat().st_size
        with path.open("rb") as handle:
            prefix = handle.read(min(size, 5_000_000))
            tail_size = min(size, 4096)
            handle.seek(max(0, size - tail_size))
            tail = handle.read(tail_size)
    except OSError as exc:
        return {"kind": "pdf"}, "", str(exc)

    structure: dict[str, Any] = {
        "kind": "pdf",
        "pdf_version": "Unknown",
        "estimated_page_count": len(re.findall(rb"/Type\s*/Page(?!s)\b", prefix)),
        "encrypted": b"/Encrypt" in prefix,
    }
    header = re.match(rb"%PDF-(\d\.\d)", prefix)
    if not header:
        return structure, "", "Missing PDF header"
    structure["pdf_version"] = header.group(1).decode("ascii", errors="replace")
    if b"%%EOF" not in tail:
        return structure, "", "Missing PDF EOF marker; file may be truncated"

    literals = re.findall(rb"\((.{2,500}?)\)\s*Tj", prefix, flags=re.DOTALL)
    extracted = " ".join(_unescape_pdf_literal(value) for value in literals[:300])
    extracted = re.sub(r"\s+", " ", extracted).strip()
    structure["extractable_text_detected"] = bool(extracted)
    structure["text_extraction"] = "basic PDF literal-string inspection (not OCR)"
    return structure, extracted[:100_000], None


def inspect_file(path: Path, input_root: Path) -> dict[str, Any]:
    """Inspect one supported file and return a JSON-serialisable record."""

    extension = path.suffix.lower()
    relative = path.relative_to(input_root)
    record: dict[str, Any] = {
        "path": _normalise_path(relative),
        "extension": extension,
        "size_bytes": 0,
        "encoding": None,
        "encoding_issue": None,
        "corrupted": False,
        "error": None,
        "sample_structure": {"kind": extension.lstrip(".")},
        "probable_language": "Unknown",
        "probable_court": "Unknown",
        "probable_document_type": "Unknown",
    }
    sample_text = ""
    try:
        record["size_bytes"] = path.stat().st_size
        if extension == ".pdf":
            structure, sample_text, error = _pdf_structure(path)
            record["sample_structure"] = structure
            if error:
                record["corrupted"] = True
                record["error"] = error
        else:
            decoded = decode_text_sample(path)
            record["encoding"] = decoded.encoding
            record["encoding_issue"] = decoded.issue
            sample_text = decoded.text
            if extension in {".txt", ".md"}:
                record["sample_structure"] = _text_structure(sample_text, extension)
            elif extension == ".json":
                structure, error = _json_structure(path, decoded, record["size_bytes"])
                record["sample_structure"] = structure
                if error:
                    record["corrupted"] = True
                    record["error"] = error
            elif extension == ".csv":
                structure, error = _csv_structure(path, decoded)
                record["sample_structure"] = structure
                if error:
                    record["corrupted"] = True
                    record["error"] = error
    except Exception as exc:  # Per-file resilience is an explicit auditor requirement.
        LOGGER.warning("Could not inspect %s: %s", path, exc)
        record["corrupted"] = True
        record["error"] = f"{type(exc).__name__}: {exc}"

    detection_text = f"{relative.as_posix()}\n{sample_text}"
    record["probable_language"] = probable_language(sample_text)
    record["probable_court"] = probable_court(detection_text)
    record["probable_document_type"] = probable_document_type(detection_text)
    record["_sample_text_available"] = bool(sample_text.strip())
    return record


def _dataset_identity(path: Path, input_root: Path) -> tuple[str, Path]:
    relative = path.relative_to(input_root)
    if len(relative.parts) > 1:
        return relative.parts[0], input_root / relative.parts[0]
    return path.stem, input_root


def _majority(values: Iterable[str]) -> str:
    known = [value for value in values if value != "Unknown"]
    if not known:
        return "Unknown"
    counts = Counter(known)
    top_count = counts.most_common(1)[0][1]
    tied = sorted(value for value, count in counts.items() if count == top_count)
    return tied[0]


def _structure_fields(files: Iterable[dict[str, Any]]) -> set[str]:
    fields: set[str] = set()
    for file_record in files:
        structure = file_record.get("sample_structure", {})
        for key in ("columns", "keys", "first_item_keys"):
            for value in structure.get(key, []):
                fields.add(str(value).strip().lower())
    return fields


def _recommendations(files: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    usable = [record for record in files if not record["corrupted"]]
    extensions = {record["extension"] for record in usable}
    document_types = {record["probable_document_type"] for record in usable}
    fields = _structure_fields(usable)
    has_outcome_field = bool(fields & OUTCOME_FIELD_TERMS)
    has_structured = bool(extensions & {".csv", ".json"})
    has_text = any(record.get("_sample_text_available") for record in usable)
    has_legal_material = bool(
        document_types
        & {
            "Judgment",
            "Court order",
            "Petition/pleading",
            "Legislation",
            "Contract/agreement",
            "Legal article/commentary",
        }
    )
    template_candidate = "Template/form" in document_types
    pdfs = [record for record in usable if record["extension"] == ".pdf"]
    ocr_candidate = bool(pdfs) and any(not record.get("_sample_text_available") for record in pdfs)
    all_unusable = not usable

    return {
        "RAG": {
            "recommended": bool(usable and has_text and (has_legal_material or extensions & TEXT_EXTENSIONS)),
            "reason": (
                "Contains readable legal/text material suitable for retrieval review."
                if usable and has_text and (has_legal_material or extensions & TEXT_EXTENSIONS)
                else "No readable text suitable for retrieval was detected."
            ),
        },
        "Classification": {
            "recommended": bool(has_structured and has_outcome_field),
            "reason": (
                "Structured data includes a probable label/outcome field; validate labels and leakage first."
                if has_structured and has_outcome_field
                else "No structured label/outcome field was detected."
            ),
        },
        "Prediction": {
            "recommended": bool(has_structured and has_outcome_field),
            "reason": (
                "Candidate for prediction only after target definition, leakage checks, and temporal evaluation."
                if has_structured and has_outcome_field
                else "No defensible prediction target was detected from sampled structure."
            ),
        },
        "Templates": {
            "recommended": template_candidate,
            "reason": "Template or form language was detected." if template_candidate else "No template/form structure was detected.",
        },
        "OCR": {
            "recommended": ocr_candidate,
            "reason": (
                "At least one valid PDF has no text detectable by basic inspection; test OCR separately."
                if ocr_candidate
                else "No likely image-only PDF was detected."
            ),
        },
        "Ignore": {
            "recommended": all_unusable,
            "reason": "All supported files are unreadable or corrupted." if all_unusable else "Usable files were found; do not ignore without review.",
        },
    }


def _display_folder(folder: Path, input_root: Path) -> str:
    try:
        return _normalise_path(folder.relative_to(input_root.parent.parent))
    except ValueError:
        return _normalise_path(folder)


def audit_datasets(input_root: Path) -> dict[str, Any]:
    """Audit all supported files below *input_root* without changing them."""

    input_root = input_root.resolve()
    warnings: list[str] = []
    grouped: dict[tuple[str, Path], list[Path]] = defaultdict(list)
    unsupported_files: list[str] = []

    if not input_root.exists():
        warning = f"Input directory does not exist: {input_root}"
        LOGGER.warning(warning)
        warnings.append(warning)
        candidates: list[Path] = []
    elif not input_root.is_dir():
        warning = f"Input path is not a directory: {input_root}"
        LOGGER.warning(warning)
        warnings.append(warning)
        candidates = []
    else:
        try:
            candidates = sorted(path for path in input_root.rglob("*") if path.is_file())
        except OSError as exc:
            warning = f"Could not scan input directory {input_root}: {exc}"
            LOGGER.warning(warning)
            warnings.append(warning)
            candidates = []

    for path in candidates:
        if path.suffix.lower() in SUPPORTED_EXTENSIONS:
            grouped[_dataset_identity(path, input_root)].append(path)
        else:
            unsupported_files.append(_normalise_path(path.relative_to(input_root)))

    datasets: list[dict[str, Any]] = []
    for (name, folder), paths in sorted(grouped.items(), key=lambda item: (item[0][0].lower(), str(item[0][1]))):
        records = [inspect_file(path, input_root) for path in paths]
        file_types = Counter(record["extension"] for record in records)
        corrupted = [
            {"path": record["path"], "error": record["error"]}
            for record in records
            if record["corrupted"]
        ]
        encoding_issues = [
            {
                "path": record["path"],
                "encoding": record["encoding"],
                "issue": record["encoding_issue"],
            }
            for record in records
            if record["encoding_issue"]
        ]
        recommendations = _recommendations(records)
        clean_records: list[dict[str, Any]] = []
        for record in records:
            clean_records.append({key: value for key, value in record.items() if not key.startswith("_")})
        datasets.append(
            {
                "dataset_name": name,
                "folder": _display_folder(folder, input_root),
                "file_count": len(records),
                "total_size_bytes": sum(record["size_bytes"] for record in records),
                "file_types": dict(sorted(file_types.items())),
                "sample_structure": [
                    {"path": record["path"], **record["sample_structure"]}
                    for record in records[:MAX_SAMPLE_FILES_PER_DATASET]
                ],
                "corrupted_files": corrupted,
                "encoding_issues": encoding_issues,
                "probable_language": _majority(record["probable_language"] for record in records),
                "probable_court": _majority(record["probable_court"] for record in records),
                "probable_document_type": _majority(record["probable_document_type"] for record in records),
                "recommendations": recommendations,
                "files": clean_records,
            }
        )

    report = {
        "schema_version": "1.0",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "input_directory": _normalise_path(input_root),
        "input_exists": input_root.is_dir(),
        "read_only_audit": True,
        "supported_extensions": sorted(SUPPORTED_EXTENSIONS),
        "summary": {
            "dataset_count": len(datasets),
            "file_count": sum(dataset["file_count"] for dataset in datasets),
            "total_size_bytes": sum(dataset["total_size_bytes"] for dataset in datasets),
            "corrupted_file_count": sum(len(dataset["corrupted_files"]) for dataset in datasets),
            "encoding_issue_count": sum(len(dataset["encoding_issues"]) for dataset in datasets),
            "unsupported_file_count": len(unsupported_files),
        },
        "warnings": warnings,
        "unsupported_files": unsupported_files,
        "datasets": datasets,
    }
    return report


def _human_size(size: int) -> str:
    value = float(size)
    for unit in ("B", "KiB", "MiB", "GiB", "TiB"):
        if value < 1024 or unit == "TiB":
            return f"{value:.1f} {unit}" if unit != "B" else f"{int(value)} B"
        value /= 1024
    return f"{size} B"


def render_markdown(report: dict[str, Any]) -> str:
    """Render a concise human-readable version of an audit report."""

    summary = report["summary"]
    lines = [
        "# WakuLAW Dataset Audit",
        "",
        f"Generated: `{report['generated_at']}`  ",
        f"Input: `{report['input_directory']}`  ",
        "Mode: **read-only inspection** (no cleaning, preprocessing, OCR, embeddings, moves, or source-file writes)",
        "",
        "## Summary",
        "",
        f"- Datasets: {summary['dataset_count']}",
        f"- Supported files: {summary['file_count']}",
        f"- Total size: {_human_size(summary['total_size_bytes'])}",
        f"- Corrupted/unreadable files: {summary['corrupted_file_count']}",
        f"- Encoding issues: {summary['encoding_issue_count']}",
        f"- Unsupported files skipped: {summary['unsupported_file_count']}",
        "",
    ]
    if report["warnings"]:
        lines.extend(["## Warnings", ""])
        lines.extend(f"- {warning}" for warning in report["warnings"])
        lines.append("")

    lines.extend(
        [
            "## Dataset Overview",
            "",
            "| Dataset | Folder | Files | Size | Types | Language | Court | Document type | Recommended uses |",
            "|---|---|---:|---:|---|---|---|---|---|",
        ]
    )
    if not report["datasets"]:
        lines.append("| _No supported datasets found_ | — | 0 | 0 B | — | — | — | — | — |")
    for dataset in report["datasets"]:
        types = ", ".join(f"{ext}: {count}" for ext, count in dataset["file_types"].items())
        uses = ", ".join(
            use for use, decision in dataset["recommendations"].items() if decision["recommended"]
        ) or "Manual review"
        row = [
            dataset["dataset_name"],
            f"`{dataset['folder']}`",
            str(dataset["file_count"]),
            _human_size(dataset["total_size_bytes"]),
            types,
            dataset["probable_language"],
            dataset["probable_court"],
            dataset["probable_document_type"],
            uses,
        ]
        lines.append("| " + " | ".join(value.replace("|", "\\|") for value in row) + " |")
    lines.append("")

    for dataset in report["datasets"]:
        lines.extend([f"## {dataset['dataset_name']}", ""])
        lines.append("### Suitability recommendations")
        lines.append("")
        for use, decision in dataset["recommendations"].items():
            marker = "Yes" if decision["recommended"] else "No"
            lines.append(f"- **{use}: {marker}.** {decision['reason']}")
        lines.append("")
        lines.append("### Sample structure")
        lines.append("")
        if dataset["sample_structure"]:
            lines.append("```json")
            lines.append(json.dumps(dataset["sample_structure"], ensure_ascii=False, indent=2))
            lines.append("```")
        else:
            lines.append("No sample structure available.")
        lines.append("")
        if dataset["corrupted_files"]:
            lines.extend(["### Corrupted or unreadable files", ""])
            for item in dataset["corrupted_files"]:
                lines.append(f"- `{item['path']}` — {item['error']}")
            lines.append("")
        if dataset["encoding_issues"]:
            lines.extend(["### Encoding issues", ""])
            for item in dataset["encoding_issues"]:
                lines.append(f"- `{item['path']}` — {item['issue']}")
            lines.append("")

    lines.extend(
        [
            "## Interpretation limits",
            "",
            "- Language, court, and document type are heuristic estimates based on file paths and bounded text samples.",
            "- PDF inspection validates basic structure and looks for simple text literals; it does not perform OCR.",
            "- Classification and prediction recommendations do not approve a target. Labels, leakage, licensing, and temporal splits still require human review.",
            "- Unsupported formats are listed in the JSON report but are not parsed.",
            "",
        ]
    )
    return "\n".join(lines)


def write_report(report: dict[str, Any], json_output: Path, markdown_output: Path) -> None:
    json_output.parent.mkdir(parents=True, exist_ok=True)
    markdown_output.parent.mkdir(parents=True, exist_ok=True)
    json_output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    markdown_output.write_text(render_markdown(report), encoding="utf-8")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Audit WakuLAW datasets without modifying source files.")
    parser.add_argument("--input", type=Path, default=Path("datasets/raw"), help="Raw dataset directory")
    parser.add_argument(
        "--json-output",
        type=Path,
        default=Path("datasets/metadata/dataset_audit.json"),
        help="Machine-readable report path",
    )
    parser.add_argument(
        "--markdown-output",
        type=Path,
        default=Path("docs/DATASET_AUDIT.md"),
        help="Human-readable report path",
    )
    parser.add_argument(
        "--log-level",
        choices=("DEBUG", "INFO", "WARNING", "ERROR"),
        default="INFO",
        help="Logging verbosity",
    )
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    logging.basicConfig(
        level=getattr(logging, args.log_level),
        format="%(levelname)s %(name)s: %(message)s",
    )
    LOGGER.info("Auditing datasets under %s", args.input)
    try:
        report = audit_datasets(args.input)
        write_report(report, args.json_output, args.markdown_output)
    except OSError as exc:
        LOGGER.error("Could not write audit outputs: %s", exc)
        return 1
    LOGGER.info(
        "Audit complete: %d datasets, %d files, %d corrupted/unreadable",
        report["summary"]["dataset_count"],
        report["summary"]["file_count"],
        report["summary"]["corrupted_file_count"],
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
