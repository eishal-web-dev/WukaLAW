from pathlib import Path
_legacy_subpackage = Path(__file__).resolve().parents[2] / "apps" / "api" / "ai" / "preprocessing"
if _legacy_subpackage.is_dir() and str(_legacy_subpackage) not in __path__:
    __path__.append(str(_legacy_subpackage))

