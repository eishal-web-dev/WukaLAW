"""Unified, dependency-free document models for WakuLAW datasets."""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any


@dataclass
class LegalDocument:
    """One traceable legal document in WakuLAW's processed manifest.

    ``source_path`` is always relative to the configured raw-data root. JSON
    entries append a fragment identifying the entry inside the container file.
    Raw source files are never changed by this model or its loader.
    """

    document_id: str
    source_dataset: str
    source_path: str
    source_file_name: str
    source_file_type: str
    document_type: str
    court: str | None = None
    jurisdiction: str = "Pakistan"
    case_category: str | None = None
    title: str | None = None
    case_number: str | None = None
    judge_names: list[str] = field(default_factory=list)
    decision_date: str | None = None
    language: str = "Unknown"
    text: str = ""
    text_length: int = 0
    page_count: int | None = None
    visibility: str = "public"
    training_consent: bool = False
    metadata: dict[str, Any] = field(default_factory=dict)
    extraction_status: str = "extracted"
    warnings: list[str] = field(default_factory=list)

    def __post_init__(self) -> None:
        self.source_file_type = self.source_file_type.lower()
        if self.source_file_type and not self.source_file_type.startswith("."):
            self.source_file_type = f".{self.source_file_type}"
        self.text_length = len(self.text)
        self.judge_names = list(self.judge_names)
        self.metadata = dict(self.metadata)
        self.warnings = list(self.warnings)

    def to_dict(self) -> dict[str, Any]:
        """Return a JSON-serialisable record with a stable field layout."""

        return asdict(self)

