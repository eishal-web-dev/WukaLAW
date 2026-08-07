"""Keyword-weighted legal-domain classification."""
from __future__ import annotations
import re
from .models import DomainResult, LegalDomain

_KEYWORDS: dict[LegalDomain, tuple[str, ...]] = {
    LegalDomain.FAMILY: ("divorce", "khula", "nikah", "nikahnama", "dowry", "dower", "maintenance", "custody", "inheritance", "husband", "wife"),
    LegalDomain.CRIMINAL: ("crime", "criminal", "fir", "bail", "arrest", "accused", "ppc", "crpc", "murder", "theft", "fraud"),
    LegalDomain.CIVIL: ("civil suit", "damages", "injunction", "decree", "plaintiff", "defendant", "tort"),
    LegalDomain.CONSTITUTIONAL: ("constitution", "constitutional", "fundamental right", "article 199", "article 184"),
    LegalDomain.LABOUR: ("employment", "employee", "employer", "boss", "fired", "dismissal", "termination", "salary", "wages", "labour", "worker"),
    LegalDomain.PROPERTY: ("property", "land", "tenant", "landlord", "rent", "possession", "transfer", "registry", "mutation"),
    LegalDomain.CORPORATE: ("company", "corporate", "director", "shareholder", "secp", "partnership", "incorporation"),
    LegalDomain.TAX: ("tax", "income tax", "sales tax", "fbr", "assessment", "customs"),
    LegalDomain.SERVICE: ("civil servant", "government employee", "service tribunal", "seniority", "promotion", "posting", "transfer order"),
    LegalDomain.CYBER: ("cyber", "online fraud", "hacking", "electronic crime", "peca", "identity theft"),
    LegalDomain.BANKING: ("bank", "banking", "cheque", "loan", "mortgage", "finance", "dishonoured"),
    LegalDomain.CONSUMER: ("consumer", "defective", "warranty", "refund", "service provider"),
    LegalDomain.IMMIGRATION: ("immigration", "visa", "passport", "deportation", "citizenship", "foreigner"),
    LegalDomain.HUMAN_RIGHTS: ("human rights", "torture", "discrimination", "forced labour", "freedom of expression"),
}


def classify_domain(text: str) -> DomainResult:
    lowered = text.casefold()
    raw = {domain: sum(1 for keyword in words if re.search(r"\b" + re.escape(keyword) + r"\b", lowered)) for domain, words in _KEYWORDS.items()}
    ranked = sorted(((score, domain) for domain, score in raw.items() if score), key=lambda pair: (-pair[0], pair[1].value))
    if not ranked:
        return DomainResult(LegalDomain.UNKNOWN, [], {})
    best = ranked[0][0]
    scores = {domain.value: round(score / best, 3) for score, domain in ranked}
    return DomainResult(ranked[0][1], [domain for score, domain in ranked[1:] if score / best >= .5], scores)
