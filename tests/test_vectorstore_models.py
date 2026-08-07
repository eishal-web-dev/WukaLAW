import uuid
from ai.vectorstore.config import QdrantSettings
from ai.vectorstore.models import stable_point_id
def test_point_ids_are_deterministic_uuid_compatible():
    first=stable_point_id("chunk-a");assert first==stable_point_id("chunk-a");assert first!=stable_point_id("chunk-b");assert str(uuid.UUID(first))==first
def test_local_configuration_overrides_server(tmp_path):
    settings=QdrantSettings.from_env(collection="test",local_path=tmp_path);assert settings.local_path==tmp_path and settings.collection=="test"
