"""RAG question answering grounded in uploaded documents.

Pipeline: embed question -> FAISS top-k chunks -> confidence from cosine
scores -> answer generation.

Generation is tiered (always free):
1. If a local Ollama server is running, ask its model to answer USING ONLY
   the retrieved chunks.
2. Otherwise fall back to extractive answering: return the sentences from
   the retrieved chunks most similar to the question.

If retrieval confidence is below the answerable threshold, the system says
it does not have enough information instead of guessing.
"""

import re

import httpx
import numpy as np

from ai.embeddings.embedder import embed
from app.config import settings

NOT_ENOUGH = (
    "Not enough information in the uploaded documents to answer this question reliably. "
    "Try uploading a document that covers this topic, or rephrase the question."
)

_SENTENCE_SPLIT = re.compile(r"(?<=[.!?])\s+(?=[A-Z0-9“\"'])")


def confidence_from_score(best_score: float) -> tuple[str, str]:
    if best_score >= settings.high_confidence:
        return "high", f"Very relevant passages found (top similarity {best_score:.2f})."
    if best_score >= settings.medium_confidence:
        return "medium", f"Somewhat relevant passages found (top similarity {best_score:.2f})."
    return "low", f"Only weakly related passages found (top similarity {best_score:.2f})."


def _ollama_available() -> bool:
    try:
        response = httpx.get(f"{settings.ollama_base_url}/api/tags", timeout=2.0)
        return response.status_code == 200
    except httpx.HTTPError:
        return False


def _generate_with_ollama(question: str, contexts: list[str]) -> str | None:
    context_block = "\n\n---\n\n".join(contexts)
    prompt = (
        "You are a legal research assistant. Answer the question using ONLY the "
        "context passages below, which come from legal documents uploaded by the user. "
        "If the context does not contain the answer, say so plainly. Do not invent "
        "facts, citations, or case law. Keep the answer concise.\n\n"
        f"Context:\n{context_block}\n\nQuestion: {question}\n\nAnswer:"
    )
    try:
        response = httpx.post(
            f"{settings.ollama_base_url}/api/generate",
            json={"model": settings.ollama_model, "prompt": prompt, "stream": False},
            timeout=120.0,
        )
        response.raise_for_status()
        return response.json().get("response", "").strip() or None
    except httpx.HTTPError:
        return None


def _extractive_answer(question: str, contexts: list[str]) -> str:
    """Free fallback: pick the sentences across contexts closest to the question."""
    sentences: list[str] = []
    for context in contexts:
        sentences.extend(
            s.strip() for s in _SENTENCE_SPLIT.split(context.replace("\n", " "))
            if len(s.split()) >= 5
        )
    if not sentences:
        return NOT_ENOUGH
    question_vec = embed([question])
    sentence_vecs = embed(sentences)
    scores = (sentence_vecs @ question_vec.T).ravel()
    top = np.argsort(-scores)[:3]
    picked = [sentences[i] for i in sorted(top)]
    return (
        "Based on the most relevant passages in your documents: " + " ".join(picked)
    )


def answer(question: str, retrieved: list[tuple[str, float]]) -> tuple[str, str, str, str]:
    """retrieved: [(chunk_text, score)] sorted by score desc.

    Returns (answer_text, confidence_level, confidence_reason, model_name).
    """
    if not retrieved or retrieved[0][1] < settings.min_answerable:
        best = retrieved[0][1] if retrieved else 0.0
        level, reason = confidence_from_score(best)
        return NOT_ENOUGH, "low", reason, "none"

    contexts = [text for text, _ in retrieved]
    level, reason = confidence_from_score(retrieved[0][1])

    if _ollama_available():
        generated = _generate_with_ollama(question, contexts)
        if generated:
            return generated, level, reason, f"ollama/{settings.ollama_model}"

    return _extractive_answer(question, contexts), level, reason, "extractive-fallback"
