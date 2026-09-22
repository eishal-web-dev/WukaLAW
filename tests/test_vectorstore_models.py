import uuid
from ai.vectorstore.config import QdrantSettings
from ai.vectorstore.models import stable_point_id
def test_point_ids_are_deterministic_uuid_compatible():
    first=stable_point_id("chunk-a");assert first==stable_point_id("chunk-a");assert first!=stable_point_id("chunk-b");assert str(uuid.UUID(first))==first
def test_local_configuration_overrides_server(tmp_path):
    settings=QdrantSettings.from_env(collection="test",local_path=tmp_path);assert settings.local_path==tmp_path and settings.collection=="test"


def test_similar_cases_config_reads_repository_env_when_launched_from_api(tmp_path, monkeypatch):
    import ai.vectorstore.config as config

    (tmp_path / ".env").write_text(
        "QDRANT_COLLECTION=judgments_5000\nQDRANT_LOCAL_PATH=stored_judgments\n",
        encoding="utf-8",
    )
    monkeypatch.setattr(config, "PROJECT_ROOT", tmp_path)
    monkeypatch.delenv("QDRANT_COLLECTION", raising=False)
    monkeypatch.delenv("QDRANT_LOCAL_PATH", raising=False)
    settings = config.QdrantSettings.from_env()
    assert settings.collection == "judgments_5000"
    assert settings.local_path == (tmp_path / "stored_judgments").resolve()
