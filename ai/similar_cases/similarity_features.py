"""Explainable deterministic similarity features for precedent ranking.

The score is a ranking score, not a calibrated probability that two cases are
"X% legally identical". Semantic vector relevance is deliberately capped at
half of the score so specific legal/factual issue overlap can dominate generic
language similarity.
"""
from __future__ import annotations
from dataclasses import dataclass
import re
from .models import MatchingFactor


@dataclass(frozen=True)
class FeatureWeights:
    vector_relevance: float = .50
    same_issue_family: float = .20
    issue_mismatch_penalty: float = -.22
    same_legal_domain: float = .10
    same_case_category: float = .06
    shared_law: float = .04
    shared_section: float = .03
    shared_article: float = .02
    shared_citation: float = .015
    preferred_chunk_type: float = .01
    same_court: float = .005
    same_jurisdiction: float = .005
    shared_entity: float = .005
    matching_outcome: float = .005


# Broad legal/factual issue families. These are intentionally grounded in terms
# that occur in Pakistani case text and in WakuLAW case-management labels.
ISSUE_FAMILIES: dict[str, tuple[str, ...]] = {
    "fraud": (
        "fraud", "fraudulent", "forgery", "forged", "fake", "bogus", "cheating",
        "deception", "deceit", "misrepresentation", "dishonest", "dishonestly",
        "financial loss", "breach of trust", "nab", "accountability bureau",
    ),
    "family": (
        "family court", "family law", "khula", "dissolution of marriage", "divorce",
        "maintenance", "child custody", "custody", "guardianship", "visitation",
        "dower", "haq mehr", "mehr", "dowry", "bridal gifts", "marriage",
    ),
    "property": (
        "property", "ownership", "possession", "land", "mutation", "transfer of property",
        "specific performance", "inheritance", "partition", "tenancy", "rent",
    ),
    "criminal": (
        "criminal", "offence", "offense", "accused", "prosecution", "conviction",
        "acquittal", "sentence", "bail", "arrest", "fir", "penal code", "cr.p.c",
    ),
    "constitutional": (
        "constitutional", "fundamental rights", "article 199", "writ", "judicial review",
        "constitution petition", "habeas corpus", "mandamus", "certiorari",
    ),
    "tax": (
        "tax", "taxation", "revenue", "assessment", "income tax", "sales tax",
        "federal board of revenue", "fbr", "customs",
    ),
    "labour": (
        "labour", "labor", "employment", "employee", "worker", "termination",
        "industrial relations", "service matter", "dismissal from service",
    ),
    "corporate": (
        "company", "corporate", "shareholder", "director", "securities", "companies act",
        "commercial company", "board of directors",
    ),
    "contract": (
        "contract", "agreement", "breach of contract", "specific performance",
        "consideration", "contractual", "sale agreement",
    ),
}


def overlap(a, b):
    right = {str(x).casefold() for x in b}
    return [str(x) for x in a if str(x).casefold() in right]


def _issue_families(text: str) -> set[str]:
    value = (text or "").casefold()
    found: set[str] = set()
    for family, terms in ISSUE_FAMILIES.items():
        if any(term in value for term in terms):
            found.add(family)
    return found


def compute_features(intelligence, candidate, request, weights=None):
    w = weights or FeatureWeights()
    raw = max(0, min(1, float(candidate.score)))
    factors = [MatchingFactor("vector_relevance", f"{raw:.4f}", w.vector_relevance)]

    candidate_text = " ".join(
        [
            candidate.title or "",
            candidate.case_category or "",
            candidate.text_preview or "",
            " ".join(candidate.laws_cited or []),
            " ".join(candidate.sections_cited or []),
            " ".join(candidate.articles_cited or []),
        ]
    ).casefold()
    source_text = (request.situation or request.case_number or request.document_id or "").casefold()

    source_issues = _issue_families(source_text)
    candidate_issues = _issue_families(candidate_text)
    shared_issues = sorted(source_issues & candidate_issues)

    # A concrete shared issue (fraud, custody, tax, property...) should matter far
    # more than generic words such as "case", "legal" or even jurisdiction.
    if shared_issues:
        factors.append(
            MatchingFactor("same_issue_family", ", ".join(shared_issues), w.same_issue_family)
        )
    elif source_issues:
        factors.append(
            MatchingFactor("issue_mismatch", ", ".join(sorted(source_issues)), w.issue_mismatch_penalty)
        )

    text = " ".join([candidate.case_category or "", candidate.text_preview or ""]).casefold()
    domain = intelligence.primary_domain.value.casefold().replace(" law", "")
    if domain != "unknown" and domain in text:
        factors.append(MatchingFactor("same_legal_domain", intelligence.primary_domain.value, w.same_legal_domain))
    if request.case_category and candidate.case_category == request.case_category:
        factors.append(MatchingFactor("same_case_category", candidate.case_category, w.same_case_category))
    if request.court and candidate.court == request.court:
        factors.append(MatchingFactor("same_court", candidate.court, w.same_court))
    if request.jurisdiction and candidate.jurisdiction == request.jurisdiction:
        factors.append(MatchingFactor("same_jurisdiction", candidate.jurisdiction, w.same_jurisdiction))

    entities = intelligence.entities
    for _name, items, citems, label, weight in (
        ("acts", entities.get("acts", []), candidate.laws_cited, "shared_law", w.shared_law),
        ("sections", entities.get("sections", []), candidate.sections_cited, "shared_section", w.shared_section),
        ("articles", entities.get("articles", []), candidate.articles_cited, "shared_article", w.shared_article),
        ("citations", entities.get("legal_citations", []), candidate.legal_citations, "shared_legal_citation", w.shared_citation),
    ):
        for value in overlap(items, citems):
            factors.append(MatchingFactor(label, value, weight))

    # Generic entities receive only a tiny contribution and common filler terms are
    # explicitly ignored so words such as "case" and "legal" cannot inflate ranking.
    ignored_entities = {"case", "legal", "law", "pakistan", "court", "judgment"}
    for key, values in entities.items():
        if key in {"acts", "sections", "articles", "legal_citations"}:
            continue
        for value in values:
            if value.casefold() in ignored_entities:
                continue
            if re.search(r"\b" + re.escape(value.casefold()) + r"\b", text):
                factors.append(MatchingFactor("shared_explicit_entity", value, w.shared_entity))

    if request.include_outcomes and candidate.explicit_outcome_phrase:
        terms = set(
            re.findall(
                r"\b(?:allowed|dismissed|granted|refused|acquitted|convicted)\b",
                (request.situation or "").casefold(),
            )
        )
        for term in terms:
            if term in candidate.explicit_outcome_phrase.casefold():
                factors.append(MatchingFactor("matching_outcome_term", term, w.matching_outcome))

    if candidate.chunk_type in {"reasoning", "findings", "outcome", "judgment_body"}:
        factors.append(MatchingFactor("preferred_chunk_type", candidate.chunk_type, w.preferred_chunk_type))
    return factors
