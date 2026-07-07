from datetime import datetime

from pydantic import BaseModel, Field


class RegisterRequest(BaseModel):
    email: str = Field(min_length=5, max_length=255, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    name: str = Field(min_length=2, max_length=100)
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    id: int
    email: str
    name: str


class AuthResponse(BaseModel):
    token: str
    user: UserOut


class SummaryOut(BaseModel):
    main_issue: str
    key_facts: list[str]
    legal_points: list[str]
    outcome: str
    short_summary: str


class DocumentMeta(BaseModel):
    id: int
    filename: str
    title: str
    size_bytes: int
    num_chunks: int
    created_at: datetime
    has_summary: bool


class DocumentOut(DocumentMeta):
    text: str
    summary: SummaryOut | None


class DocumentList(BaseModel):
    items: list[DocumentMeta]
    total: int


class SummarizeResponse(BaseModel):
    document_id: int
    summary: SummaryOut


class AskRequest(BaseModel):
    question: str = Field(min_length=3, max_length=2000)


class Source(BaseModel):
    document_id: int
    document_title: str
    chunk_id: int
    text: str
    score: float


class Confidence(BaseModel):
    level: str  # high | medium | low
    reason: str


class AskResponse(BaseModel):
    answer: str
    confidence: Confidence
    sources: list[Source]
    model: str


class SimilarRequest(BaseModel):
    query: str = Field(min_length=3, max_length=2000)
    top_k: int = Field(default=5, ge=1, le=20)


class SimilarResponse(BaseModel):
    results: list[Source]
