import pytest
from ai.legal_intelligence.intent_classifier import classify_intent
from ai.legal_intelligence.models import Intent


@pytest.mark.parametrize("text,expected", [
    ("Should I sue my employer?", Intent.LEGAL_ADVICE),
    ("What does section 12 say?", Intent.LAW_LOOKUP),
    ("Find similar cases", Intent.SIMILAR_CASE),
    ("Explain this judgment", Intent.DOCUMENT_EXPLANATION),
    ("How can I file a court complaint?", Intent.LEGAL_PROCEDURE),
    ("Draft a legal notice", Intent.DOCUMENT_GENERATION),
    ("Is this evidence admissible?", Intent.EVIDENCE_QUESTION),
    ("Can I appeal this order?", Intent.APPEAL),
    ("Can we settle through mediation?", Intent.SETTLEMENT),
    ("What are my rights?", Intent.RIGHTS),
    ("What duties am I required to perform?", Intent.OBLIGATIONS),
    ("weather tomorrow", Intent.UNKNOWN),
])
def test_intents(text, expected): assert classify_intent(text).intent == expected
