"""Create stable citations directly from retrieved chunks."""
from __future__ import annotations

from ai.retrieval.models import LegalSearchResult
from .models import Citation


def build_citation(result: LegalSearchResult, index: int) -> Citation:
    law_article = list(dict.fromkeys([*result.laws_cited, *result.articles_cited]))
    if result.article_number and result.article_number not in law_article:
        law_article.append(result.article_number)
    return Citation(
        id=f"C{index}", document_title=result.title, court=result.court,
        case_number=result.case_number, law_article=law_article,
        chunk_id=result.canonical_chunk_id, source_path=result.source_path,
        source_dataset=result.source_dataset,
    )


def build_citations(results: list[LegalSearchResult]) -> list[Citation]:
    return [build_citation(result, i) for i, result in enumerate(results, 1)]
