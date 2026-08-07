import pytest

from app.services.s3_storage import S3StorageError, assert_owned_key, new_object_key, owner_prefix


def test_s3_user_document_keys_are_owner_scoped():
    key = new_object_key(17, "Court Order 2026.pdf")
    assert key.startswith(owner_prefix(17))
    assert key.endswith("Court_Order_2026.pdf")
    assert_owned_key(17, key)


def test_s3_owner_cannot_complete_another_users_object():
    foreign_key = new_object_key(22, "private-case.pdf")
    with pytest.raises(S3StorageError, match="does not belong"):
        assert_owned_key(17, foreign_key)
