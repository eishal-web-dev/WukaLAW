"""Compatibility bridge for launching FastAPI from ``apps/api``.

All AI implementations are canonical under the repository-root ``ai`` package.
This package contains no implementations and exposes only that canonical path.
"""
from pathlib import Path

_CANONICAL_AI = Path(__file__).resolve().parents[3] / "ai"
__path__[:] = [str(_CANONICAL_AI)]
