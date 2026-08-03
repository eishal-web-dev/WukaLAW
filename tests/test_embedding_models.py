import numpy as np
from ai.embeddings.model_provider import FakeEmbeddingProvider
from ai.embeddings.models import EmbeddingRecord
def test_fake_vectors_are_normalized_deterministic_and_dimensioned():
    p=FakeEmbeddingProvider(16);a,used=p.encode_dense(["legal appeal","legal appeal"],8,True);b,_=p.encode_dense(["legal appeal"],2,True)
    assert a.shape==(2,16) and used==8;assert np.allclose(np.linalg.norm(a,axis=1),1);assert np.allclose(a[0],b[0])
def test_batch_fallback_and_record_serialization():
    p=FakeEmbeddingProvider(8,fail_above_batch=2);v,used=p.encode_dense(["a","b","c"],8);assert v.shape==(3,8) and used==2
    fields=EmbeddingRecord.__dataclass_fields__;assert "embedding_id" in fields and "vector_index" in fields and "warnings" in fields
