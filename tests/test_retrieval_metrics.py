from ai.evaluation.retrieval_metrics import aggregate,query_metrics
def test_metrics_exact_values():
 m,first=query_metrics(["a","x","b","z"],["a","b"]);assert first==1 and m["recall_at_1"]==.5 and m["recall_at_3"]==1 and m["mrr"]==1 and m["ndcg_at_5"]>0
def test_no_relevant_safe_and_aggregate():
 m,first=query_metrics(["a"],[]);assert first is None and not any(m.values());assert aggregate([{"x":1},{"x":0}])=={"x":.5}
