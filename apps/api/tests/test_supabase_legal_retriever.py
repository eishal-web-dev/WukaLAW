import numpy as np

from ai.retrieval.models import LegalSearchQuery
from ai.retrieval.supabase_retriever import SupabaseLegalRetriever, normalize_supabase_project_url


class Provider:
    calls = 0

    def encode_dense(self, texts, batch_size, normalize):
        self.calls += 1
        return np.ones((len(texts), 1024), dtype=np.float32), {}


class Response:
    def raise_for_status(self):
        return None

    def json(self):
        return [{
            "canonical_chunk_id": "chunk-1", "document_id": "doc-1",
            "title": "A v B", "source_path": "datasets/raw/case.txt",
            "source_dataset": "supabase-storage", "court": "Supreme Court of Pakistan",
            "jurisdiction": "Pakistan", "case_category": "Civil Appeals",
            "case_number": "C.A. 1/2020", "chunk_type": "judgment",
            "text_preview": "The appeal was allowed.",
            "explicit_outcome_phrase": "appeal was allowed", "similarity": 0.81,
            "legal_citations": [], "laws_cited": [], "sections_cited": [],
            "articles_cited": [], "metadata": {"decision_date": "2020-01-01"},
        }]


def test_supabase_retriever_maps_rpc_rows(monkeypatch):
    captured = {}

    def fake_post(url, **kwargs):
        captured.update(url=url, body=kwargs["json"], headers=kwargs["headers"])
        return Response()

    monkeypatch.setattr("ai.retrieval.supabase_retriever.httpx.post", fake_post)
    retriever = SupabaseLegalRetriever("https://example.supabase.co", "secret", Provider())
    rows = retriever.search(LegalSearchQuery("dower recovery", top_k=5, jurisdictions=["Pakistan"]))

    assert captured["url"].endswith("/rest/v1/rpc/match_legal_judgments")
    assert captured["body"]["match_count"] == 20
    assert captured["headers"]["Authorization"] == "Bearer secret"
    assert len(rows) == 1
    assert rows[0].score == 0.81
    assert rows[0].explicit_outcome_phrase == "appeal was allowed"
    assert rows[0].payload["decision_date"] == "2020-01-01"


def test_exact_document_lookup_does_not_use_semantic_rpc(monkeypatch):
    captured = {}

    class ExactResponse:
        def raise_for_status(self):
            return None

        def json(self):
            return [{
                "canonical_chunk_id": "selected-chunk",
                "document_id": "selected-document",
                "title": "1272 C.A supreme (2142)",
                "source_path": "datasets/raw/family/1272.txt",
                "source_dataset": "supabase-storage",
                "court": "Supreme Court of Pakistan",
                "jurisdiction": "Pakistan",
                "case_category": "Family Law Cases",
                "chunk_type": "judgment",
                "text_content": "The complete selected judgment passage.",
                "text_preview": "short preview",
                "legal_citations": [], "laws_cited": [], "sections_cited": [],
                "articles_cited": [], "metadata": {"chunk_number": 0},
            }]

    def fake_get(url, **kwargs):
        captured.update(url=url, params=kwargs["params"], headers=kwargs["headers"])
        return ExactResponse()

    monkeypatch.setattr("ai.retrieval.supabase_retriever.httpx.get", fake_get)
    provider = Provider()
    retriever = SupabaseLegalRetriever("https://example.supabase.co", "secret", provider)

    rows = retriever.search(LegalSearchQuery(
        "ignored semantic query", top_k=20, document_ids=["selected-document"]
    ))

    assert captured["url"].endswith("/rest/v1/legal_judgment_chunks")
    assert captured["params"]["document_id"] == "eq.selected-document"
    assert provider.calls == 0
    assert len(rows) == 1
    assert rows[0].document_id == "selected-document"
    assert rows[0].title == "1272 C.A supreme (2142)"
    assert rows[0].text_preview == "The complete selected judgment passage."


def test_storage_s3_endpoint_is_normalized_to_project_data_api():
    assert normalize_supabase_project_url(
        "https://example.storage.supabase.co/storage/v1/s3"
    ) == "https://example.supabase.co"
