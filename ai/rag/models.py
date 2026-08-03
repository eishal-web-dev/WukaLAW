"""Typed contracts for grounded RAG orchestration."""
from __future__ import annotations

from dataclasses import asdict, dataclass, field
from enum import Enum
from typing import Any


class Intent(str, Enum):
    LEGAL_ADVICE = "legal_advice_request"
    LAW_LOOKUP = "law_lookup"
    SIMILAR_CASE = "similar_case_search"
    DOCUMENT_EXPLANATION = "document_explanation"
    LEGAL_PROCEDURE = "legal_procedure"
    DOCUMENT_GENERATION = "document_generation_request"
    GENERAL_LEGAL = "general_legal_question"
    UNKNOWN = "unknown"


class ValidationStatus(str, Enum):
    PASS = "PASS"
    LOW_CONFIDENCE = "LOW_CONFIDENCE"
    INSUFFICIENT_EVIDENCE = "INSUFFICIENT_EVIDENCE"


@dataclass
class QueryAnalysis:
    original_question: str
    normalized_question: str
    intent: Intent
    filters: dict[str, Any] = field(default_factory=dict)


@dataclass
class Citation:
    id: str
    document_title: str | None
    court: str | None
    case_number: str | None
    law_article: list[str]
    chunk_id: str
    source_path: str
    source_dataset: str


@dataclass
class ContextItem:
    text: str
    score: float
    citation: Citation
    token_count: int


@dataclass
class ValidationResult:
    status: ValidationStatus
    reasons: list[str] = field(default_factory=list)


@dataclass
class RagResult:
    answer: str
    confidence: str
    citations: list[Citation]
    retrieved_chunks: list[dict[str, Any]]
    processing_time_ms: float
    validation: ValidationResult
    analysis: QueryAnalysis

    def to_dict(self) -> dict[str, Any]:
        value = asdict(self)
        value["validation"]["status"] = self.validation.status.value
        value["analysis"]["intent"] = self.analysis.intent.value
        return value
