from ai.case_pathway.historical_timing import analyze_historical_timing

<<<<<<< HEAD

def result(text: str, title: str = "Case") -> dict:
    return {
        "document_id": title.lower(),
        "title": title,
        "court": "Supreme Court of Pakistan",
        "text_preview": text,
        "explicit_outcome_phrase": None,
        "explanation": "",
        "differences": [],
    }


def test_timing_uses_explicit_dated_stage_pairs_and_reports_median():
    analysis = analyze_historical_timing(
        "evidence",
        [
            result("Evidence was recorded on 01.01.2024. Final arguments were heard on 31.01.2024.", "A"),
            result("Evidence was recorded on 01.02.2024. Final arguments were heard on 01.04.2024.", "B"),
            result("Evidence was recorded on 01.03.2024. Judgment was announced on 30.05.2024.", "C"),
            result("Evidence was recorded on 01.04.2024. Final arguments were heard on 30.04.2024.", "D"),
        ],
    )

    assert analysis["available"] is True
    assert analysis["dated_transitions_found"] == 4
    assert analysis["median_days"] > 0
    assert analysis["typical_low_days"] <= analysis["median_days"] <= analysis["typical_high_days"]


def test_timing_requires_minimum_three_usable_records():
    analysis = analyze_historical_timing(
        "arguments",
        [
            result("Final arguments were heard on 01.01.2024. Judgment was announced on 20.01.2024.", "A"),
            result("Final arguments were heard on 01.02.2024. Decree passed on 25.02.2024.", "B"),
        ],
    )

    assert analysis["available"] is False
    assert analysis["dated_transitions_found"] == 2
    assert "at least 3" in analysis["reason"]


def test_undated_stage_text_does_not_create_timing_observation():
    analysis = analyze_historical_timing(
        "evidence",
        [
            result("Evidence was recorded. Final arguments were later heard and judgment followed.", "A"),
            result("Evidence was recorded on 01.01.2024 but final arguments were later heard without a stated date.", "B"),
            result("Evidence was recorded on 02.01.2024 and the suit was eventually decreed.", "C"),
        ],
    )

    assert analysis["available"] is False
    assert analysis["dated_transitions_found"] == 0


def test_backward_or_same_day_transition_is_rejected():
    analysis = analyze_historical_timing(
        "evidence",
        [
            result("Judgment was announced on 01.01.2024. Evidence was recorded on 01.02.2024.", "A"),
            result("Evidence was recorded on 01.03.2024. Final arguments were heard on 01.03.2024.", "B"),
            result("Evidence was recorded on 01.04.2024. Final arguments were heard on 31.03.2024.", "C"),
        ],
    )

    assert analysis["dated_transitions_found"] == 0
    assert analysis["available"] is False


def test_first_dated_later_event_is_used_not_furthest_stage():
    analysis = analyze_historical_timing(
        "arguments",
        [
            result("Final arguments were heard on 01.01.2024. Judgment was announced on 11.01.2024. Civil appeal was filed on 20.02.2024.", "A"),
            result("Final arguments were heard on 01.03.2024. Judgment was pronounced on 21.03.2024. Appeal filed on 30.04.2024.", "B"),
            result("Final arguments were heard on 01.05.2024. Petition was dismissed by final order on 31.05.2024. Civil appeal was filed on 15.06.2024.", "C"),
        ],
    )

    assert analysis["available"] is True
    assert analysis["dated_transitions_found"] == 3
    assert all(item["next_stage_key"] == "decision" for item in analysis["observations"])
    assert analysis["median_days"] == 20.0
=======
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
>>>>>>> bff5672 (feat(ai): complete deterministic case intelligence and brief fallback)
