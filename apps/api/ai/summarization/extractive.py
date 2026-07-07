"""Structured extractive summarization for legal documents.

Free and deterministic: selects real sentences from the document using
embedding centrality (how representative a sentence is of the whole
document) plus legal-domain keyword heuristics. No text is generated,
so nothing can be hallucinated.
"""

import re

import numpy as np

from ai.embeddings.embedder import embed

_SENTENCE_SPLIT = re.compile(r"(?<=[.!?])\s+(?=[A-Z0-9“\"'])")

_ISSUE_WORDS = re.compile(
    r"\b(whether|issue|question (of|for)|petition|appeal|application|prayed|challenge[ds]?)\b",
    re.IGNORECASE,
)
_LEGAL_REF = re.compile(
    r"\b(section|article|act|ordinance|rule|clause|p\.?p\.?c|cr\.?p\.?c|c\.?p\.?c|constitution|plD|scmr|ylr|mld)\b",
    re.IGNORECASE,
)
_OUTCOME_WORDS = re.compile(
    r"\b(dismissed|allowed|granted|rejected|convicted|acquitted|set aside|upheld|disposed|remanded|quashed|maintained)\b",
    re.IGNORECASE,
)

MAX_SENTENCES_CONSIDERED = 300


def _sentences(text: str) -> list[str]:
    parts = _SENTENCE_SPLIT.split(text.replace("\n", " "))
    return [s.strip() for s in parts if len(s.split()) >= 6][:MAX_SENTENCES_CONSIDERED]


def summarize(text: str) -> dict:
    sentences = _sentences(text)
    if not sentences:
        empty = "Not found in the document."
        return {
            "main_issue": empty,
            "key_facts": [],
            "legal_points": [],
            "outcome": empty,
            "short_summary": "The document contains too little text to summarize.",
        }

    vectors = embed(sentences)
    centroid = vectors.mean(axis=0, keepdims=True)
    centrality = (vectors @ centroid.T).ravel()
    ranked = list(np.argsort(-centrality))  # most representative first

    issue_idx = [i for i, s in enumerate(sentences) if _ISSUE_WORDS.search(s)]
    main_issue = sentences[issue_idx[0]] if issue_idx else sentences[ranked[0]]

    legal_points = [s for s in sentences if _LEGAL_REF.search(s)][:4]

    # outcome sentences usually appear near the end of a judgment
    outcome_idx = [i for i, s in enumerate(sentences) if _OUTCOME_WORDS.search(s)]
    outcome = sentences[outcome_idx[-1]] if outcome_idx else "Not found in the document."

    used = set(legal_points) | {main_issue, outcome}
    key_facts = [sentences[i] for i in ranked if sentences[i] not in used][:4]

    top = sorted(ranked[:5])  # keep document order for readability
    short_summary = " ".join(sentences[i] for i in top)

    return {
        "main_issue": main_issue,
        "key_facts": key_facts,
        "legal_points": legal_points,
        "outcome": outcome,
        "short_summary": short_summary,
    }
