"""Typed, serializable contracts for deterministic legal query analysis."""
from __future__ import annotations
from dataclasses import asdict, dataclass, field
from enum import Enum
from typing import Any


class Language(str, Enum):
    ENGLISH = "English"
    URDU = "Urdu"
    UNKNOWN = "Unknown"


class Intent(str, Enum):
    LEGAL_ADVICE = "legal_advice"
    LAW_LOOKUP = "law_lookup"
    SIMILAR_CASE = "similar_case_search"
    DOCUMENT_EXPLANATION = "document_explanation"
    LEGAL_PROCEDURE = "legal_procedure"
    DOCUMENT_GENERATION = "document_generation"
    EVIDENCE_QUESTION = "evidence_question"
    APPEAL = "appeal"
    SETTLEMENT = "settlement"
    RIGHTS = "rights"
    OBLIGATIONS = "obligations"
    UNKNOWN = "unknown"


class LegalDomain(str, Enum):
    FAMILY = "Family Law"
    CRIMINAL = "Criminal Law"
    CIVIL = "Civil Law"
    CONSTITUTIONAL = "Constitutional Law"
    LABOUR = "Labour Law"
    PROPERTY = "Property Law"
    CORPORATE = "Corporate Law"
    TAX = "Tax Law"
    SERVICE = "Service Law"
    CYBER = "Cyber Crime"
    BANKING = "Banking"
    CONSUMER = "Consumer Protection"
    IMMIGRATION = "Immigration"
    HUMAN_RIGHTS = "Human Rights"
    UNKNOWN = "Unknown"


class Jurisdiction(str, Enum):
    PAKISTAN = "Pakistan"
    PUNJAB = "Punjab"
    SINDH = "Sindh"
    KPK = "KPK"
    BALOCHISTAN = "Balochistan"
    ICT = "ICT"
    AJK = "AJK"
    GILGIT_BALTISTAN = "Gilgit Baltistan"
    UNKNOWN = "Unknown"


@dataclass
class IntentResult:
    intent: Intent
    confidence: float
    matched_rules: list[str] = field(default_factory=list)


@dataclass
class DomainResult:
    primary: LegalDomain
    secondary: list[LegalDomain]
    scores: dict[str, float] = field(default_factory=dict)


@dataclass
class LegalQuery:
    intent: Intent
    confidence: float
    primary_domain: LegalDomain
    secondary_domains: list[LegalDomain]
    language: Language
    jurisdiction: Jurisdiction
    entities: dict[str, list[str]]
    recommended_sources: list[str]
    normalized_query: str
    warnings: list[str]
    pipeline_version: str = "1.0.0"

    def to_dict(self) -> dict[str, Any]:
        data = asdict(self)
        data["intent"] = self.intent.value
        data["primary_domain"] = self.primary_domain.value
        data["secondary_domains"] = [value.value for value in self.secondary_domains]
        data["language"] = self.language.value
        data["jurisdiction"] = self.jurisdiction.value
        return data
