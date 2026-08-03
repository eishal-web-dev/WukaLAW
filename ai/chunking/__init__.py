"""WakuLAW deterministic legal-aware chunking package."""
from .legal_chunker import ChunkingConfig, chunk_document
from .models import LegalChunk
__all__ = ["ChunkingConfig", "LegalChunk", "chunk_document"]
