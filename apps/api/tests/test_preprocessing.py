from ai.preprocessing.chunk import chunk_text, choose_chunk_plan
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


def test_adaptive_plan_scales_with_document_size():
    small = choose_chunk_plan(500)
    medium = choose_chunk_plan(5_000)
    book = choose_chunk_plan(120_000)
    huge = choose_chunk_plan(300_000)

    assert small.size_band == "small"
    assert small.chunk_words < medium.chunk_words < book.chunk_words < huge.chunk_words
    assert small.overlap_words < medium.overlap_words < book.overlap_words < huge.overlap_words


def test_adaptive_chunk_count_grows_with_document_length_not_fixed_count():
    small_text = " ".join(f"small{i}" for i in range(600))
    book_text = " ".join(f"book{i}" for i in range(60_000))

    small_chunks = chunk_text(small_text)
    book_chunks = chunk_text(book_text)

    assert 1 < len(small_chunks) < 10
    assert len(book_chunks) > len(small_chunks) * 10
    assert len(book_chunks) != len(small_chunks)


def test_adaptive_mode_does_not_create_tiny_tail_chunk():
    plan = choose_chunk_plan(1_000)
    text = " ".join(f"word{i}" for i in range(plan.chunk_words + 5))
    chunks = chunk_text(text)

    assert len(chunks) == 1
