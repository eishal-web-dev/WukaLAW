"""Budgeted, deduplicated context selection that never rewrites evidence."""
from __future__ import annotations

import hashlib
from ai.retrieval.models import LegalSearchResult
from .citation_builder import build_citation
from .models import ContextItem


def estimate_tokens(text: str) -> int:
    return max(1, (len(text) + 3) // 4)


def build_context(results: list[LegalSearchResult], token_budget: int = 4000) -> list[ContextItem]:
    if token_budget <= 0:
        raise ValueError("token_budget must be positive")
    selected: list[ContextItem] = []
    seen_ids: set[str] = set()
    seen_text: set[str] = set()
    used = 0
    for result in sorted(results, key=lambda item: (-item.score, item.rank)):
        text = result.text_preview
        digest = hashlib.sha256(" ".join(text.split()).casefold().encode("utf-8")).hexdigest()
        if not text.strip() or result.canonical_chunk_id in seen_ids or digest in seen_text:
            continue
        count = estimate_tokens(text)
        if used + count > token_budget:
            continue
        selected.append(ContextItem(text, result.score, build_citation(result, len(selected) + 1), count))
        seen_ids.add(result.canonical_chunk_id)
        seen_text.add(digest)
        used += count
    return selected
