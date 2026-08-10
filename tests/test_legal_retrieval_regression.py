from ai.evaluation.legal_regression import evaluate_gold_item, evaluate_gold_set

def test_correct_legal_domain_and_term_coverage():
    item = {"query_id":"family","expected_terms":["maintenance","custody"]}
    rows = [{"document_id":"f1","case_category":"Family Law","text_preview":"maintenance and custody dispute"}]
    result = evaluate_gold_item(item, rows)
    assert result["domain_correct"] is True
    assert result["required_term_coverage"] == 1.0

def test_clearly_wrong_top_domain_fails_regression():
    item = {"query_id":"family","expected_terms":["maintenance","custody"]}
    rows = [{"document_id":"t1","case_category":"Tax Revenue","text_preview":"income tax assessment"}]
    result = evaluate_gold_item(item, rows)
    assert result["domain_correct"] is False
    assert result["required_term_coverage"] == 0.0

def test_exact_document_metrics_when_ground_truth_exists():
    item = {"query_id":"bail","expected_terms":["bail"],"expected_document_ids":["wanted"]}
    rows = [
        {"document_id":"other","text_preview":"bail refused"},
        {"document_id":"wanted","text_preview":"bail granted"},
    ]
    result = evaluate_gold_item(item, rows)
    assert result["recall_at_5"] == 1.0
    assert result["reciprocal_rank"] == 0.5

def test_semantic_fixture_omits_unmeasured_doc_metrics():
    summary = evaluate_gold_set(
        [{"query_id":"civil","expected_terms":["property"]}],
        {"civil":[{"document_id":"x","text_preview":"property possession"}]},
    )
    assert summary["domain_accuracy"] == 1.0
    assert summary["recall_at_5"] is None
    assert summary["mrr"] is None
