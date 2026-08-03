import pytest
from ai.legal_intelligence.query_cleaner import clean_query


def test_cleans_spacing_and_entities():
    assert clean_query("  Section\t12 /  Article  14  ") == "Section 12 / Article 14"


def test_decodes_html_and_removes_zero_width():
    assert clean_query("A&amp;B\u200b") == "A&B"


@pytest.mark.parametrize("value", ["", "   ", None, 42])
def test_invalid_input(value):
    with pytest.raises(ValueError): clean_query(value)
