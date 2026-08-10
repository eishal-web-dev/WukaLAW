"""Adaptive document chunking for uploaded legal documents.

The default path chooses chunk size from the document's own length instead of
forcing every upload through one fixed window. Explicit ``chunk_words`` and
``overlap_words`` arguments remain supported for backwards compatibility and
tests.
"""

from dataclasses import dataclass


@dataclass
class TextChunk:
    position: int
    text: str


@dataclass(frozen=True)
class ChunkPlan:
    """Resolved chunking policy for a single document."""

    total_words: int
    chunk_words: int
    overlap_words: int
    min_tail_words: int
    size_band: str


def choose_chunk_plan(total_words: int) -> ChunkPlan:
    """Choose a deterministic chunking plan from document length.

    Small documents use tighter chunks for retrieval precision. Large books use
    larger, still embedding-safe chunks so chunk count grows with the document
    instead of exploding unnecessarily. The plan never targets a fixed number
    of chunks.
    """

    if total_words < 0:
        raise ValueError("total_words must be non-negative")

    if total_words <= 800:
        chunk_words, overlap_words, band = 220, 30, "small"
    elif total_words <= 3_000:
        chunk_words, overlap_words, band = 320, 45, "medium"
    elif total_words <= 15_000:
        chunk_words, overlap_words, band = 450, 65, "large"
    elif total_words <= 60_000:
        chunk_words, overlap_words, band = 650, 90, "very_large"
    elif total_words <= 200_000:
        chunk_words, overlap_words, band = 850, 120, "book"
    else:
        chunk_words, overlap_words, band = 1_000, 140, "huge_book"

    # Avoid a tiny orphan chunk at the end while keeping short documents intact.
    min_tail_words = max(20, chunk_words // 5)
    return ChunkPlan(total_words, chunk_words, overlap_words, min_tail_words, band)


def _word_windows(
    words: list[str],
    *,
    chunk_words: int,
    overlap_words: int,
    min_tail_words: int,
) -> list[TextChunk]:
    if chunk_words <= 0:
        raise ValueError("chunk_words must be positive")
    if overlap_words < 0 or overlap_words >= chunk_words:
        raise ValueError("overlap_words must be non-negative and smaller than chunk_words")
    if min_tail_words < 0:
        raise ValueError("min_tail_words must be non-negative")
    if not words:
        return []

    chunks: list[TextChunk] = []
    step = chunk_words - overlap_words
    position = 0

    for start in range(0, len(words), step):
        window = words[start : start + chunk_words]
        if len(window) < min_tail_words and position > 0:
            break
        chunks.append(TextChunk(position=position, text=" ".join(window)))
        position += 1
        if start + chunk_words >= len(words):
            break

    return chunks


def chunk_text(
    text: str,
    chunk_words: int | None = None,
    overlap_words: int | None = None,
) -> list[TextChunk]:
    """Split text into overlapping chunks.

    With no explicit sizes, the function automatically selects a document-size
    aware plan. Supplying ``chunk_words`` preserves the legacy fixed-window
    behaviour, which is useful for controlled experiments and older callers.
    """

    words = text.split()
    if not words:
        return []

    if chunk_words is None:
        if overlap_words is not None:
            raise ValueError("overlap_words requires chunk_words when overriding the adaptive plan")
        plan = choose_chunk_plan(len(words))
        if len(words) <= int(plan.chunk_words * 1.5):
            return [TextChunk(position=0, text=" ".join(words))]
        return _word_windows(
            words,
            chunk_words=plan.chunk_words,
            overlap_words=plan.overlap_words,
            min_tail_words=plan.min_tail_words,
        )

    resolved_overlap = 50 if overlap_words is None else overlap_words
    return _word_windows(
        words,
        chunk_words=chunk_words,
        overlap_words=resolved_overlap,
        min_tail_words=20,
    )
