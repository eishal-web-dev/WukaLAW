import numpy as np
from ai.evaluation.retrieval_evaluator import evaluate,lexical_evaluate
from ai.embeddings.model_provider import FakeEmbeddingProvider
def test_dense_grouped_and_lexical_evaluation():
 p=FakeEmbeddingProvider(16);texts=["constitutional equality article","criminal bail evidence"];v,_=p.encode_dense(texts,2);records=[{"canonical_chunk_id":"c1","text_preview":texts[0],"title":"Constitution"},{"canonical_chunk_id":"c2","text_preview":texts[1],"title":"Bail"}];queries=[{"query_id":"q1","query":"constitutional equality","domain":"constitutional","difficulty":"easy","query_style":"exact_lookup","filtered":False,"relevant_chunk_ids":["c1"]}];out=evaluate(records,v,queries,p);assert out["overall"]["recall_at_1"]==1 and out["queries"][0]["first_relevant_rank"]==1;assert lexical_evaluate(records,queries)["recall_at_1"]==1
def test_failure_classification_absent():
 p=FakeEmbeddingProvider(8);v,_=p.encode_dense(["text"],1);q=[{"query_id":"q","query":"missing content","domain":"x","difficulty":"hard","query_style":"semantic","filtered":False,"relevant_chunk_ids":["absent"]}];out=evaluate([{"canonical_chunk_id":"c","text_preview":"text"}],v,q,p);assert out["queries"][0]["failure"]=="relevant content absent from sample"
