from pathlib import Path
_legacy_subpackage = Path(__file__).resolve().parents[2] / "apps" / "api" / "ai" / "retrieval"
if _legacy_subpackage.is_dir() and str(_legacy_subpackage) not in __path__:
    __path__.append(str(_legacy_subpackage))

"""Traceable legal retrieval over Qdrant."""
from .models import LegalSearchQuery,LegalSearchResult
__all__=["LegalSearchQuery","LegalSearchResult","LegalRetriever"]


def __getattr__(name):
    """Avoid loading Qdrant/native dependencies for model-only consumers."""
    if name == "LegalRetriever":
        from .retriever import LegalRetriever
        return LegalRetriever
    raise AttributeError(name)
