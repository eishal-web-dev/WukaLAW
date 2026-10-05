from scripts.index_supabase_legal_corpus import outcome
from scripts.index_supabase_legal_corpus import SupabaseCorpusIndexer


def test_indexer_normalizes_storage_s3_endpoint():
    indexer = SupabaseCorpusIndexer(
        "https://example.storage.supabase.co/storage/v1/s3",
        "test-key",
        "legal-files",
        object(),
    )
    try:
        assert indexer.url == "https://example.supabase.co"
    finally:
        indexer.client.close()


def test_outcome_detects_common_pakistani_dispositions():
    assert outcome("For the foregoing reasons, the appeal is hereby allowed.") == "the appeal is hereby allowed"
    assert outcome("Consequently, this petition stands dismissed.") == "petition stands dismissed"
    assert outcome("The suit is partly decreed with no order as to costs.") == "The suit is partly decreed"
    assert outcome("The impugned judgment is set aside.") == "impugned judgment is set aside"


def test_outcome_uses_final_disposition_not_recounted_earlier_order():
    text = "The earlier petition was dismissed. " + ("reasoning " * 50) + "The appeal is allowed."
    assert outcome(text) == "The appeal is allowed"
