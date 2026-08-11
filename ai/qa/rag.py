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
from ai.preprocessing.sentences import split_sentences
from app.config import settings

NOT_ENOUGH = (
    "Not enough information in the uploaded documents to answer this question reliably. "
    "Try uploading a document that covers this topic, or rephrase the question."
)

_STOPWORDS = frozenset(
    "the a an and or but was were is are be been did does do has have had for that this "
    "with from what who whom whose why how when where which will would can could shall "
    "should may might must not into onto about their there they them his her its our".split()
)


def _content_terms(text: str) -> set[str]:
    return {
        word
        for word in re.findall(r"[a-z]+", text.lower())
        if len(word) >= 3 and word not in _STOPWORDS
    }


_INTERROGATIVES = frozenset(
    "what who whom whose why how when where which did does do is are was were can "
    "could should would will shall list explain tell describe compare summarize state".split()
)

VAGUE_MESSAGE = (
    "Your query is too short for a reliable answer — a single word or vague phrase "
    "could mean many things, and I don't make assumptions. Please ask a specific "
    "question, for example: \"What was the outcome of the appeal?\" or \"Which sections "
    "of law were discussed in <case name>?\""
)


_LIBRARY_PATTERNS = re.compile(
    r"how many (of (my|our) )?(docs|documents|files)"
    r"|(list|show)\b.{0,30}\b(docs|documents|files)"
    r"|which (docs|documents|files)"
    r"|what (are|do) (my|our|the|these) (docs|documents|files)( about)?\s*\??$"
    r"|(docs|documents|files) (do (i|we) have|i have|we have)",
    re.IGNORECASE,
)


def is_library_question(question: str) -> bool:
    """Questions about the document collection itself, not its contents."""
    return bool(_LIBRARY_PATTERNS.search(question))


def classify_query(question: str) -> str:
    """'vague' | 'lookup' | 'question'.

    - vague: too little content to search on (e.g. "Justice")
    - lookup: keyword/name search, not a question (e.g. "Justice Hashim Khan Kakar")
    - question: an actual answerable question
    """
    words = question.strip().split()
    terms = _content_terms(question)
    if len(words) <= 1 or len(terms) == 0:
        return "vague"
    if "?" in question or any(word.lower().strip("?.,") in _INTERROGATIVES for word in words):
        return "question"
    if len(words) <= 8:
        return "lookup"
    return "question"


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
    """Free fallback: pick the sentences across contexts closest to the question.

    Hybrid sentence scoring: semantic similarity PLUS an exact-term overlap
    boost, so a question naming "Justice Kakar" surfaces the sentences that
    actually mention Kakar instead of generic look-alike passages.
    """
    sentences: list[str] = []
    for context in contexts:
        sentences.extend(split_sentences(context))
    if not sentences:
        return NOT_ENOUGH

    question_vec = embed([question])
    sentence_vecs = embed(sentences)
    semantic = (sentence_vecs @ question_vec.T).ravel()

    query_terms = _content_terms(question)
    overlap = np.array(
        [
            len(query_terms & _content_terms(sentence)) / max(1, len(query_terms))
            for sentence in sentences
        ]
    )
    combined = semantic + 0.6 * overlap

    top = np.argsort(-combined)[:3]
    picked = [_truncate_words(sentences[i], 60) for i in sorted(top)]
    answer = "Based on the most relevant passages in your documents: " + " ".join(picked)
    return _truncate_words(answer, 150)


def _truncate_words(text: str, limit: int) -> str:
    words = text.split()
    if len(words) <= limit:
        return text
    return " ".join(words[:limit]) + " …"


def lookup_overview(
    phrase: str, documents_with_hits: list[str], best_sentences: list[str]
) -> str:
    """Answer for keyword/name lookups: what it is + where it appears + how to ask."""
    documents_list = "\n".join(f"• {title}" for title in documents_with_hits)
    context = " ".join(_truncate_words(s, 40) for s in best_sentences[:2])
    intro = f"Here is the most relevant context: {context}\n\n" if context else ""
    return (
        f'"{phrase}" looks like a name or keyword rather than a question.\n\n'
        f"{intro}"
        f"It appears in {len(documents_with_hits)} of your document(s):\n{documents_list}\n\n"
        f'For a focused answer, ask a specific question — e.g. "What role did '
        f'{phrase} play in the case?" or "What did the court decide about {phrase}?"'
    )


def best_matching_sentences(phrase: str, contexts: list[str], limit: int = 2) -> list[str]:
    """Sentences that literally contain the phrase terms, most complete first."""
    terms = _content_terms(phrase)
    if not terms:
        return []
    scored: list[tuple[int, str]] = []
    for context in contexts:
        for sentence in split_sentences(context):
            hits = len(terms & _content_terms(sentence))
            if hits:
                scored.append((hits, sentence))
    scored.sort(key=lambda pair: -pair[0])
    return [sentence for _, sentence in scored[:limit]]


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
