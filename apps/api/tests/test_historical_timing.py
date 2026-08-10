from ai.case_pathway.historical_timing import analyze_historical_timing

def row(title, text):
    return {"document_id": title, "title": title, "text_preview": text}

def test_explicit_dated_events_produce_median_and_iqr():
    result = analyze_historical_timing("arguments", [
        row("A", "Final arguments were heard on 01-01-2024. Judgment announced on 11-01-2024."),
        row("B", "Final arguments were heard on 01-02-2024. Judgment pronounced on 21-02-2024."),
        row("C", "Final arguments concluded on 01-03-2024. Final order passed on 31-03-2024."),
    ])
    assert result["available"] is True
    assert result["sample_size"] == 3
    assert result["median_days"] == 20
    assert result["iqr_days"] == [10, 30]

def test_no_number_without_minimum_explicit_date_sample():
    result = analyze_historical_timing("arguments", [
        row("A", "Final arguments were heard. Judgment announced later."),
        row("B", "Final arguments were heard on 01-02-2024."),
    ])
    assert result["available"] is False
    assert result["median_days"] is None
    assert result["iqr_days"] is None
