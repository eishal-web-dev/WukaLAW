from ai.case_pathway.stage_detector import analyze_case_pathway


def test_family_case_detects_final_arguments_and_next_decision():
    result = analyze_case_pathway(
        "Family Case",
        (
            "The wife seeks dissolution of marriage and return of dowry articles. "
            "The respondent was served and filed a written statement. Issues were framed. "
            "Plaintiff evidence was recorded and cross-examination is complete. "
            "The matter is now fixed for final arguments."
        ),
        [],
    )

    assert {item["issue"] for item in result["detected_issues"]} >= {"Divorce / Khula", "Dowry Recovery"}
    assert result["current_stage"]["key"] == "arguments"
    assert result["next_generic_stage"]["key"] == "decision"
    assert result["court_process_position"] == 78
    assert "not percent of time completed" in result["progress_meaning"]
    assert any(step["state"] == "current" and step["key"] == "arguments" for step in result["journey_steps"])
    assert any(step["state"] == "next" and step["key"] == "decision" for step in result["journey_steps"])


def test_ex_parte_wording_counts_as_service_stage():
    result = analyze_case_pathway(
        "Family Case",
        "Summons were issued repeatedly and the respondent was proceeded ex-parte.",
        [],
    )

    assert result["current_stage"]["key"] == "service"
    assert any("proceeded ex parte" in term or "proceeded ex-parte" in term for term in result["current_stage"]["evidence_terms"])


def test_criminal_appeal_is_later_than_trial_decision():
    result = analyze_case_pathway(
        "Criminal Case",
        (
            "The accused faced a murder charge under section 302 PPC. Evidence was recorded, "
            "arguments were heard and the trial court announced judgment. A criminal appeal was filed."
        ),
        [{"title": "Appeal memo", "text": "The appeal was preferred against the conviction and sentence."}],
    )

    assert "Murder / Homicide" in {item["issue"] for item in result["detected_issues"]}
    assert result["current_stage"]["key"] == "appeal"
    assert result["next_generic_stage"]["key"] == "enforcement"
    assert result["stage_confidence"] == "high"


def test_decision_wording_detects_decree_without_inventing_appeal():
    result = analyze_case_pathway(
        "Civil Case",
        "After final arguments the suit was decreed and judgment pronounced by the trial court.",
        [],
    )

    assert result["current_stage"]["key"] == "decision"
    assert result["next_generic_stage"]["key"] == "appeal"
    appeal_step = next(step for step in result["journey_steps"] if step["key"] == "appeal")
    assert appeal_step["state"] == "next"


def test_sparse_case_does_not_invent_procedural_stage():
    result = analyze_case_pathway(
        "Family Case",
        "divorce dowry case",
        [],
    )

    assert result["current_stage"]["key"] == "unknown"
    assert result["court_process_position"] == 0
    assert result["stage_confidence"] == "low"
    assert result["next_generic_stage"] is None


def test_unseen_earlier_steps_are_not_claimed_as_confirmed():
    result = analyze_case_pathway(
        "Civil Case",
        "The matter is fixed for final arguments.",
        [],
    )

    pleadings = next(step for step in result["journey_steps"] if step["key"] == "pleadings")
    arguments = next(step for step in result["journey_steps"] if step["key"] == "arguments")
    assert pleadings["state"] == "not_seen"
    assert arguments["state"] == "current"
