"""RAG question answering grounded in uploaded documents.

Pipeline: embed question -> FAISS top-k chunks -> confidence from cosine
scores -> answer generation.

Generation uses the configured Gemini/Groq/OpenAI/Ollama provider chain.
The selected case record and conversation provide background, while verified
document chunks provide supporting evidence.

If retrieval confidence is below the answerable threshold, the system says
it does not have enough information instead of guessing.
"""

import logging
import re

import numpy as np

from ai.embeddings.embedder import embed
from ai.preprocessing.sentences import split_sentences
from ai.rag.llm_provider import GeminiProvider, GroqProvider, OllamaProvider, OpenAIProvider
from app.config import settings

logger = logging.getLogger(__name__)

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


def _answer_prompt(
    question: str,
    contexts: list[str],
    background_context: str | None = None,
    history: list[dict] | None = None,
) -> str:
    context_block = "\n\n---\n\n".join(contexts) or "No verified document passage was retrieved."
    background_block = (
        f"\n\nCase record background (not independent evidence):\n{background_context}"
        if background_context
        else ""
    )
    history_block = "\n".join(
        f"{'User' if turn.get('role') == 'user' else 'Assistant'}: {turn.get('content', '').strip()}"
        for turn in (history or [])[-8:]
        if turn.get("content", "").strip()
    )
    conversation_block = f"\n\nConversation so far:\n{history_block}" if history_block else ""
    return (
        "You are WukaLAW's client-facing legal information assistant. Give a direct, "
        "plain-language answer to the user's actual question. Synthesize the material; "
        "NEVER copy or merely repeat the case description or document passages. Address "
        "the user as 'you' and, when helpful, give concrete next steps or an evidence checklist.\n\n"
        "Evidence rules:\n"
        "- The selected case record, case description, timeline and conversation are the "
        "user's background/account. Attribute disputed facts with phrases such as 'you say' "
        "or 'according to your case record'; do not present them as proven.\n"
        "- Verified document passages are supporting evidence, but OCR text may contain errors.\n"
        "- Clearly distinguish allegations, document-supported facts, and anything still unknown.\n"
        "- Do not invent facts, Pakistani law, citations, court orders, outcomes or deadlines.\n"
        "- If the material cannot answer a point, identify exactly what is missing and explain "
        "what document, timeline entry or lawyer/court confirmation would resolve it.\n"
        "- Do not predict that the user will win. Keep the answer concise, empathetic and useful.\n\n"
        f"Document evidence:\n{context_block}{background_block}{conversation_block}"
        f"\n\nQuestion: {question}\n\nAnswer:"
    )


def _configured_providers():
    providers = {
        "gemini": lambda: GeminiProvider(settings.gemini_model, settings.gemini_api_key),
        "groq": lambda: GroqProvider(settings.groq_model, settings.groq_api_key),
        "openai": lambda: OpenAIProvider(settings.openai_model, settings.openai_api_key),
        "ollama": lambda: OllamaProvider(settings.ollama_model, settings.ollama_base_url),
    }
    selected = settings.rag_llm_provider.strip().casefold()
    names = (
        [part.strip().casefold() for part in settings.rag_llm_fallback_order.split(",") if part.strip()]
        if selected == "auto"
        else [selected]
    )
    for name in names:
        factory = providers.get(name)
        if factory is None:
            logger.warning("Ignoring unsupported RAG answer provider %s", name)
            continue
        if name == "gemini" and not settings.gemini_api_key:
            continue
        if name == "groq" and not settings.groq_api_key:
            continue
        if name == "openai" and not settings.openai_api_key:
            continue
        yield name, factory()


def _generate_answer(
    question: str,
    contexts: list[str],
    background_context: str | None,
    history: list[dict] | None,
) -> tuple[str | None, str]:
    prompt = _answer_prompt(question, contexts, background_context, history)
    for name, provider in _configured_providers():
        try:
            generated = provider.generate(prompt).strip()
        except Exception as exc:  # one failed provider must not break the case assistant
            logger.warning("Case answer provider %s failed: %s", name, exc)
            continue
        if generated:
            model = getattr(provider, "model", "configured")
            return generated, f"{name}/{model}"
    return None, "none"


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


def answer(
    question: str,
    retrieved: list[tuple[str, float]],
    *,
    background_context: str | None = None,
    history: list[dict] | None = None,
    search_question: str | None = None,
) -> tuple[str, str, str, str]:
    """retrieved: [(chunk_text, score)] sorted by score desc.

    Returns (answer_text, confidence_level, confidence_reason, model_name).
    """
    has_reliable_documents = bool(retrieved and retrieved[0][1] >= settings.min_answerable)
    if not has_reliable_documents and not background_context:
        best = retrieved[0][1] if retrieved else 0.0
        level, reason = confidence_from_score(best)
        return NOT_ENOUGH, "low", reason, "none"

    contexts = [text for text, _ in retrieved]
    best = retrieved[0][1] if retrieved else 0.0
    level, reason = confidence_from_score(best)
    if not has_reliable_documents:
        contexts = []
        level = "low"
        reason = "Answered from the selected case background; no sufficiently relevant verified document passage was found."

    generated, model = _generate_answer(question, contexts, background_context, history)
    if generated:
        return generated, level, reason, model

    if background_context:
        return NOT_ENOUGH, "low", "No configured answer-generation provider was available.", "none"
    return _extractive_answer(search_question or question, contexts), level, reason, "extractive-fallback"
