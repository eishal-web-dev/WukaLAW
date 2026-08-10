"""Conservative retrieval regression scoring over explicit domain/term constraints."""
from __future__ import annotations

def _result_text(row: dict) -> str:
    values = [
        row.get("title"), row.get("case_category"), row.get("text_preview"),
        " ".join(row.get("laws_cited") or []),
        " ".join(row.get("sections_cited") or []),
        " ".join(row.get("articles_cited") or []),
    ]
    return " ".join(str(value) for value in values if value).casefold()

def evaluate_gold_item(item: dict, results: list[dict], top_k: int = 5) -> dict:
    top = results[:top_k]
    expected_docs = set(item.get("expected_document_ids") or [])
    expected_patterns = [value.casefold() for value in item.get("expected_source_patterns") or []]
    terms = [value.casefold() for value in item.get("expected_terms") or []]
    first_rank = None
    term_hits: set[str] = set()
    domain_correct = False
    for rank, row in enumerate(top, 1):
        text = _result_text(row)
        term_hits.update(term for term in terms if term in text)
        if rank == 1:
            domain_correct = any(term in text for term in terms)
        document_match = row.get("document_id") in expected_docs if expected_docs else False
        source_match = any(pattern in str(row.get("source_path") or "").casefold() for pattern in expected_patterns)
        if first_rank is None and (document_match or source_match):
            first_rank = rank
    return {
        "query_id": item["query_id"],
        "domain_correct": domain_correct,
        "required_term_coverage": round(len(term_hits) / len(terms), 4) if terms else 1.0,
        "recall_at_5": 1.0 if first_rank is not None else (None if not (expected_docs or expected_patterns) else 0.0),
        "reciprocal_rank": round(1 / first_rank, 4) if first_rank else (None if not (expected_docs or expected_patterns) else 0.0),
        "top_result_document_id": top[0].get("document_id") if top else None,
    }

def evaluate_gold_set(items: list[dict], result_sets: dict[str, list[dict]]) -> dict:
    rows = [evaluate_gold_item(item, result_sets.get(item["query_id"], [])) for item in items]
    measurable = [row for row in rows if row["recall_at_5"] is not None]
    return {
        "queries": rows,
        "domain_accuracy": round(sum(row["domain_correct"] for row in rows) / len(rows), 4) if rows else 0.0,
        "mean_term_coverage": round(sum(row["required_term_coverage"] for row in rows) / len(rows), 4) if rows else 0.0,
        "recall_at_5": round(sum(row["recall_at_5"] for row in measurable) / len(measurable), 4) if measurable else None,
        "mrr": round(sum(row["reciprocal_rank"] for row in measurable) / len(measurable), 4) if measurable else None,
        "note": "Recall and MRR are omitted when the fixture has no exact document/source ground truth.",
    }
