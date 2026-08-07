"""Map classified domains to collection families for downstream RAG."""
from .models import LegalDomain

_SOURCES = {
    LegalDomain.FAMILY: ["family judgments", "family laws", "constitution"],
    LegalDomain.CRIMINAL: ["criminal judgments", "PPC", "CrPC", "constitution"],
    LegalDomain.CIVIL: ["civil judgments", "CPC", "law of evidence"],
    LegalDomain.CONSTITUTIONAL: ["constitutional judgments", "constitution"],
    LegalDomain.LABOUR: ["labour laws", "service cases", "constitutional rights"],
    LegalDomain.PROPERTY: ["property judgments", "property laws", "registration laws"],
    LegalDomain.CORPORATE: ["corporate laws", "company judgments", "SECP regulations"],
    LegalDomain.TAX: ["tax laws", "tax judgments", "FBR regulations"],
    LegalDomain.SERVICE: ["service laws", "service cases", "constitutional rights"],
    LegalDomain.CYBER: ["cyber crime judgments", "PECA", "criminal laws"],
    LegalDomain.BANKING: ["banking judgments", "banking laws", "negotiable instruments"],
    LegalDomain.CONSUMER: ["consumer judgments", "consumer protection laws"],
    LegalDomain.IMMIGRATION: ["immigration laws", "citizenship laws", "constitutional rights"],
    LegalDomain.HUMAN_RIGHTS: ["human rights judgments", "constitution", "international instruments"],
}


def recommend_sources(primary: LegalDomain, secondary: list[LegalDomain]) -> list[str]:
    result: list[str] = []
    for domain in [primary, *secondary]:
        for source in _SOURCES.get(domain, []):
            if source not in result:
                result.append(source)
    return result
