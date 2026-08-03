"""Offline deterministic legal-intelligence analysis."""
from .models import Intent, Jurisdiction, Language, LegalDomain, LegalQuery
from .pipeline import analyze
__all__ = ["analyze", "Intent", "Jurisdiction", "Language", "LegalDomain", "LegalQuery"]
