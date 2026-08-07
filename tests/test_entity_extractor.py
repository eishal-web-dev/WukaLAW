from ai.legal_intelligence.entity_extractor import extract_entities


def test_multiple_structured_entities():
    text = "Supreme Court case No. ABC/12/2020 under Evidence Act 1984, Section 12, Article 14 and Rule 7"
    values = extract_entities(text)
    assert values["courts"] == ["Supreme Court"]
    assert "ABC/12/2020" in values["case_numbers"]
    assert values["sections"] == ["12"]
    assert values["articles"] == ["14"]
    assert values["rules"] == ["7"]
    assert any("Evidence Act 1984" in act for act in values["acts"])


def test_money_date_cnic_fir_judge_and_concepts():
    text = "Justice Ayesha Malik heard FIR No. 12/2024 on 12 March 2024 about Rs. 250,000, CNIC 35202-1234567-1, bail and a cheque."
    values = extract_entities(text)
    assert values["judges"] == ["Ayesha Malik"]
    assert values["fir"] == ["12/2024"]
    assert values["dates"] == ["12 March 2024"]
    assert values["money_amounts"] == ["Rs. 250,000"]
    assert values["cnic"] == ["35202-1234567-1"]
    assert values["bail"] == ["bail"] and values["cheque"] == ["cheque"]


def test_does_not_invent_entities():
    assert extract_entities("hello") == {}
    assert "fir" not in extract_entities("My boss fired me")
