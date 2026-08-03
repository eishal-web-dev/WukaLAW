from ai.rag.context_builder import build_context
from ai.rag.prompt_builder import build_prompt
from ai.rag.query_analyzer import analyze_query
from test_context_builder import result


def test_prompt_contains_required_sections_and_verbatim_evidence():
    context = build_context([result()])
    prompt = build_prompt(analyze_query("What does Article 14 protect?"), context)
    for heading in ("SYSTEM", "SAFETY RULES", "RETRIEVED LEGAL EVIDENCE", "CONVERSATION QUESTION", "REQUIRED RESPONSE FORMAT"):
        assert heading in prompt
    assert context[0].text in prompt
    assert "Never fabricate" in prompt
    assert "INSUFFICIENT_EVIDENCE" in prompt
