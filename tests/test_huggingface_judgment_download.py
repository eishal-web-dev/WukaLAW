from pathlib import Path

from scripts.download_huggingface_judgments import download


def test_download_normalizes_rows_to_judgment_text(tmp_path: Path):
    def getter(url: str):
        if "/splits?" in url:
            return {"splits": [{"config": "default", "split": "train"}]}
        return {"rows": [
            {"row_idx": 7, "row": {"case_title": "A / B", "judgment": "Legal text " * 50}},
            {"row_idx": 8, "row": {"title": "empty", "text": "too short"}},
        ]}

    result = download("owner/data", tmp_path, limit=2, getter=getter)
    files = list(tmp_path.glob("*.txt"))
    assert result["downloaded"] == 1
    assert result["rejected"] == 1
    assert len(files) == 1
    assert files[0].name == "00007-A-B.txt"
    assert files[0].read_text(encoding="utf-8").startswith("Legal text")


def test_download_can_use_longest_unknown_text_field(tmp_path: Path):
    long_text = "Pakistan Supreme Court judgment paragraph. " * 20

    def getter(url: str):
        if "/splits?" in url:
            return {"splits": [{"config": "v1", "split": "test"}]}
        return {"rows": [{"row_idx": 0, "row": {"unknown_column": long_text}}]}

    result = download("owner/data", tmp_path, limit=1, getter=getter)
    assert result["downloaded"] == 1
    assert next(tmp_path.glob("*.txt")).read_text(encoding="utf-8") == long_text.strip()
