"""Contradiction detection across a case's documents.

Two-stage, free and local:
1. Candidate pairing — sentences from DIFFERENT documents that share enough
   content terms (talking about the same thing). Caps keep it fast.
2. NLI scoring — a small cross-encoder classifies each pair
   (contradiction / entailment / neutral). With FAKE_NLI=1 (tests) a
   deterministic negation heuristic replaces the model.

Prototype-quality by design: catches clear conflicts, misses subtle ones —
stated honestly in the UI and ethics docs.
"""

import re
from dataclasses import dataclass

from ai.preprocessing.sentences import split_sentences
from ai.qa.rag import _content_terms
from app.config import settings

MAX_SENTENCES_PER_DOC = 80
MIN_SHARED_TERMS = 3
MAX_PAIRS = 150
MAX_RESULTS = 20
CONTRADICTION_THRESHOLD = 0.65

_NEGATIONS = re.compile(r"\b(not|no|never|denied|denies|without|refused|rejected)\b", re.I)

_model = None


@dataclass
class Sentence:
    document_id: int
    document_title: str
    text: str


def _fake_score(a: str, b: str) -> float:
    """Deterministic test heuristic: same topic + opposite polarity = contradiction."""
    negated_a = bool(_NEGATIONS.search(a))
    negated_b = bool(_NEGATIONS.search(b))
    return 0.9 if negated_a != negated_b else 0.05


def _model_scores(pairs: list[tuple[str, str]]) -> list[float]:
    global _model
    if _model is None:
        from sentence_transformers import CrossEncoder

        _model = CrossEncoder("cross-encoder/nli-deberta-v3-xsmall")
    import numpy as np

    logits = _model.predict(pairs)  # columns: [contradiction, entailment, neutral]
    exp = np.exp(logits - logits.max(axis=1, keepdims=True))
    probabilities = exp / exp.sum(axis=1, keepdims=True)
    return [float(p[0]) for p in probabilities]


def find_contradictions(documents: list[tuple[int, str, str]]) -> list[dict]:
    """documents: [(document_id, title, text)] -> scored contradiction pairs."""
    sentences: list[Sentence] = []
    for document_id, title, text in documents:
        for sentence_text in split_sentences(text)[:MAX_SENTENCES_PER_DOC]:
            sentences.append(Sentence(document_id, title, sentence_text))

    candidates: list[tuple[Sentence, Sentence]] = []
    for i, first in enumerate(sentences):
        for second in sentences[i + 1 :]:
            if first.document_id == second.document_id:
                continue
            shared = _content_terms(first.text) & _content_terms(second.text)
            if len(shared) >= MIN_SHARED_TERMS:
                candidates.append((first, second))
                if len(candidates) >= MAX_PAIRS:
                    break
        if len(candidates) >= MAX_PAIRS:
            break

    if not candidates:
        return []

    if settings.fake_nli:
        scores = [_fake_score(a.text, b.text) for a, b in candidates]
    else:
        scores = _model_scores([(a.text, b.text) for a, b in candidates])

    results = [
        {
            "a": {"document_id": a.document_id, "document_title": a.document_title, "text": a.text},
            "b": {"document_id": b.document_id, "document_title": b.document_title, "text": b.text},
            "score": round(score, 3),
        }
        for (a, b), score in zip(candidates, scores)
        if score >= CONTRADICTION_THRESHOLD
    ]
    results.sort(key=lambda pair: -pair["score"])
    return results[:MAX_RESULTS]
