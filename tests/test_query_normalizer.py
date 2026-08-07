from ai.legal_intelligence.models import Jurisdiction, LegalDomain
from ai.legal_intelligence.query_normalizer import normalize_query


def test_employment_expansion():
    result = normalize_query("My boss fired me", LegalDomain.LABOUR, Jurisdiction.UNKNOWN, {})
    for term in ("employment", "termination", "wrongful", "dismissal", "labour", "pakistan"):
        assert term in result


def test_dowry_expansion():
    result = normalize_query("My husband isn't giving me my dowry", LegalDomain.FAMILY, Jurisdiction.PAKISTAN, {})
    for term in ("dowry", "recovery", "family", "marriage", "property", "pakistan"):
        assert term in result
