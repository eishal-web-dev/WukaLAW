import pytest
from ai.legal_intelligence.domain_classifier import classify_domain
from ai.legal_intelligence.models import LegalDomain


@pytest.mark.parametrize("text,domain", [
    ("divorce dowry custody", LegalDomain.FAMILY),
    ("FIR arrest bail under PPC", LegalDomain.CRIMINAL),
    ("my employer fired me without salary", LegalDomain.LABOUR),
    ("FBR income tax assessment", LegalDomain.TAX),
    ("fundamental right under the Constitution", LegalDomain.CONSTITUTIONAL),
    ("hello world", LegalDomain.UNKNOWN),
])
def test_domains(text, domain): assert classify_domain(text).primary == domain
