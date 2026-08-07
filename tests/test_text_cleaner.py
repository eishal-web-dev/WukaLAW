"""Tests for conservative TASK-003 legal-text cleaning."""

from ai.preprocessing.text_cleaner import clean_legal_text


def test_repairs_mojibake_and_removes_page_markers_without_losing_legal_tokens() -> None:
    raw = (
        "Page 1 of 2\nThe Courtâ€™s order under Section 12-A and Article 199.\n"
        "C.P. No. 42/2023, PLD 2024 SC 15\nPage 2 of 2\nDated 14 March 2024"
    )
    cleaned, warnings = clean_legal_text(raw)
    assert "Court’s" in cleaned
    assert "Page 1 of 2" not in cleaned
    assert "Section 12-A" in cleaned
    assert "Article 199" in cleaned
    assert "C.P. No. 42/2023" in cleaned
    assert "PLD 2024 SC 15" in cleaned
    assert any(item.startswith("repaired_mojibake:") for item in warnings)


def test_repeated_boundary_header_is_removed_only_after_safe_detection() -> None:
    raw = "\n".join([
        "CONFIDENTIAL COPY", "Page 1 of 3", "Body one.",
        "CONFIDENTIAL COPY", "Page 2 of 3", "Body two.",
        "CONFIDENTIAL COPY", "Page 3 of 3", "Body three.",
    ])
    cleaned, warnings = clean_legal_text(raw)
    assert "CONFIDENTIAL COPY" not in cleaned
    assert all(f"Body {word}." in cleaned for word in ("one", "two", "three"))
    assert any(item.startswith("removed_repeated_headers_footers:") for item in warnings)
