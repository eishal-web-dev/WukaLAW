"""RAG assistant: strict refusal on weak evidence + conversation memory.

Behaviour (given/when/then):
- Given retrieved evidence that does not support the model's answer,
  When the pipeline runs, Then the user sees a refusal, not ungrounded text.
- Given a short referential follow-up and prior turns,
  When the pipeline runs, Then retrieval searches the resolved question and
  the prompt carries the conversation.
"""
from ai.rag.conversation import ChatTurn, contextualize_query, to_turns
from ai.rag.llm_provider import FakeLLMProvider
from ai.rag.models import ValidationStatus
from ai.rag.rag_pipeline import REFUSAL, RagPipeline
from ai.retrieval.models import LegalSearchResult


class FakeRetriever:
    def __init__(self, results):
        self.results = results
        self.queries = []

    def search(self, query):
        self.queries.append(query)
        return self.results


def hit(cid="c1", score=0.9, text="Bail may be granted in non-bailable offences."):
    return LegalSearchResult(
        1, score, cid, [cid], "d1", "Bail law", "x", "seed_statutes", "statute",
        "Legislature of Pakistan", "Pakistan", None, None, "body", None, None, None,
        "English", text, None, [], [], [], [], [], {}, [],
    )


# ---- contextualize_query (unit) ----

def test_short_referential_followup_is_resolved_against_history():
    history = [
        ChatTurn("user", "someone killed a person while driving, has bail been granted"),
        ChatTurn("ai", "Bail depends on the offence [C1]."),
    ]
    resolved = contextualize_query(history, "it was an accident")
    assert "driving" in resolved and "accident" in resolved


def test_standalone_question_is_left_untouched():
    history = [ChatTurn("user", "what is section 302")]
    q = "What is the punishment for bail under section 497 of the Criminal Procedure Code?"
    assert contextualize_query(history, q) == q


def test_contextualize_with_no_history_returns_question():
    assert contextualize_query([], "it was an accident") == "it was an accident"


def test_to_turns_coerces_dicts_and_drops_junk():
    turns = to_turns([{"role": "user", "content": "hi"}, {"role": "x", "content": "no"}, {"bad": 1}])
    assert turns == [ChatTurn("user", "hi")]


# ---- strict refusal (pipeline) ----

def test_insufficient_evidence_returns_refusal_not_padding():
    # Model invents an unknown citation [C7] -> validator flags INSUFFICIENT_EVIDENCE.
    llm = FakeLLMProvider("Bail generally varies by circumstances [C7].")
    out = RagPipeline(FakeRetriever([hit()]), llm).run(
        "in how many cases was bail granted for a driving death", use_legal_intelligence=False
    )
    assert out.validation.status == ValidationStatus.INSUFFICIENT_EVIDENCE
    assert out.answer == REFUSAL
    assert "varies by circumstances" not in out.answer  # padding suppressed


def test_no_evidence_returns_friendly_refusal():
    out = RagPipeline(FakeRetriever([]), FakeLLMProvider("unused")).run(
        "murder by a foreigner", use_legal_intelligence=False
    )
    assert out.validation.status == ValidationStatus.INSUFFICIENT_EVIDENCE
    assert out.answer == REFUSAL


# ---- conversation memory (pipeline) ----

def test_followup_retrieval_uses_conversation_and_prompt_carries_history():
    history = [{"role": "user", "content": "someone killed a person while driving, was bail granted"}]
    retriever = FakeRetriever([hit()])
    llm = FakeLLMProvider("Bail may be granted [C1].")
    out = RagPipeline(retriever, llm).run(
        "it was an accident", history=history, use_legal_intelligence=False
    )
    # retrieval searched the resolved follow-up, not just "it was an accident"
    assert "driving" in retriever.queries[0].query
    # the generation prompt includes the prior turn
    assert "CONVERSATION SO FAR" in llm.prompts[0]
    assert "driving" in llm.prompts[0]
    # the displayed question stays the user's actual words
    assert out.original_question == "it was an accident"
