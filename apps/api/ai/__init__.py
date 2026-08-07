"""Legacy API AI modules with access to repository-level AI packages."""
from pathlib import Path

_root_ai = Path(__file__).resolve().parents[3] / "ai"
if _root_ai.is_dir() and str(_root_ai) not in __path__:
    __path__.insert(0, str(_root_ai))
