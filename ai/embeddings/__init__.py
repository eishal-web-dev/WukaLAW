from pathlib import Path
_legacy_subpackage = Path(__file__).resolve().parents[2] / "apps" / "api" / "ai" / "embeddings"
if _legacy_subpackage.is_dir() and str(_legacy_subpackage) not in __path__:
    __path__.append(str(_legacy_subpackage))

"""Offline dense-embedding pipeline for WakuLAW."""
from .model_provider import FakeEmbeddingProvider, SentenceTransformerProvider
from .embedding_pipeline import generate_embeddings
__all__=["FakeEmbeddingProvider","SentenceTransformerProvider","generate_embeddings"]
