"""End-to-end orchestration from legal question to validated response."""
from __future__ import annotations

import time
from dataclasses import asdict
from typing import Any, Protocol
from ai.retrieval.models import LegalSearchQuery, LegalSearchResult
from .context_builder import build_context
from .llm_provider import LLMProvider
from .models import RagResult, ValidationResult, ValidationStatus
from .prompt_builder import build_prompt
from .query_analyzer import analyze_query
from .response_validator import validate_response


class Retriever(Protocol):
    def search(self, query: LegalSearchQuery) -> list[LegalSearchResult]: ...


class RagPipeline:
    def __init__(self, retriever: Retriever, llm: LLMProvider, *, top_k: int = 10, token_budget: int = 4000):
        self.retriever, self.llm, self.top_k, self.token_budget = retriever, llm, top_k, token_budget

    def run(self, question: str, filters: dict[str, Any] | None = None) -> RagResult:
        started = time.perf_counter()
        analysis = analyze_query(question, filters)
        f = analysis.filters
        search = LegalSearchQuery(
            query=analysis.normalized_question, top_k=self.top_k,
            courts=list(f.get("court", [])), section_numbers=list(f.get("section", [])),
            article_numbers=list(f.get("article", [])),
            metadata={key: value for key, value in f.items() if key not in {"court", "section", "article"}},
        )
        results = self.retriever.search(search)
        context = build_context(results, self.token_budget)
        if not context:
            answer = "INSUFFICIENT_EVIDENCE"
            validation = ValidationResult(ValidationStatus.INSUFFICIENT_EVIDENCE, ["Retrieval returned no usable chunks."])
        else:
            answer = self.llm.generate(build_prompt(analysis, context)).strip()
            validation = validate_response(answer, context)
        confidence = {ValidationStatus.PASS: "high", ValidationStatus.LOW_CONFIDENCE: "low", ValidationStatus.INSUFFICIENT_EVIDENCE: "insufficient"}[validation.status]
        return RagResult(
            answer, confidence, [item.citation for item in context],
            [asdict(result) for result in results], (time.perf_counter() - started) * 1000,
            validation, analysis,
        )
