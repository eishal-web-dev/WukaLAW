"""Tests for deterministic TASK-003 metadata extraction."""

from ai.preprocessing.metadata_extractor import extract_metadata


def test_extracts_required_legal_metadata_without_outcome_guessing() -> None:
    text = """IN THE SUPREME COURT OF PAKISTAN
Constitution Petition No. 42 of 2023
PRESENT: MR. JUSTICE TEST JUDGE
Date of hearing: 12 March 2024
Date of decision: 14 March 2024
Under the Constitution of Pakistan, 1973 and Section 12-A of the Evidence Act, 1984,
read with Article 199. See PLD 2024 SC 15.
The petition is dismissed.
"""
    metadata = extract_metadata(text, {"document_type": "judgment", "jurisdiction": "Pakistan"})
    assert metadata["court"] == "Supreme Court of Pakistan"
    assert metadata["case_number"]
    assert metadata["judges"] == ["TEST JUDGE"]
    assert metadata["hearing_date"] == "2024-03-12"
    assert metadata["decision_date"] == "2024-03-14"
    assert metadata["laws_cited"]
    assert "12-A" in metadata["sections_cited"]
    assert "199" in metadata["articles_cited"]
    assert "PLD 2024 SC 15" in metadata["legal_citations"]
    assert metadata["explicit_outcome_phrases"] == ["petition is dismissed"]
    assert metadata["outcome_label"] is None
