"""Deterministically expand conversational phrases into retrieval terminology."""
from __future__ import annotations
import re
from .models import Jurisdiction, LegalDomain

_EXPANSIONS = [
    (r"\bmy boss fired me\b", "employment termination wrongful dismissal"),
    (r"\b(fired|sacked)\b", "employment termination wrongful dismissal"),
    (r"\bmy husband (is not|isn't|has not|hasn't) giving (me )?my dowry\b", "dowry recovery marriage property"),
    (r"\bnot giving (me )?(my )?dowry\b", "dowry recovery marriage property"),
    (r"\bcheque bounced\b", "dishonoured cheque banking offence"),
]


def normalize_query(cleaned: str, domain: LegalDomain, jurisdiction: Jurisdiction, entities: dict[str, list[str]]) -> str:
    value = cleaned.casefold()
    for pattern, replacement in _EXPANSIONS:
        value = re.sub(pattern, replacement, value)
    value = re.sub(r"[^\w\u0600-\u06ff./()#-]+", " ", value)
    terms = value.split()
    additions = []
    if domain != LegalDomain.UNKNOWN:
        additions.append(domain.value.casefold())
    if jurisdiction != Jurisdiction.UNKNOWN:
        additions.append(jurisdiction.value.casefold())
    elif domain != LegalDomain.UNKNOWN:
        additions.append("pakistan")
    for key in ("acts", "articles", "sections", "case_numbers"):
        additions.extend(item.casefold() for item in entities.get(key, []))
    for addition in " ".join(additions).split():
        if addition not in terms:
            terms.append(addition)
    return " ".join(terms)
