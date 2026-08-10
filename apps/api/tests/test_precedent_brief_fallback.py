from ai.similar_cases.brief_fallback import build_extractive_brief

def test_extractive_brief_preserves_explicit_record_and_never_aligns_client():
    text = (
        "The appeal was filed before the High Court. "
        "The question was whether section 302 PPC applied. "
        "The court observed that the supplied evidence was incomplete. "
        "The appeal was dismissed."
    )
    result = build_extractive_brief(text, [], has_substantive_client_issue=True)
    assert result["brief_source"] == "extractive"
    assert "appeal was dismissed" in result["final_decision"].lower()
    assert result["client_effect"] == "insufficient_client_facts"
    assert result["argument_to_consider"] == []
    assert "missing context is not inferred" in result["evidence_limitations"]

def test_provider_failure_returns_extractive_brief(monkeypatch):
    from types import SimpleNamespace
    from app.routers import precedent_briefs

    row = SimpleNamespace(
        canonical_chunk_id="c1", source_path="judgments/case.txt",
        title="Earlier Case", court="Lahore High Court", case_number="A-1",
        text_preview="The appeal was filed. The issue was section 302 PPC. The appeal was dismissed.",
    )
    class Retriever:
        def search(self, _query): return [row]
    class LLM:
        def generate(self, _prompt): raise RuntimeError("provider unavailable")
    pipeline = SimpleNamespace(retriever=Retriever(), llm=LLM())
    monkeypatch.setattr("app.routers.rag.get_pipeline", lambda: pipeline)
    monkeypatch.setattr(precedent_briefs, "_full_source_text", lambda _path: (None, None))

    case = SimpleNamespace(id=1, owner_id=7, title="Client Case", case_type="Criminal", description="section 302 PPC alibi evidence")
    user = SimpleNamespace(id=7)
    class Rows:
        def all(self): return []
    class DB:
        def get(self, _model, _id): return case
        def scalars(self, _query): return Rows()

    result = precedent_briefs.precedent_brief(1, "doc-1", DB(), user)
    assert result["brief_source"] == "extractive"
    assert "appeal was dismissed" in result["final_decision"].lower()
    assert "provider unavailable" not in result["disclaimer"]
