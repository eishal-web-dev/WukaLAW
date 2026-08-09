from ai.case_pathway.historical_pathway import analyze_historical_pathways


def result(text: str, *, title: str = "Case", outcome: str | None = None):
    return {
        "document_id": title.lower().replace(" ", "-"),
        "title": title,
        "court": "Supreme Court of Pakistan",
        "similarity_score": 0.82,
        "text_preview": text,
        "explicit_outcome_phrase": outcome,
        "explanation": "",
        "differences": [],
    }


def test_arguments_stage_counts_decision_as_next_visible_stage():
    analysis = analyze_historical_pathways(
        "arguments",
        [
            result("Final arguments were heard. Judgment was announced and the suit was decreed.", title="A"),
            result("After hearing counsel, the petition was allowed by final order.", title="B"),
            result("Judgment pronounced. A civil appeal was later filed.", title="C"),
        ],
    )

    assert analysis["available"] is True
    assert analysis["cases_with_later_stage"] == 3
    assert analysis["most_common_next_stage"]["stage_key"] == "decision"
    assert analysis["most_common_next_stage"]["count"] == 3


def test_evidence_stage_prefers_arguments_before_decision_when_both_visible():
    analysis = analyze_historical_pathways(
        "evidence",
        [result("Evidence was closed. Final arguments were heard. Judgment announced.")],
    )

    assert analysis["most_common_next_stage"]["stage_key"] == "arguments"


def test_records_without_later_stage_are_reported_but_not_in_distribution_denominator():
    analysis = analyze_historical_pathways(
        "arguments",
        [
            result("Final arguments were heard but the indexed passage ends here.", title="No later text"),
            result("The petition was dismissed by final order.", title="Decision visible"),
        ],
    )

    assert analysis["comparable_cases_reviewed"] == 2
    assert analysis["cases_with_later_stage"] == 1
    assert analysis["cases_without_later_stage"] == 1
    assert analysis["most_common_next_stage"]["share"] == 1.0


def test_unknown_current_stage_does_not_generate_historical_forecast():
    analysis = analyze_historical_pathways(
        "unknown",
        [result("Judgment announced and appeal filed.")],
    )

    assert analysis["available"] is False
    assert analysis["comparable_cases_reviewed"] == 0
    assert analysis["most_common_next_stage"] is None


def test_appeal_stage_can_observe_enforcement_as_later_stage():
    analysis = analyze_historical_pathways(
        "appeal",
        [result("The appeal was dismissed. Execution proceedings were then initiated.")],
    )

    assert analysis["most_common_next_stage"]["stage_key"] == "enforcement"
