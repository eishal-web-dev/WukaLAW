"""Extract raw text from uploaded documents."""

from pathlib import Path

from pypdf import PdfReader

SUPPORTED_EXTENSIONS = {".txt", ".pdf", ".docx", ".png", ".jpg", ".jpeg", ".webp", ".tif", ".tiff"}


def extract_text(path: Path) -> str:
    ext = path.suffix.lower()
    if ext == ".txt":
        return path.read_text(encoding="utf-8", errors="replace")
    if ext == ".pdf":
        reader = PdfReader(str(path))
        pages = [page.extract_text() or "" for page in reader.pages]
        return "\n".join(pages)
    if ext == ".docx":
        from docx import Document as WordDocument
        document = WordDocument(str(path))
        return "\n".join([*(paragraph.text for paragraph in document.paragraphs),
                          *(cell.text for table in document.tables for row in table.rows for cell in row.cells)])
    raise ValueError(f"Unsupported file type: {ext}. Supported: {sorted(SUPPORTED_EXTENSIONS)}")
