"""Streaming, read-only loaders for WakuLAW's raw legal datasets.

The module writes one :class:`LegalDocument` per JSONL line. It never writes
inside the raw-data tree and deliberately performs no OCR, embeddings, text
cleaning, or model training.
"""

from __future__ import annotations

import hashlib
import json
import logging
import os
import re
from collections import Counter, defaultdict
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable, Iterator, Sequence

from .models import LegalDocument


LOGGER = logging.getLogger("wakulaw.dataset_loader")
READ_CHUNK_SIZE = 64 * 1024
SUPPORTED_DATASETS = ("laws", "judgments", "labeled_cases", "templates")

COURT_PATTERNS: tuple[tuple[str, tuple[str, ...]], ...] = (
    ("Supreme Court of Pakistan", ("supreme court of pakistan", "supreme court", "_supreme")),
    ("Federal Shariat Court", ("federal shariat court",)),
    ("Lahore High Court", ("lahore high court",)),
    ("Sindh High Court", ("sindh high court",)),
    ("Islamabad High Court", ("islamabad high court",)),
    ("Peshawar High Court", ("peshawar high court",)),
    ("Balochistan High Court", ("balochistan high court",)),
    ("District and Sessions Court", ("district and sessions", "sessions court", "district court")),
)

CATEGORY_PATTERNS: tuple[tuple[str, tuple[str, ...]], ...] = (
    ("Constitutional Cases", ("constitution petition", "constitutional petition", "original jurisdiction")),
    ("Civil Appeals", ("civil appeal", "civil petition")),
    ("Criminal Appeals", ("criminal appeal", "criminal petition", "jail petition")),
    ("Bail Cases", ("bail application", "post-arrest bail", "pre-arrest bail")),
    ("Tax Cases", ("tax appeal", "income tax", "sales tax")),
    ("Service Cases", ("service appeal", "service tribunal")),
    ("Family Cases", ("family court", "guardians and wards")),
)

CASE_NUMBER_PATTERN = re.compile(
    r"\b((?:civil|criminal|constitution(?:al)?|jail|review|writ|human rights|c\.?\s*a\.?)"
    r"\s+(?:appeal|petition|application|reference|no\.?)?\s*(?:no\.?\s*)?"
    r"[\d\s,&-]+(?:/|of\s+)\d{2,4})\b",
    flags=re.IGNORECASE,
)
DATE_PATTERNS = (
    re.compile(r"\b([0-3]?\d)[./-]([01]?\d)[./-]((?:19|20)\d{2})\b"),
    re.compile(
        r"\b([0-3]?\d)(?:st|nd|rd|th)?\s+"
        r"(January|February|March|April|May|June|July|August|September|October|November|December)"
        r"[,]?\s+((?:19|20)\d{2})\b",
        flags=re.IGNORECASE,
    ),
)


@dataclass(frozen=True)
class RawSnapshot:
    """Metadata-only fingerprint used to prove the raw tree was not changed."""

    file_count: int
    total_bytes: int
    metadata_sha256: str

    def to_dict(self) -> dict[str, Any]:
        return {
            "file_count": self.file_count,
            "total_bytes": self.total_bytes,
            "metadata_sha256": self.metadata_sha256,
        }


@dataclass
class LoadSummary:
    """Streaming load statistics and report material."""

    input_root: str
    output_path: str
    started_at: str
    completed_at: str | None = None
    total_documents: int = 0
    documents_by_dataset: Counter[str] = field(default_factory=Counter)
    documents_by_type: Counter[str] = field(default_factory=Counter)
    languages: Counter[str] = field(default_factory=Counter)
    case_categories: Counter[str] = field(default_factory=Counter)
    extraction_statuses: Counter[str] = field(default_factory=Counter)
    warning_counts: Counter[str] = field(default_factory=Counter)
    empty_documents: int = 0
    failed_documents: int = 0
    duplicate_groups: dict[str, list[str]] = field(default_factory=dict)
    sample_records: list[dict[str, Any]] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    raw_before: RawSnapshot | None = None
    raw_after: RawSnapshot | None = None
    raw_changed: bool = False

    def to_dict(self) -> dict[str, Any]:
        return {
            "input_root": self.input_root,
            "output_path": self.output_path,
            "started_at": self.started_at,
            "completed_at": self.completed_at,
            "total_documents": self.total_documents,
            "documents_by_dataset": dict(sorted(self.documents_by_dataset.items())),
            "documents_by_type": dict(sorted(self.documents_by_type.items())),
            "languages": dict(sorted(self.languages.items())),
            "case_categories": dict(sorted(self.case_categories.items())),
            "extraction_statuses": dict(sorted(self.extraction_statuses.items())),
            "warning_counts": dict(sorted(self.warning_counts.items())),
            "empty_documents": self.empty_documents,
            "failed_documents": self.failed_documents,
            "duplicate_group_count": len(self.duplicate_groups),
            "duplicate_groups": self.duplicate_groups,
            "sample_records": self.sample_records,
            "warnings": self.warnings,
            "raw_before": self.raw_before.to_dict() if self.raw_before else None,
            "raw_after": self.raw_after.to_dict() if self.raw_after else None,
            "raw_changed": self.raw_changed,
        }


def stable_document_id(source_dataset: str, source_path: str) -> str:
    """Create a deterministic ID from the traceable logical source path."""

    key = f"wakulaw:v1\0{source_dataset}\0{source_path}".encode("utf-8")
    return f"wl_{hashlib.sha256(key).hexdigest()[:32]}"


def text_sha256(text: str) -> str | None:
    """Hash exact decoded text for probable-duplicate detection."""

    if not text:
        return None
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def _iter_files(root: Path, suffixes: set[str]) -> Iterator[Path]:
    """Yield files deterministically without materialising the corpus."""

    if not root.is_dir():
        return
    for directory, child_directories, file_names in os.walk(root):
        child_directories.sort(key=str.casefold)
        file_names.sort(key=str.casefold)
        for file_name in file_names:
            path = Path(directory) / file_name
            if path.suffix.lower() in suffixes:
                yield path


def snapshot_raw_tree(input_root: Path) -> RawSnapshot:
    """Fingerprint raw file paths, sizes, and mtimes without reading contents."""

    digest = hashlib.sha256()
    file_count = 0
    total_bytes = 0
    for path in _iter_files(input_root, {suffix.lower() for suffix in _all_suffixes(input_root)}):
        try:
            stat = path.stat()
        except OSError as exc:
            LOGGER.warning("Could not stat raw file %s for fingerprint: %s", path, exc)
            continue
        relative = path.relative_to(input_root).as_posix()
        digest.update(f"{relative}|{stat.st_size}|{stat.st_mtime_ns}\n".encode("utf-8"))
        file_count += 1
        total_bytes += stat.st_size
    return RawSnapshot(file_count=file_count, total_bytes=total_bytes, metadata_sha256=digest.hexdigest())


def _all_suffixes(root: Path) -> Iterator[str]:
    """Yield suffixes plus a sentinel so extensionless files are fingerprinted."""

    yield ""
    if not root.is_dir():
        return
    for directory, _, file_names in os.walk(root):
        for file_name in file_names:
            yield (Path(directory) / file_name).suffix


def _relative(path: Path, input_root: Path) -> str:
    return path.relative_to(input_root).as_posix()


def _decode_text_file(path: Path) -> tuple[str, str, list[str]]:
    warnings: list[str] = []
    encodings = ("utf-8-sig", "cp1252", "latin-1")
    last_error: UnicodeError | None = None
    for encoding in encodings:
        try:
            with path.open("r", encoding=encoding, errors="strict", newline="") as handle:
                text = handle.read()
            if encoding not in {"utf-8", "utf-8-sig"}:
                warnings.append(f"Source text was decoded as {encoding}, not UTF-8")
            return text, encoding, warnings
        except UnicodeError as exc:
            last_error = exc
    raise UnicodeError(f"Could not decode {path}: {last_error}")


def probable_language(text: str) -> str:
    if not text.strip():
        return "Unknown"
    urdu = sum(1 for character in text if "\u0600" <= character <= "\u06ff")
    english = sum(1 for character in text if character.isascii() and character.isalpha())
    total = urdu + english
    if total < 10:
        return "Unknown"
    ratio = urdu / total
    if ratio >= 0.7:
        return "Urdu"
    if ratio >= 0.1:
        return "Urdu and English"
    return "English"


def infer_court(path_text: str, text: str) -> str | None:
    sample = f"{path_text}\n{text[:100_000]}".lower()
    for court, needles in COURT_PATTERNS:
        if any(needle in sample for needle in needles):
            return court
    return None


def _humanise(value: str) -> str:
    value = re.sub(r"[_-]+", " ", value)
    value = re.sub(r"\s+", " ", value).strip()
    return value.title()


def infer_case_category(path: Path, dataset_root: Path, text: str, labeled: bool) -> tuple[str | None, str]:
    if labeled:
        parent = path.parent.name.strip()
        if parent and parent.lower() not in {"labeled data", "labeled_cases", "labeled cases"}:
            return _humanise(parent), "parent_folder_candidate"

    try:
        relative_parts = path.relative_to(dataset_root).parts[:-1]
    except ValueError:
        relative_parts = path.parts[:-1]
    for part in reversed(relative_parts):
        lowered = part.lower()
        if "constitutional" in lowered:
            return "Constitutional Cases", "folder_inference"
        for category, needles in CATEGORY_PATTERNS:
            if any(needle.replace(" ", "_") in lowered or needle in lowered for needle in needles):
                return category, "folder_inference"

    sample = text[:120_000].lower()
    for category, needles in CATEGORY_PATTERNS:
        if any(needle in sample for needle in needles):
            return category, "content_inference"
    return None, "not_inferred"


def infer_case_number(text: str) -> str | None:
    match = CASE_NUMBER_PATTERN.search(text[:100_000])
    return re.sub(r"\s+", " ", match.group(1)).strip() if match else None


def infer_judge_names(text: str) -> list[str]:
    names: list[str] = []
    seen: set[str] = set()
    for line in text[:100_000].splitlines():
        cleaned = re.sub(r"\s+", " ", line).strip(" ,:;-\t")
        if not re.search(r"\b(?:mr\.?|mrs\.?)?\s*(?:chief\s+)?justice\b", cleaned, re.IGNORECASE):
            continue
        cleaned = re.sub(
            r"^(?:hon(?:ou)?rable\s+)?(?:mr\.?|mrs\.?)?\s*(?:chief\s+)?justice\s+",
            "",
            cleaned,
            flags=re.IGNORECASE,
        )
        cleaned = re.sub(r",?\s*(?:hcj|cj|j)\.?$", "", cleaned, flags=re.IGNORECASE).strip()
        if 2 <= len(cleaned) <= 120 and cleaned.casefold() not in seen:
            seen.add(cleaned.casefold())
            names.append(cleaned)
        if len(names) >= 25:
            break
    return names


def infer_decision_date(text: str) -> str | None:
    sample = text[:150_000]
    for pattern in DATE_PATTERNS:
        match = pattern.search(sample)
        if not match:
            continue
        if pattern is DATE_PATTERNS[0]:
            day, month, year = match.groups()
            return f"{int(year):04d}-{int(month):02d}-{int(day):02d}"
        day, month_name, year = match.groups()
        try:
            parsed = datetime.strptime(f"{day} {month_name} {year}", "%d %B %Y")
        except ValueError:
            continue
        return parsed.date().isoformat()
    return None


def infer_page_count_from_text(text: str) -> int | None:
    totals = [int(value) for value in re.findall(r"\bPage\s+\d+\s+of\s+(\d+)\b", text, re.IGNORECASE)]
    return max(totals) if totals else None


def _title_from_text(text: str, fallback: str) -> str:
    for line in text[:30_000].splitlines():
        candidate = re.sub(r"\s+", " ", line).strip(" -\t")
        if not candidate or len(candidate) > 240:
            continue
        if re.fullmatch(r"Page\s+\d+(?:\s+of\s+\d+)?", candidate, re.IGNORECASE):
            continue
        if candidate.upper() in {"CONTENTS", "SECTIONS:", "PRESENT:", "PRESENT :"}:
            continue
        return candidate
    return _humanise(Path(fallback).stem)


def _file_sha256_and_pdf_metadata(path: Path) -> tuple[str, int | None, bool, str | None]:
    digest = hashlib.sha256()
    page_count = 0
    header = b""
    tail = b""
    overlap = b""
    with path.open("rb") as handle:
        while True:
            chunk = handle.read(1024 * 1024)
            if not chunk:
                break
            digest.update(chunk)
            if not header:
                header = chunk[:16]
            combined = overlap + chunk
            page_count += sum(
                1
                for match in re.finditer(rb"/Type\s*/Page(?!s)\b", combined)
                if match.end() > len(overlap)
            )
            overlap = combined[-32:]
            tail = (tail + chunk)[-4096:]
    valid = header.startswith(b"%PDF-") and b"%%EOF" in tail
    version_match = re.match(rb"%PDF-(\d\.\d)", header)
    version = version_match.group(1).decode("ascii") if version_match else None
    return digest.hexdigest(), page_count or None, valid, version


def iter_json_array(path: Path) -> Iterator[Any]:
    """Incrementally decode a top-level JSON array, one entry at a time."""

    decoder = json.JSONDecoder()
    buffer = ""
    position = 0
    started = False
    eof = False
    with path.open("r", encoding="utf-8-sig", errors="strict") as handle:
        while True:
            if not eof:
                chunk = handle.read(READ_CHUNK_SIZE)
                if chunk:
                    buffer += chunk
                else:
                    eof = True

            while True:
                while position < len(buffer) and buffer[position].isspace():
                    position += 1
                if not started:
                    if position >= len(buffer):
                        break
                    if buffer[position] != "[":
                        raise ValueError("Pakistan Laws JSON must contain a top-level array")
                    position += 1
                    started = True
                    continue

                while position < len(buffer) and (buffer[position].isspace() or buffer[position] == ","):
                    position += 1
                if position < len(buffer) and buffer[position] == "]":
                    return
                if position >= len(buffer):
                    break
                try:
                    entry, end = decoder.raw_decode(buffer, position)
                except json.JSONDecodeError as exc:
                    if eof:
                        raise ValueError(f"Malformed JSON near character {exc.pos}: {exc.msg}") from exc
                    break
                yield entry
                position = end

            if position:
                buffer = buffer[position:]
                position = 0
            if eof:
                if not started:
                    raise ValueError("Pakistan Laws JSON is empty")
                if buffer.strip():
                    raise ValueError("Malformed or incomplete Pakistan Laws JSON array")
                raise ValueError("Pakistan Laws JSON array is missing its closing bracket")


def _failed_document(
    source_dataset: str,
    source_path: str,
    source_file_name: str,
    source_file_type: str,
    document_type: str,
    error: Exception | str,
) -> LegalDocument:
    message = str(error)
    return LegalDocument(
        document_id=stable_document_id(source_dataset, source_path),
        source_dataset=source_dataset,
        source_path=source_path,
        source_file_name=source_file_name,
        source_file_type=source_file_type,
        document_type=document_type,
        title=_humanise(Path(source_file_name).stem),
        text="",
        extraction_status="failed",
        warnings=[f"Load failed: {message}"],
        metadata={"load_error": message},
    )


def iter_law_documents(input_root: Path) -> Iterator[LegalDocument]:
    dataset_root = input_root / "laws"
    if not dataset_root.is_dir():
        return
    for path in _iter_files(dataset_root, {".json"}):
        container_path = _relative(path, input_root)
        try:
            for index, entry in enumerate(iter_json_array(path)):
                logical_path = f"{container_path}#entry={index}"
                if not isinstance(entry, dict):
                    yield _failed_document(
                        "laws", logical_path, path.name, ".json", "law", "JSON entry is not an object"
                    )
                    continue
                original_file_name = str(entry.get("file_name") or entry.get("filename") or f"law-{index}.json")
                raw_text = entry.get("text")
                if raw_text in (None, ""):
                    raw_text = entry.get("content", "")
                text = raw_text if isinstance(raw_text, str) else str(raw_text or "")
                warnings: list[str] = []
                if not text:
                    warnings.append("Law entry has no non-empty 'text' or 'content' field")
                content_hash = text_sha256(text)
                source_fields = {key: value for key, value in entry.items() if key not in {"text", "content"}}
                metadata: dict[str, Any] = {
                    "container_source_path": container_path,
                    "container_file_name": path.name,
                    "source_entry_index": index,
                    "source_fields": source_fields,
                }
                if content_hash:
                    metadata["content_sha256"] = content_hash
                yield LegalDocument(
                    document_id=stable_document_id("laws", logical_path),
                    source_dataset="laws",
                    source_path=logical_path,
                    source_file_name=original_file_name,
                    source_file_type=Path(original_file_name).suffix or ".json",
                    document_type="law",
                    court=None,
                    jurisdiction="Pakistan",
                    title=str(entry.get("title") or entry.get("name") or _title_from_text(text, original_file_name)),
                    language=probable_language(text),
                    text=text,
                    page_count=infer_page_count_from_text(text),
                    visibility="public",
                    training_consent=False,
                    metadata=metadata,
                    extraction_status="extracted" if text else "empty",
                    warnings=warnings,
                )
        except Exception as exc:
            LOGGER.error("Failed while streaming Pakistan Laws file %s: %s", path, exc)
            failure_path = f"{container_path}#load_error"
            yield _failed_document("laws", failure_path, path.name, ".json", "law", exc)


def _txt_document(path: Path, input_root: Path, source_dataset: str, labeled: bool) -> LegalDocument:
    source_path = _relative(path, input_root)
    try:
        text, encoding, warnings = _decode_text_file(path)
    except Exception as exc:
        return _failed_document(source_dataset, source_path, path.name, ".txt", "judgment", exc)

    if not text:
        warnings.append("TXT source is empty")
    category, category_source = infer_case_category(
        path, input_root / source_dataset, text, labeled=labeled
    )
    content_hash = text_sha256(text)
    metadata: dict[str, Any] = {
        "encoding": encoding,
        "category_source": category_source,
        "candidate_category_only": bool(labeled and category),
        "outcome_label": None,
    }
    if labeled:
        metadata["original_parent_category"] = path.parent.name
        metadata["label_interpretation"] = "Parent folder is a case-category candidate, not an outcome label"
    if content_hash:
        metadata["content_sha256"] = content_hash
    return LegalDocument(
        document_id=stable_document_id(source_dataset, source_path),
        source_dataset=source_dataset,
        source_path=source_path,
        source_file_name=path.name,
        source_file_type=".txt",
        document_type="judgment",
        court=infer_court(source_path, text),
        jurisdiction="Pakistan",
        case_category=category,
        title=_humanise(path.stem),
        case_number=infer_case_number(text),
        judge_names=infer_judge_names(text),
        decision_date=infer_decision_date(text),
        language=probable_language(text),
        text=text,
        page_count=infer_page_count_from_text(text),
        visibility="public",
        training_consent=False,
        metadata=metadata,
        extraction_status="extracted" if text else "empty",
        warnings=warnings,
    )


def _pdf_document(path: Path, input_root: Path, source_dataset: str, document_type: str) -> LegalDocument:
    source_path = _relative(path, input_root)
    try:
        source_hash, page_count, valid_pdf, version = _file_sha256_and_pdf_metadata(path)
    except Exception as exc:
        return _failed_document(source_dataset, source_path, path.name, ".pdf", document_type, exc)
    if not valid_pdf:
        return _failed_document(
            source_dataset, source_path, path.name, ".pdf", document_type, "Invalid or truncated PDF"
        )
    warnings = ["PDF registered without text extraction; OCR is pending"]
    category, category_source = infer_case_category(
        path, input_root / source_dataset, "", labeled=False
    )
    metadata = {
        "source_sha256": source_hash,
        "pdf_version": version,
        "category_source": category_source,
        "text_extraction_attempted": False,
        "ocr_performed": False,
    }
    return LegalDocument(
        document_id=stable_document_id(source_dataset, source_path),
        source_dataset=source_dataset,
        source_path=source_path,
        source_file_name=path.name,
        source_file_type=".pdf",
        document_type=document_type,
        court=infer_court(source_path, "") if document_type == "judgment" else None,
        jurisdiction="Pakistan",
        case_category=category,
        title=_humanise(path.stem),
        language="Unknown",
        text="",
        page_count=page_count,
        visibility="public",
        training_consent=False,
        metadata=metadata,
        extraction_status="pending_ocr",
        warnings=warnings,
    )


def iter_judgment_documents(input_root: Path, source_dataset: str, labeled: bool) -> Iterator[LegalDocument]:
    dataset_root = input_root / source_dataset
    if not dataset_root.is_dir():
        return
    for path in _iter_files(dataset_root, {".txt"}):
        yield _txt_document(path, input_root, source_dataset, labeled=labeled)
    if not labeled:
        for path in _iter_files(dataset_root, {".pdf"}):
            yield _pdf_document(path, input_root, source_dataset, "judgment")


def iter_template_documents(input_root: Path) -> Iterator[LegalDocument]:
    dataset_root = input_root / "templates"
    if not dataset_root.is_dir():
        return
    for path in _iter_files(dataset_root, {".pdf"}):
        yield _pdf_document(path, input_root, "templates", "template")


def iter_documents(input_root: Path, datasets: Sequence[str]) -> Iterator[LegalDocument]:
    for dataset in datasets:
        if dataset == "laws":
            yield from iter_law_documents(input_root)
        elif dataset == "judgments":
            yield from iter_judgment_documents(input_root, "judgments", labeled=False)
        elif dataset == "labeled_cases":
            yield from iter_judgment_documents(input_root, "labeled_cases", labeled=True)
        elif dataset == "templates":
            yield from iter_template_documents(input_root)


def _sample_record(document: LegalDocument, preview_length: int = 500) -> dict[str, Any]:
    sample = document.to_dict()
    sample["text"] = document.text[:preview_length]
    sample["text_truncated"] = len(document.text) > preview_length
    return sample


def _record_statistics(summary: LoadSummary, document: LegalDocument) -> None:
    summary.total_documents += 1
    summary.documents_by_dataset[document.source_dataset] += 1
    summary.documents_by_type[document.document_type] += 1
    summary.languages[document.language] += 1
    summary.extraction_statuses[document.extraction_status] += 1
    if document.case_category:
        summary.case_categories[document.case_category] += 1
    if not document.text:
        summary.empty_documents += 1
    if document.extraction_status == "failed":
        summary.failed_documents += 1
    for warning in document.warnings:
        summary.warning_counts[warning] += 1
    if len(summary.sample_records) < 3:
        summary.sample_records.append(_sample_record(document))


def load_datasets(
    input_root: Path,
    output_path: Path,
    *,
    limit: int | None = None,
    datasets: Sequence[str] | None = None,
    overwrite: bool = False,
    report_path: Path | None = None,
) -> LoadSummary:
    """Stream selected datasets into a unified JSONL manifest.

    The only writes are the output manifest, an optional Markdown report, and a
    temporary manifest beside the final output during atomic generation.
    """

    input_root = input_root.resolve()
    output_path = output_path.resolve()
    if not input_root.is_dir():
        raise FileNotFoundError(f"Raw dataset directory does not exist: {input_root}")
    try:
        output_path.relative_to(input_root)
    except ValueError:
        pass
    else:
        raise ValueError("Output path must not be inside datasets/raw")
    if limit is not None and limit < 0:
        raise ValueError("--limit must be zero or greater")
    if output_path.exists() and not overwrite:
        raise FileExistsError(f"Output exists; pass --overwrite to replace it: {output_path}")

    selected = list(dict.fromkeys(datasets or SUPPORTED_DATASETS))
    unknown = [dataset for dataset in selected if dataset not in SUPPORTED_DATASETS]
    if unknown:
        raise ValueError(f"Unknown dataset(s): {', '.join(unknown)}")

    summary = LoadSummary(
        input_root=input_root.as_posix(),
        output_path=output_path.as_posix(),
        started_at=datetime.now(timezone.utc).isoformat(),
    )
    summary.raw_before = snapshot_raw_tree(input_root)
    for dataset in selected:
        if not (input_root / dataset).is_dir():
            summary.warnings.append(f"Dataset directory is missing and was skipped: {dataset}")

    output_path.parent.mkdir(parents=True, exist_ok=True)
    temporary_path = output_path.with_name(f".{output_path.name}.tmp")
    hash_to_ids: dict[str, list[str]] = defaultdict(list)
    first_id_by_hash: dict[str, str] = {}

    try:
        with temporary_path.open("w", encoding="utf-8", newline="\n") as output:
            for document in iter_documents(input_root, selected):
                if limit is not None and summary.total_documents >= limit:
                    break
                duplicate_hash = document.metadata.get("content_sha256") or document.metadata.get("source_sha256")
                if duplicate_hash:
                    first_id = first_id_by_hash.get(str(duplicate_hash))
                    if first_id:
                        document.metadata["probable_duplicate_of"] = first_id
                    else:
                        first_id_by_hash[str(duplicate_hash)] = document.document_id
                    hash_to_ids[str(duplicate_hash)].append(document.document_id)
                output.write(json.dumps(document.to_dict(), ensure_ascii=False, separators=(",", ":")))
                output.write("\n")
                _record_statistics(summary, document)
        os.replace(temporary_path, output_path)
    except Exception:
        try:
            temporary_path.unlink(missing_ok=True)
        except OSError:
            LOGGER.warning("Could not remove incomplete temporary manifest %s", temporary_path)
        raise

    summary.duplicate_groups = {
        digest: document_ids for digest, document_ids in sorted(hash_to_ids.items()) if len(document_ids) > 1
    }
    summary.raw_after = snapshot_raw_tree(input_root)
    summary.raw_changed = summary.raw_before != summary.raw_after
    if summary.raw_changed:
        summary.warnings.append("Raw dataset metadata changed during the loader run")
    summary.completed_at = datetime.now(timezone.utc).isoformat()
    if report_path is not None:
        write_loader_report(summary, report_path)
    return summary


def _human_size(size: int) -> str:
    value = float(size)
    for unit in ("B", "KiB", "MiB", "GiB"):
        if value < 1024 or unit == "GiB":
            return f"{int(value)} B" if unit == "B" else f"{value:.1f} {unit}"
        value /= 1024
    return f"{size} B"


def render_loader_report(summary: LoadSummary) -> str:
    completed = summary.completed_at or "incomplete"
    lines = [
        "# WakuLAW Unified Dataset Loader Report",
        "",
        f"Started: `{summary.started_at}`  ",
        f"Completed: `{completed}`  ",
        f"Input: `{summary.input_root}`  ",
        f"Output: `{summary.output_path}`  ",
        "Mode: **read-only source loading** (no OCR, embeddings, preprocessing, or model training)",
        "",
        "## Summary",
        "",
        f"- Total documents: {summary.total_documents}",
        f"- Empty-text documents: {summary.empty_documents}",
        f"- Failed documents: {summary.failed_documents}",
        f"- Probable duplicate hash groups: {len(summary.duplicate_groups)}",
        f"- Raw data changed: {'YES' if summary.raw_changed else 'No'}",
    ]
    if summary.raw_before:
        lines.extend(
            [
                f"- Raw files fingerprinted: {summary.raw_before.file_count}",
                f"- Raw size: {_human_size(summary.raw_before.total_bytes)}",
                f"- Raw metadata SHA-256: `{summary.raw_before.metadata_sha256}`",
            ]
        )
    lines.extend(["", "## Documents by dataset", "", "| Dataset | Documents |", "|---|---:|"])
    for name, count in sorted(summary.documents_by_dataset.items()):
        lines.append(f"| {name} | {count} |")
    lines.extend(["", "## Documents by type", "", "| Type | Documents |", "|---|---:|"])
    for name, count in sorted(summary.documents_by_type.items()):
        lines.append(f"| {name} | {count} |")
    lines.extend(["", "## Extraction status", "", "| Status | Documents |", "|---|---:|"])
    for name, count in sorted(summary.extraction_statuses.items()):
        lines.append(f"| {name} | {count} |")
    lines.extend(["", "## Languages detected", "", "| Language | Documents |", "|---|---:|"])
    for name, count in sorted(summary.languages.items()):
        lines.append(f"| {name} | {count} |")
    lines.extend(["", "## Case-category distribution", "", "| Candidate category | Documents |", "|---|---:|"])
    if summary.case_categories:
        for name, count in summary.case_categories.most_common():
            escaped_name = name.replace("|", "\\|")
            lines.append(f"| {escaped_name} | {count} |")
    else:
        lines.append("| _No category inferred_ | 0 |")

    lines.extend(["", "## Probable duplicate hash groups", ""])
    if not summary.duplicate_groups:
        lines.append("No duplicate hash groups detected.")
    else:
        max_groups = 100
        lines.append(f"Detected {len(summary.duplicate_groups)} groups. Showing up to {max_groups}:")
        lines.append("")
        for digest, document_ids in list(summary.duplicate_groups.items())[:max_groups]:
            lines.append(f"- `{digest}` — {len(document_ids)} documents: " + ", ".join(f"`{item}`" for item in document_ids[:8]))
        if len(summary.duplicate_groups) > max_groups:
            lines.append(f"- _{len(summary.duplicate_groups) - max_groups} additional groups omitted from this Markdown view._")

    lines.extend(["", "## Sample unified records", "", "Text is truncated only in this report; the JSONL manifest retains full text.", "", "```json"])
    lines.append(json.dumps(summary.sample_records, ensure_ascii=False, indent=2))
    lines.extend(["```", "", "## Warnings", ""])
    if summary.warning_counts:
        for warning, count in summary.warning_counts.most_common():
            lines.append(f"- {warning} — {count} document(s)")
    if summary.warnings:
        lines.extend(f"- {warning}" for warning in summary.warnings)
    if not summary.warning_counts and not summary.warnings:
        lines.append("No warnings recorded.")
    lines.extend(
        [
            "",
            "## Interpretation notes",
            "",
            "- Parent folders in `labeled_cases` are candidate case categories, never outcome labels.",
            "- Duplicate hashes identify probable exact duplicates; no record was deleted or merged.",
            "- PDFs are registered for traceability and marked `pending_ocr`; their text remains empty.",
            "- `training_consent` defaults to `false` because this loader does not establish dataset licensing or consent for model training.",
            "",
        ]
    )
    return "\n".join(lines)


def write_loader_report(summary: LoadSummary, report_path: Path) -> None:
    report_path = report_path.resolve()
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(render_loader_report(summary), encoding="utf-8")
