from ai.embeddings.deduplication import add_record,text_hash
def item(cid,dataset="judgments",category=None,path="long/path/file",title=None):return {"chunk_id":cid,"text":"Exact legal text","duplicate_hash":"same","source_dataset":dataset,"case_category":category,"source_path":path,"title":title}
def test_labeled_useful_category_wins_and_all_ids_preserved():
    groups={};add_record(groups,item("z",title="rich"));add_record(groups,item("y","labeled_cases","Civil Appeals","x"));g=groups["same"]
    assert g.canonical_chunk_id=="y" and sorted(g.source_chunk_ids)==["y","z"]
def test_richer_then_shorter_then_lexical_preference():
    groups={};add_record(groups,item("z",path="longer/path"));add_record(groups,item("b",path="x",title="Title"));add_record(groups,item("a",path="x",title="Title"));assert groups["same"].canonical_chunk_id=="a"
def test_text_hash_normalizes_whitespace():assert text_hash("Legal  text\n") == text_hash(" legal text ")
