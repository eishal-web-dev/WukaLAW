from types import SimpleNamespace

import pytest

from ai.vectorstore.config import QdrantSettings, resolve_legal_collection
from apps.api.app.routers.cases import _historical_outcome_summary


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
    assert summary["favourable_ratio"] == 33
    assert summary["unclear"] == 1
    assert "not this user's probability" in summary["meaning"]
