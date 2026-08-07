"""Regression tests for the unified user-upload vector index."""

from ai.retrieval import index as vector_index


def test_upload_vector_search_is_owner_scoped():
    vector_index.reset_for_tests()
    vector_index.add_chunks(
        [101],
        ["alpha confidential family property dispute evidence"],
        owner_id=1,
        document_id=10,
        document_title="Owner One",
    )
    vector_index.add_chunks(
        [202],
        ["beta confidential criminal appeal witness testimony"],
        owner_id=2,
        document_id=20,
        document_title="Owner Two",
    )

    owner_one = vector_index.search("alpha confidential property", 5, owner_id=1)
    owner_two = vector_index.search("alpha confidential property", 5, owner_id=2)

    assert [chunk_id for chunk_id, _ in owner_one] == [101]
    assert all(chunk_id != 101 for chunk_id, _ in owner_two)


def test_upload_vector_index_accepts_multiple_adaptive_chunks():
    vector_index.reset_for_tests()
    ids = [1, 2, 3]
    texts = [
        "first section contract formation offer acceptance",
        "second section breach damages compensation remedy",
        "third section appeal limitation jurisdiction court",
    ]
    vector_index.add_chunks(ids, texts, owner_id=7, document_id=77, document_title="Large Upload")

    hits = vector_index.search("breach damages remedy", 3, owner_id=7)
    assert hits
    assert hits[0][0] in ids
