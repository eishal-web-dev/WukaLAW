FROM python:3.12-slim

WORKDIR /app

# faiss needs libgomp at runtime
RUN apt-get update && apt-get install -y --no-install-recommends libgomp1 curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
# CPU-only torch first: the default wheel drags in multi-GB CUDA libraries
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu \
    && pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY ai ./ai
COPY pytest.ini .
COPY tests ./tests

EXPOSE 8000

HEALTHCHECK --interval=15s --timeout=3s --start-period=30s \
    CMD curl -sf http://localhost:8000/api/v1/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
