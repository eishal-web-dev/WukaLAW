from ai.rag.context_builder import build_context
from ai.rag.citation_builder import build_citations
from ai.retrieval.models import LegalSearchResult


def result(cid="chunk-1", text="Article 14 protects equality.", score=.9):
    return LegalSearchResult(1, score, cid, [cid], "doc-1", "Example v State", "case.txt", "dataset-a", "judgment", "Supreme Court", "national", "constitutional", "ABC/2020", "paragraph", None, None, "14", "en", text, None, ["2020 SCMR 1"], ["Constitution"], [], ["14"], [], {}, [])


def test_ranks_and_removes_duplicate_text():
    items = build_context([result("low", score=.2), result("high", score=.9), result("copy", score=.8)])
    assert [item.citation.chunk_id for item in items] == ["high"]
    assert items[0].text == "Article 14 protects equality."


def test_budget_is_respected_without_rewriting():
    text = "short evidence"
    items = build_context([result(text=text)], token_budget=4)
    assert items[0].text == text
    assert sum(item.token_count for item in items) <= 4


def test_citation_fields_and_duplicate_citation_ids():
    citations = build_citations([result("a"), result("b", text="different")])
    assert [c.id for c in citations] == ["C1", "C2"]
    assert citations[0].source_dataset == "dataset-a"
    assert citations[0].law_article == ["Constitution", "14"]
