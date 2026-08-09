"""Explainable deterministic similarity features for precedent ranking.

The score is a ranking score, not a calibrated probability. Broad legal-domain
similarity is useful for retrieval, but a specific pleaded issue/offence must
matter more than generic terms such as "criminal", "court" or "case".
"""
from __future__ import annotations
from dataclasses import dataclass
import re
from .models import MatchingFactor


@dataclass(frozen=True)
class FeatureWeights:
    vector_relevance: float = .42
    same_specific_issue: float = .28
    missing_specific_issue_penalty: float = -.26
    same_broad_issue: float = .08
    issue_mismatch_penalty: float = -.18
    same_legal_domain: float = .08
    same_case_category: float = .04
    shared_law: float = .035
    shared_section: float = .03
    shared_article: float = .02
    shared_citation: float = .015
    preferred_chunk_type: float = .01
    same_court: float = .005
    same_jurisdiction: float = .005
    shared_entity: float = .005
    matching_outcome: float = .005


# Broad domains help retrieval; specific issue families decide whether a result is
# genuinely useful as a precedent for the user's actual dispute.
BROAD_ISSUES: dict[str, tuple[str, ...]] = {
    "criminal": (
        "criminal", "offence", "offense", "accused", "prosecution", "conviction",
        "acquittal", "sentence", "penal code", "cr.p.c", "code of criminal procedure",
    ),
    "family": ("family court", "family law", "marriage", "matrimonial"),
    "property": ("property", "land", "ownership", "possession"),
    "constitutional": ("constitutional", "constitution petition", "fundamental rights", "writ"),
    "tax": ("tax", "taxation", "revenue", "fbr", "customs"),
    "labour": ("labour", "labor", "employment", "employee", "worker", "service matter"),
    "corporate": ("company", "corporate", "shareholder", "director", "companies act"),
    "contract": ("contract", "agreement", "contractual"),
}

SPECIFIC_ISSUES: dict[str, tuple[str, ...]] = {
    "murder_homicide": (
        "murder", "homicide", "qatal", "qatl", "302 ppc", "section 302", "302, p.p.c",
        "302 p.p.c", "death sentence", "murder reference",
    ),
    "bail": ("bail", "pre-arrest bail", "post-arrest bail", "anticipatory bail"),
    "fraud_forgery": (
        "fraud", "fraudulent", "forgery", "forged", "fake", "bogus", "cheating",
        "deception", "deceit", "misrepresentation", "dishonest", "financial loss",
        "breach of trust", "nab", "accountability bureau",
    ),
    "custody_guardianship": (
        "child custody", "custody", "guardianship", "guardian", "visitation",
    ),
    "maintenance": ("maintenance", "maintenance allowance", "nafaqa", "nafqa"),
    "dissolution_khula": ("khula", "dissolution of marriage", "divorce", "talaq"),
    "dower_mehr": ("dower", "haq mehr", "haq meher", "mehr", "meher"),
    "dowry_gifts": ("dowry", "bridal gifts", "jahez", "dowry articles"),
    "inheritance_partition": ("inheritance", "succession", "partition", "legal heirs"),
    "specific_performance": ("specific performance", "sale agreement", "agreement to sell"),
    "tenancy_rent": ("tenancy", "tenant", "landlord", "rent controller", "rent law"),
    "judicial_review_199": ("article 199", "mandamus", "certiorari", "habeas corpus", "judicial review"),
    "tax_assessment": ("assessment", "income tax", "sales tax", "tax liability", "taxpayer"),
    "termination_service": ("termination", "dismissal from service", "removal from service", "reinstatement"),
}


def overlap(a, b):
    right = {str(x).casefold() for x in b}
    return [str(x) for x in a if str(x).casefold() in right]


def _families(text: str, mapping: dict[str, tuple[str, ...]]) -> set[str]:
    value = (text or "").casefold()
    return {family for family, terms in mapping.items() if any(term in value for term in terms)}


def compute_features(intelligence, candidate, request, weights=None):
    w = weights or FeatureWeights()
    raw = max(0, min(1, float(candidate.score)))
    factors = [MatchingFactor("vector_relevance", f"{raw:.4f}", w.vector_relevance)]

    candidate_text = " ".join(
        [
            candidate.title or "",
            candidate.case_category or "",
            candidate.case_number or "",
            candidate.text_preview or "",
            " ".join(candidate.laws_cited or []),
            " ".join(candidate.sections_cited or []),
            " ".join(candidate.articles_cited or []),
        ]
    ).casefold()
    source_text = (request.situation or request.case_number or request.document_id or "").casefold()

    source_specific = _families(source_text, SPECIFIC_ISSUES)
    candidate_specific = _families(candidate_text, SPECIFIC_ISSUES)
    shared_specific = sorted(source_specific & candidate_specific)

    if shared_specific:
        factors.append(MatchingFactor("same_specific_issue", ", ".join(shared_specific), w.same_specific_issue))
    elif source_specific:
        # A murder case should not receive a strong score merely because another
        # judgment is generically criminal. The specific issue is mandatory evidence.
        factors.append(
            MatchingFactor(
                "missing_specific_issue",
                ", ".join(sorted(source_specific)),
                w.missing_specific_issue_penalty,
            )
        )

    source_broad = _families(source_text, BROAD_ISSUES)
    candidate_broad = _families(candidate_text, BROAD_ISSUES)
    shared_broad = sorted(source_broad & candidate_broad)
    if shared_broad:
        factors.append(MatchingFactor("same_broad_issue", ", ".join(shared_broad), w.same_broad_issue))
    elif source_broad:
        factors.append(MatchingFactor("issue_mismatch", ", ".join(sorted(source_broad)), w.issue_mismatch_penalty))

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
