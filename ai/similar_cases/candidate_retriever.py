"""Candidate retrieval and source-document profiling."""
from __future__ import annotations
import unicodedata
from ai.retrieval.models import LegalSearchQuery


def _readable(text: str) -> bool:
    """Reject obviously corrupted OCR/font-extraction passages.

    Pakistani judgments may legitimately contain Urdu, so this does not require
    ASCII. It rejects previews dominated by symbols/private-use glyphs while
    retaining normal Latin/Urdu letters, digits, punctuation and whitespace.
    """
    value = (text or "").strip()
    if len(value) < 30:
        return False
    sample = value[:3000]
    useful = 0
    bad = 0
    for char in sample:
        category = unicodedata.category(char)
        if char.isspace() or category[0] in {"L", "N", "P"}:
            useful += 1
        elif category == "Co" or category[0] == "S" or char == "�":
            bad += 1
        else:
            useful += 1
    total = max(1, useful + bad)
    return useful / total >= 0.78 and bad / total <= 0.20


class CandidateRetriever:
    def __init__(self, retriever):
        self.retriever = retriever

    def source_profile(self, document_id, seed):
        chunks = self.retriever.search(
            LegalSearchQuery(seed, top_k=50, document_types=["judgment"], document_ids=[document_id])
        )
        readable_chunks = [x for x in chunks if _readable(x.text_preview)]
        return readable_chunks, " ".join(x.text_preview for x in readable_chunks if x.text_preview).strip()

    def retrieve(self, query, exclude_document_id=None):
        results = self.retriever.search(query.to_search_query())
        return [
            x
            for x in results
            if x.document_type == "judgment"
            and x.document_id != exclude_document_id
            and exclude_document_id not in x.duplicate_sources
            and _readable(x.text_preview)
        ]
