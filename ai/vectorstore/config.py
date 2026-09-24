"""Environment-backed Qdrant configuration without secret defaults."""
from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import dotenv_values

PROJECT_ROOT = Path(__file__).resolve().parents[2]


def _config_value(name: str, default: str = "") -> str:
    """Use process overrides, then the API or repository .env used for local runs."""
    if name in os.environ:
        return os.environ[name]
    for filename in (PROJECT_ROOT / "apps" / "api" / ".env", PROJECT_ROOT / ".env"):
        if filename.is_file():
            value = dotenv_values(filename).get(name)
            if value is not None:
                return value
    return default


def _bool(value: str | None) -> bool:
    return str(value or "").casefold() in {"1", "true", "yes", "on"}


def _local_path_from_env() -> Path | None:
    raw = _config_value("QDRANT_LOCAL_PATH")
    if not raw:
        return None
    path = Path(raw).expanduser()
    if not path.is_absolute():
        path = PROJECT_ROOT / path
    return path.resolve()


@dataclass(frozen=True)
class QdrantSettings:
    url: str = "http://localhost:6333"
    api_key: str | None = None
    collection: str = "wakulaw_legal_chunks"
    timeout: int = 30
    prefer_grpc: bool = False
    local_path: Path | None = None

    @classmethod
    def from_env(cls, **overrides):
        values = {
            "url": _config_value("QDRANT_URL", "http://localhost:6333"),
            "api_key": _config_value("QDRANT_API_KEY") or None,
            "collection": _config_value("QDRANT_COLLECTION", "wakulaw_legal_chunks"),
            "timeout": int(_config_value("QDRANT_TIMEOUT", "30")),
            "prefer_grpc": _bool(_config_value("QDRANT_PREFER_GRPC")),
            "local_path": _local_path_from_env(),
        }
        values.update({key: value for key, value in overrides.items() if value is not None})
        return cls(**values)
