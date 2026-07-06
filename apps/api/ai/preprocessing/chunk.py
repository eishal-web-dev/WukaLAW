"""Split cleaned text into overlapping word-window chunks."""

from dataclasses import dataclass


@dataclass
class TextChunk:
    position: int
    text: str


def chunk_text(text: str, chunk_words: int = 300, overlap_words: int = 50) -> list[TextChunk]:
    if overlap_words >= chunk_words:
        raise ValueError("overlap_words must be smaller than chunk_words")

    words = text.split()
    if not words:
        return []

    chunks: list[TextChunk] = []
    step = chunk_words - overlap_words
    position = 0
    for start in range(0, len(words), step):
        window = words[start : start + chunk_words]
        if len(window) < 20 and position > 0:  # skip tiny trailing fragment
            break
        chunks.append(TextChunk(position=position, text=" ".join(window)))
        position += 1
        if start + chunk_words >= len(words):
            break
    return chunks
