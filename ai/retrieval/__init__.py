"""Traceable legal retrieval over Qdrant."""
from .models import LegalSearchQuery,LegalSearchResult
__all__=["LegalSearchQuery","LegalSearchResult","LegalRetriever"]


def __getattr__(name):
    """Avoid loading Qdrant/native dependencies for model-only consumers."""
    if name == "LegalRetriever":
        from .retriever import LegalRetriever
        return LegalRetriever
    raise AttributeError(name)
