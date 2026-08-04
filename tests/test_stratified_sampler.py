import json
from ai.evaluation.stratified_sampler import sample_records
def rec(i,cat="Constitutional Cases",ctype="judgment_body",text="fundamental rights"):
 return {"chunk_id":f"c{i}","document_id":f"d{i//2}","duplicate_hash":f"h{i}","source_dataset":"judgments","document_type":"judgment","case_category":cat,"chunk_type":ctype,"language":"English","text":text}
def test_deterministic_document_first_sample(tmp_path):
 p=tmp_path/"c.jsonl";rows=[rec(i) for i in range(80)]+[rec(100,"Family Law Cases","outcome","dowry maintenance")];p.write_text("".join(json.dumps(x)+"\n" for x in rows));a,m=sample_records(p,40,42);b,_=sample_records(p,40,42);assert [x["chunk_id"] for x in a]==[x["chunk_id"] for x in b] and len(a)==40;assert max(sum(x["document_id"]==d for x in a) for d in {x["document_id"] for x in a})<=2
def test_duplicate_hash_and_headers_avoided(tmp_path):
 p=tmp_path/"c.jsonl";rows=[rec(1,ctype="case_header"),rec(2,ctype="reasoning")];rows.append({**rec(3),"duplicate_hash":"h2"});p.write_text("".join(json.dumps(x)+"\n" for x in rows));values,_=sample_records(p,2,1);assert len({x["duplicate_hash"] for x in values})==len(values);assert any(x["chunk_type"]=="reasoning" for x in values)
