import pytest
from ai.rag.models import Intent
from ai.rag.query_analyzer import analyze_query


@pytest.mark.parametrize("question,intent", [
    ("Draft a legal notice for me", Intent.DOCUMENT_GENERATION),
    ("Find cases similar to this judgment", Intent.SIMILAR_CASE),
    ("What does section 12 of the Evidence Act provide?", Intent.LAW_LOOKUP),
    ("Should I sue my landlord?", Intent.LEGAL_ADVICE),
])
def test_classification(question, intent):
    assert analyze_query(question).intent == intent


def test_extracts_explicit_filters():
    result = analyze_query("Supreme Court case No. ABC/12/2020 under Article 14 and section 9 of Evidence Act 2020")
    assert result.filters["court"] == ["Supreme Court"]
    assert result.filters["article"] == ["14"]
    assert result.filters["section"] == ["9"]
    assert "ABC/12/2020" in result.filters["case_number"]
    assert "2020" in result.filters["year"]


@pytest.mark.parametrize("bad", ["", "   ", None, 12])
def test_malformed_question_rejected(bad):
    with pytest.raises(ValueError):
        analyze_query(bad)
