from pathlib import Path

import pytest

from scripts.download_datasets_from_s3 import _safe_destination


def test_dataset_key_maps_below_destination(tmp_path: Path):
    target = _safe_destination(
        tmp_path / "raw",
        "datasets/raw/judgments/case-1.pdf",
        "datasets/raw",
    )
    assert target == (tmp_path / "raw" / "judgments" / "case-1.pdf").resolve()


@pytest.mark.parametrize(
    "key",
    ["users/1/documents/private.pdf", "datasets/raw/../private.pdf"],
)
def test_dataset_download_rejects_outside_or_traversal_keys(tmp_path: Path, key: str):
    with pytest.raises(ValueError):
        _safe_destination(tmp_path / "raw", key, "datasets/raw")
