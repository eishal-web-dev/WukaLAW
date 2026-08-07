"""WakuLAW AI packages, including compatibility with the legacy API modules."""
from pathlib import Path

# The API historically kept ``ai.qa`` under apps/api. Extend this package's
# search path so root modules (retrieval/rag) and legacy modules can coexist.
_legacy_ai = Path(__file__).resolve().parents[1] / "apps" / "api" / "ai"
if _legacy_ai.is_dir() and str(_legacy_ai) not in __path__:
    __path__.append(str(_legacy_ai))
