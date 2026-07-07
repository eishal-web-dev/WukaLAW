from pathlib import Path

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    database_url: str = "sqlite:///./wakulaw.db"
    upload_dir: Path = Path("./uploads")
    storage_dir: Path = Path("./storage")
    max_upload_mb: int = 20

    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    fake_embeddings: bool = False  # deterministic hash embeddings for fast tests/CI

    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "llama3.2"

    # auth — override SECRET_KEY in .env for anything beyond local development
    secret_key: str = "dev-only-change-me"
    token_expire_hours: int = 24 * 7

    chunk_words: int = 300
    chunk_overlap_words: int = 50
    top_k: int = 5
    # cosine-similarity thresholds for confidence labels
    high_confidence: float = 0.55
    medium_confidence: float = 0.35
    min_answerable: float = 0.25

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
settings.upload_dir.mkdir(parents=True, exist_ok=True)
settings.storage_dir.mkdir(parents=True, exist_ok=True)
