"""Unified retrieval-ready chunk model."""
from __future__ import annotations
from dataclasses import asdict, dataclass, field
from typing import Any
@dataclass
class LegalChunk:
    chunk_id: str; document_id: str; parent_document_id: str; source_dataset: str
    source_path: str; source_file_name: str; document_type: str; court: str | None
    jurisdiction: str | None; case_category: str | None; case_number: str | None
    title: str | None; language: str | None; chunk_index: int; total_chunks: int
    chunk_type: str; heading: str | None; section_number: str | None; article_number: str | None
    paragraph_start: int; paragraph_end: int; character_start: int; character_end: int
    text: str; character_count: int; estimated_token_count: int; overlap_from_previous: int
    legal_citations: list[str] = field(default_factory=list); laws_cited: list[str] = field(default_factory=list)
    sections_cited: list[str] = field(default_factory=list); articles_cited: list[str] = field(default_factory=list)
    explicit_outcome_phrase: str | None = None; duplicate_hash: str = ""
    metadata: dict[str, Any] = field(default_factory=dict); warnings: list[str] = field(default_factory=list)
    pipeline_version: str = "task-004-v1"; created_at: str = ""
    def to_dict(self) -> dict[str, Any]: return asdict(self)
