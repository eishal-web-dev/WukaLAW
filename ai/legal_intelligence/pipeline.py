"""Offline deterministic legal-intelligence pipeline."""
from __future__ import annotations
from .domain_classifier import classify_domain
from .entity_extractor import extract_entities
from .intent_classifier import classify_intent
from .jurisdiction_detector import detect_jurisdiction
from .language_detector import detect_language
from .legal_query_builder import build_legal_query
from .models import Jurisdiction, Language, LegalDomain, LegalQuery
from .query_cleaner import clean_query
from .query_normalizer import normalize_query
from .source_recommender import recommend_sources


def analyze(question: str) -> LegalQuery:
    cleaned = clean_query(question)
    language = detect_language(cleaned)
    intent = classify_intent(cleaned)
    domain = classify_domain(cleaned)
    entities = extract_entities(cleaned)
    jurisdiction = detect_jurisdiction(cleaned)
    sources = recommend_sources(domain.primary, domain.secondary)
    normalized = normalize_query(cleaned, domain.primary, jurisdiction, entities)
    warnings: list[str] = []
    if language == Language.UNKNOWN: warnings.append("Language could not be determined.")
    if intent.confidence == 0: warnings.append("Intent could not be determined.")
    if domain.primary == LegalDomain.UNKNOWN: warnings.append("Legal domain could not be determined.")
    if jurisdiction == Jurisdiction.UNKNOWN: warnings.append("No explicit jurisdiction found; Pakistan was added to normalization only when a legal domain was identified.")
    return build_legal_query(intent=intent, domain=domain, language=language, jurisdiction=jurisdiction,
                             entities=entities, sources=sources, normalized_query=normalized, warnings=warnings)
