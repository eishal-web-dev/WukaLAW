"""Build the final structured legal query object."""
from __future__ import annotations
from .models import DomainResult, IntentResult, Jurisdiction, Language, LegalQuery


def build_legal_query(*, intent: IntentResult, domain: DomainResult, language: Language,
                      jurisdiction: Jurisdiction, entities: dict[str, list[str]],
                      sources: list[str], normalized_query: str, warnings: list[str]) -> LegalQuery:
    return LegalQuery(intent.intent, intent.confidence, domain.primary, domain.secondary, language,
                      jurisdiction, entities, sources, normalized_query, warnings)
