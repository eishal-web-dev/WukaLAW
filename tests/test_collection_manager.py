import pytest
from ai.vectorstore.collection_manager import CollectionManager,PAYLOAD_INDEXES
from ai.vectorstore.config import QdrantSettings
from ai.vectorstore.qdrant_client import WakuQdrantClient
def client(tmp_path):return WakuQdrantClient(QdrantSettings(local_path=tmp_path/"q",collection="test"))
def test_local_creation_idempotence_and_payload_indexes(tmp_path):
    c=client(tmp_path)
    try:
        m=CollectionManager(c);spec=m.create("test",8);again=m.create("test",8);assert m.exists("test") and m.vector_size("test")==8;assert set(spec.payload_indexes)==set(PAYLOAD_INDEXES) and again.name=="test"
    finally:c.close()
def test_safe_recreation_and_dimension_guard(tmp_path):
    c=client(tmp_path)
    try:
        m=CollectionManager(c);m.create("test",8,index_payload=False)
        with pytest.raises(PermissionError):m.create("test",8,recreate=True)
        with pytest.raises(ValueError):m.create("test",16,index_payload=False)
        assert m.create("test",16,recreate=True,confirm_recreate=True,index_payload=False).dimension==16
    finally:c.close()
