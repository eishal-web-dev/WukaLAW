from ai.preprocessing.chunk import chunk_text
from ai.preprocessing.clean import clean_text


def test_clean_removes_page_numbers_and_extra_whitespace():
    raw = "The  court   held.\n\n\n\n- 4 -\nPage 5\nThat the appeal\nis allowed."
    cleaned = clean_text(raw)
    assert "- 4 -" not in cleaned
    assert "Page 5" not in cleaned
    assert "  " not in cleaned


def test_clean_joins_hyphenated_words():
    assert "constitution" in clean_text("consti-\ntution")


def test_chunk_produces_overlapping_windows():
    words = " ".join(f"word{i}" for i in range(700))
    chunks = chunk_text(words, chunk_words=300, overlap_words=50)
    assert len(chunks) >= 2
    assert chunks[0].position == 0
    first = chunks[0].text.split()
    second = chunks[1].text.split()
    assert first[250:] == second[:50]  # overlap preserved


def test_chunk_empty_text():
    assert chunk_text("") == []
