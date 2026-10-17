FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# faiss needs libgomp at runtime; tesseract-ocr + poppler-utils power the
# scanned-PDF OCR fallback (ai/preprocessing/ocr.py)
RUN apt-get update && apt-get install -y --no-install-recommends libgomp1 curl tesseract-ocr tesseract-ocr-urd poppler-utils \
    && rm -rf /var/lib/apt/lists/*

COPY apps/api/requirements.txt ./requirements.txt
# CPU-only torch first: the default wheel drags in multi-GB CUDA libraries
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu \
    && pip install --no-cache-dir -r requirements.txt

# Preserve the same package layout used by local development. The API extends
# the repository-level ``ai`` package with legacy modules from apps/api/ai.
COPY ai ./ai
COPY apps/api/app ./apps/api/app
COPY apps/api/ai ./apps/api/ai
COPY apps/api/pytest.ini ./apps/api/pytest.ini
COPY apps/api/tests ./apps/api/tests

WORKDIR /app/apps/api

EXPOSE 8000

HEALTHCHECK --interval=15s --timeout=3s --start-period=30s \
    CMD curl -sf "http://localhost:${PORT:-8000}/api/v1/health" || exit 1

CMD ["sh", "-c", "exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
