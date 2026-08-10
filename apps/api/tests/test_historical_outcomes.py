from ai.case_pathway.historical_outcomes import analyze_historical_outcomes

def row(text):
    return {"document_id": text, "title": "Case", "text_preview": text}

def test_explicit_outcomes_are_recorded_without_fake_client_alignment():
    result = analyze_historical_outcomes([
        row("The appeal was allowed."),
        row("The petition was dismissed."),
        row("The suit was partly decreed."),
        row("No final order appears here."),
    ])
    assert result["available"] is True
    assert result["usable_outcomes"] == 3
    assert result["client_alignment_available"] is False
    assert result["favorable"] == 0
    assert result["unfavorable"] == 0
    assert result["partial_or_mixed"] == 1
    assert result["unclear"] == 2

def test_known_appellant_alignment_is_conservative():
    result = analyze_historical_outcomes([
        row("The appeal was allowed."),
        row("The appeal was dismissed."),
    ], relevant_side="appellant")
    assert result["client_alignment_available"] is True
    assert result["favorable"] == 1
    assert result["unfavorable"] == 1

def test_sparse_text_has_no_fake_outcome():
    result = analyze_historical_outcomes([row("Evidence was recorded and counsel appeared.")])
    assert result["available"] is False
    assert result["usable_outcomes"] == 0
