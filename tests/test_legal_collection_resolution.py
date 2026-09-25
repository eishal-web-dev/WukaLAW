from types import SimpleNamespace

import pytest

from ai.vectorstore.config import QdrantSettings, resolve_legal_collection


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
