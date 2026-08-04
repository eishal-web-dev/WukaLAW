from ai.evaluation.retrieval_dataset import build_query_set
def records(n=45):return [{"chunk_id":f"c{i}","document_id":f"d{i}","document_type":"law" if i%2 else "judgment","case_category":"Constitutional Cases" if i%2==0 else None,"title":f"Law title {i}","heading":f"Section {i}","text":f"constitutional equality provision unique{i}","laws_cited":[f"Act {i}"],"sections_cited":[str(i)],"articles_cited":[]} for i in range(n)]
def test_query_set_is_grounded_and_has_controls():
 q=build_query_set(records(),40);assert len(q)==40;assert all(x.query_id and x.difficulty in {"easy","medium","hard"} for x in q);assert all(x.relevant_chunk_ids for x in q[:-2]);assert not q[-1].relevant_chunk_ids
def test_query_ground_truth_exists():
 rs=records();ids={r["chunk_id"] for r in rs};assert all(set(q.relevant_chunk_ids)<=ids for q in build_query_set(rs,40))
