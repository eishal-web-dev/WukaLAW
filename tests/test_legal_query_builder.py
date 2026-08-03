import pytest
from ai.legal_intelligence import analyze
from ai.legal_intelligence.models import Intent, Jurisdiction, Language, LegalDomain


def test_complete_legal_query_object():
    result = analyze("My boss fired me in Lahore. What are my rights?")
    assert result.intent == Intent.RIGHTS
    assert result.primary_domain == LegalDomain.LABOUR
    assert result.language == Language.ENGLISH
    assert result.jurisdiction == Jurisdiction.PUNJAB
    assert "labour laws" in result.recommended_sources
    assert result.pipeline_version == "1.0.0"
    assert result.entities["employment"]


def test_unknown_query_has_warnings():
    result = analyze("hello there")
    assert result.intent == Intent.UNKNOWN
    assert result.primary_domain == LegalDomain.UNKNOWN
    assert result.warnings


@pytest.mark.parametrize("bad", ["", "   ", None])
def test_pipeline_rejects_malformed_input(bad):
    with pytest.raises(ValueError): analyze(bad)
