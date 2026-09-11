"""Shared setup for the repository-root AI/RAG test suite.

These tests exercise the top-level ``ai`` package (RAG pipeline, similar-case
search, retrieval, vector store). They use deterministic fake embeddings and a
fake NLI heuristic so the suite runs fast with no model downloads or network —
the same approach as ``apps/api/tests``. Set here so both a bare
``pytest tests/`` and CI behave identically without extra flags.
"""
import os

os.environ.setdefault("FAKE_EMBEDDINGS", "1")
os.environ.setdefault("FAKE_NLI", "1")
