"""Offline RAG smoke test; never calls a real LLM or vector store."""
from __future__ import annotations
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from ai.rag import FakeLLMProvider, RagPipeline


class EmptyRetriever:
    def search(self, query):
        return []


if __name__ == "__main__":
    result = RagPipeline(EmptyRetriever(), FakeLLMProvider()).run("What law applies to this case?")
    print(result.to_dict())
