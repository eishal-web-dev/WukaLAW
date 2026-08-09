from types import SimpleNamespace

from app.routers.cases import _similar_case_seed


def test_custom_focus_is_injected_without_fake_family_subissues():
    case = SimpleNamespace(
        title="Ayesha family matter",
        case_type="Family Case",
        description="The wife seeks return of dowry articles.",
    )
    seed = _similar_case_seed(case, [], focus="dowry recovery; receipts; final arguments")

    assert "USER-SELECTED SEARCH FOCUS: dowry recovery; receipts; final arguments" in seed
    assert "Pakistani family-law dispute" in seed
    assert "custody" not in seed.lower()
    assert "maintenance" not in seed.lower()


def test_criminal_custom_focus_can_be_precise():
    case = SimpleNamespace(
        title="Ali criminal matter",
        case_type="Criminal Case",
        description="The accused denies a murder allegation.",
    )
    seed = _similar_case_seed(
        case,
        [],
        focus="murder homicide; firearm; CCTV; plea of alibi not present crime scene",
    )

    assert "murder homicide" in seed
    assert "firearm" in seed
    assert "CCTV" in seed
    assert "alibi" in seed


def test_civil_custom_focus_preserves_case_and_selected_details():
    case = SimpleNamespace(
        title="Land dispute",
        case_type="Civil Case",
        description="Ownership and possession of land are disputed.",
    )
    document = SimpleNamespace(
        title="Sale deed",
        text="Registered sale deed and revenue record are relied upon by the plaintiff.",
    )
    seed = _similar_case_seed(
        case,
        [document],
        focus="property ownership; registered sale deed; possession dispute",
    )

    assert "Case title: Land dispute" in seed
    assert "property ownership" in seed
    assert "registered sale deed" in seed
    assert "Evidence/document Sale deed" in seed
