"""Shared setup for the repository-root AI/RAG test suite.

These tests exercise the top-level ``ai`` package (RAG pipeline, similar-case
search, retrieval, vector store). They use deterministic fake embeddings and a
fake NLI heuristic so the suite runs fast with no model downloads or network —
the same approach as ``apps/api/tests``. Set here so both a bare
``pytest tests/`` and CI behave identically without extra flags.
"""
import os
import sys
from pathlib import Path

# Put the repository root on sys.path so `import ai` resolves under a bare
# `pytest tests/` invocation (as CI runs it), not only `python -m pytest`,
# which adds the current directory automatically.
_REPO_ROOT = str(Path(__file__).resolve().parent.parent)
if _REPO_ROOT not in sys.path:
    sys.path.insert(0, _REPO_ROOT)

os.environ.setdefault("FAKE_EMBEDDINGS", "1")
os.environ.setdefault("FAKE_NLI", "1")
