from types import SimpleNamespace
from pathlib import Path
import sys

import pytest

from ai.vectorstore.config import QdrantSettings, resolve_legal_collection

API_ROOT = Path(__file__).resolve().parents[1] / "apps" / "api"
if str(API_ROOT) not in sys.path:
    sys.path.insert(0, str(API_ROOT))

from app.routers.cases import (
    _case_preparation_score,
    _experimental_outcome_estimate,
    _historical_outcome_summary,
)


def _client(*names):
    raw = SimpleNamespace(
        get_collections=lambda: SimpleNamespace(
            collections=[SimpleNamespace(name=name) for name in names]
        )
    )
    return SimpleNamespace(client=raw)


def test_configured_legal_collection_wins():
    settings = QdrantSettings(collection="my_judgments")
    resolved, available = resolve_legal_collection(
        _client("wakulaw_real_5000", "my_judgments"), settings
    )
    assert resolved == "my_judgments"
    assert available == ["my_judgments", "wakulaw_real_5000"]


def test_known_local_corpus_is_discovered_but_user_uploads_are_not():
    settings = QdrantSettings(collection="missing_collection")
    resolved, _ = resolve_legal_collection(
        _client("wakulaw_user_documents", "wakulaw_real_5000"), settings
    )
    assert resolved == "wakulaw_real_5000"


def test_ambiguous_collections_require_explicit_configuration():
    settings = QdrantSettings(collection="missing_collection")
    with pytest.raises(RuntimeError, match="Available collections"):
        resolve_legal_collection(
            _client("family_judgments", "criminal_judgments", "wakulaw_user_documents"),
            settings,
        )


def test_historical_outcomes_are_not_labelled_as_user_win_probability():
    summary = _historical_outcome_summary([
        {"document_id": "a", "explicit_outcome_phrase": "Petition was allowed", "matching_factors": [], "laws_cited": []},
        {"document_id": "b", "explicit_outcome_phrase": "Appeal dismissed", "matching_factors": [], "laws_cited": []},
        {"document_id": "c", "explicit_outcome_phrase": "Suit partly decreed", "matching_factors": [], "laws_cited": []},
        {"document_id": "d", "explicit_outcome_phrase": None, "matching_factors": [], "laws_cited": []},
    ])

    assert summary["outcomes_available"] == 3
    assert summary["favourable_ratio"] is None
    assert summary["score_available"] is False
    assert summary["confidence_interval_low"] is None
    assert summary["unclear"] == 1
    assert "not this user's probability" in summary["meaning"]


def test_historical_score_requires_sample_and_reports_uncertainty():
    summary = _historical_outcome_summary([
        {"document_id": str(index), "explicit_outcome_phrase": outcome, "matching_factors": [], "laws_cited": []}
        for index, outcome in enumerate((
            "Petition allowed",
            "Suit decreed",
            "Relief granted",
            "Appeal dismissed",
            "Petition rejected",
        ))
    ])

    assert summary["score_available"] is True
    assert summary["favourable_ratio"] == 60
    assert summary["outcomes_available"] == 5
    assert summary["confidence_interval_low"] < 60 < summary["confidence_interval_high"]


def test_preparation_score_is_transparent_and_not_a_win_probability():
    profile = {
        "case": {"deadline": None},
        "client_account": "A clear account of the dispute.",
        "verified_documents": [{"id": index} for index in range(4)],
        "timeline": [
            {"linked_document_id": 1},
            {"linked_document_id": None},
        ],
        "evidence_inventory": [{"id": index} for index in range(5)],
        "documents_pending_ocr_review": [],
    }

    result = _case_preparation_score(profile)

    assert result["score"] == 75
    assert result["maximum"] == 100
    assert "not a probability of winning" in result["warning"].lower()
    assert result["priority_actions"][0]["category"] == "Timeline linked to proof"


def test_experimental_outlook_requires_claim_role_and_larger_sample():
    summary = {"outcomes_available": 9, "favourable": 6, "unfavourable": 3}
    missing = _experimental_outcome_estimate(summary, None, None)
    small = _experimental_outcome_estimate(summary, "initiating", "dower recovery")

    assert missing["available"] is False
    assert small["available"] is False
    assert small["minimum_sample"] == 10


def test_experimental_outlook_orients_results_to_selected_side():
    summary = {"outcomes_available": 10, "favourable": 6, "unfavourable": 3}
    initiator = _experimental_outcome_estimate(summary, "initiating", "dower recovery")
    defender = _experimental_outcome_estimate(summary, "defending", "loan defence")

    assert initiator["available"] is True
    assert initiator["estimate"] == 60
    assert defender["estimate"] == 30
    assert initiator["sample_size"] == 10
    assert "not a validated prediction" in initiator["warning"].lower()
