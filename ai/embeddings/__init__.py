"""Offline dense-embedding pipeline for WakuLAW."""
from .model_provider import FakeEmbeddingProvider, SentenceTransformerProvider
from .embedding_pipeline import generate_embeddings
__all__=["FakeEmbeddingProvider","SentenceTransformerProvider","generate_embeddings"]
