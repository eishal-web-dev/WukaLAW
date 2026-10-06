from types import SimpleNamespace
from unittest.mock import MagicMock

from fastapi import HTTPException

from app.routers import precedent_briefs
from ai.qa import rag as qa_rag
from ai.rag.llm_provider import FakeLLMProvider, FallbackLLMProvider


def test_assigned_client_can_open_precedent_brief_case():
    case = SimpleNamespace(owner_id=10, client_id=20)
    db = MagicMock()
    db.get.return_value = case
    user = SimpleNamespace(id=20, role="client")

    assert precedent_briefs._owned_case(db, 7, user) is case


def test_unrelated_client_cannot_open_precedent_brief_case():
    case = SimpleNamespace(owner_id=10, client_id=20)
    db = MagicMock()
    db.get.return_value = case
    user = SimpleNamespace(id=21, role="client")

    try:
        precedent_briefs._owned_case(db, 7, user)
    except HTTPException as exc:
        assert exc.status_code == 404
    else:
        raise AssertionError("An unrelated client must not access the case")


def test_lawyer_and_admin_can_open_ownerless_case_precedent_brief():
    case = SimpleNamespace(owner_id=None, client_id=None)
    db = MagicMock()
    db.get.return_value = case

    for role in ("lawyer", "admin"):
        user = SimpleNamespace(id=21, role=role)
        assert precedent_briefs._owned_case(db, 7, user) is case


def test_full_source_reads_private_supabase_storage_first(monkeypatch):
    monkeypatch.setattr(precedent_briefs.settings, "supabase_url", "https://project.supabase.co")
    monkeypatch.setattr(precedent_briefs.settings, "supabase_service_role_key", "server-secret")
    monkeypatch.setattr(precedent_briefs.settings, "supabase_legal_bucket", "wakulaw-documents")
    captured = {}

    class Response:
        content = b"Full Pakistani judgment text"

        @staticmethod
        def raise_for_status():
            return None

    def fake_get(url, *, headers, timeout):
        captured.update(url=url, headers=headers, timeout=timeout)
        return Response()

    monkeypatch.setattr(precedent_briefs.httpx, "get", fake_get)

    text, key = precedent_briefs._full_source_text(
        "datasets/raw/labeled_cases/Labeled Data/Family Law Cases/example.txt"
    )

    assert text == "Full Pakistani judgment text"
    assert key == "datasets/raw/labeled_cases/Labeled Data/Family Law Cases/example.txt"
    assert "/storage/v1/object/authenticated/wakulaw-documents/" in captured["url"]
    assert captured["headers"]["Authorization"] == "Bearer server-secret"


def test_precedent_generation_uses_settings_backed_assistant_providers(monkeypatch):
    first = FakeLLMProvider("first")
    second = FakeLLMProvider("second")
    monkeypatch.setattr(
        qa_rag,
        "_configured_providers",
        lambda: iter((("groq", first), ("ollama", second))),
    )

    provider = precedent_briefs._generation_provider()

    assert isinstance(provider, FallbackLLMProvider)
    assert [name for name, _ in provider.providers] == ["groq", "ollama"]


def test_provider_outage_brief_never_invents_case_facts():
    result = precedent_briefs._provider_outage_brief(
        SimpleNamespace(
            title="A v B", case_number="C.A. 1/2020",
            court="Supreme Court of Pakistan",
            explicit_outcome_phrase="appeal was allowed",
            laws_cited=["Family Courts Act"], sections_cited=[], articles_cited=[],
        ),
        has_substantive_client_issue=True,
    )

    assert result["final_decision"] == "appeal was allowed"
    assert result["background_facts"] == []
    assert result["argument_to_consider"] == []
    assert result["key_laws"] == ["Family Courts Act"]
