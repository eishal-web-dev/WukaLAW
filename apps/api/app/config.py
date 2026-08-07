from pathlib import Path

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    database_url: str = "sqlite:///./wakulaw.db"
    upload_dir: Path = Path("./uploads")
    storage_dir: Path = Path("./storage")
    max_upload_mb: int = 20
    max_s3_upload_mb: int = 512

    # One embedding stack for both the legal corpus and frontend uploads.
    embedding_model: str = "BAAI/bge-m3"
    embedding_device: str = "auto"
    embedding_batch_size: int = 8
    upload_qdrant_collection: str = "wakulaw_user_documents"
    fake_embeddings: bool = False  # deterministic in-memory embeddings for tests/CI
    fake_nli: bool = False  # deterministic contradiction heuristic for fast tests/CI

    # AWS/S3. boto3 uses its standard credential chain: IAM task/instance role
    # in AWS, and AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY for local development.
    aws_region: str = "ap-south-1"
    aws_s3_bucket: str = ""
    aws_s3_endpoint_url: str | None = None
    aws_presign_expiry_seconds: int = 900

    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "qwen2.5:3b"

    # auth — override SECRET_KEY in .env for anything beyond local development
    secret_key: str = "dev-only-change-me"
    token_expire_hours: int = 24 * 7

    # Explicit values are retained for backwards-compatible experiments; normal
    # uploads use the adaptive chunker without forcing these values.
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
