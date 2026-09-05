from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class RegisterRequest(BaseModel):
    email: str = Field(min_length=5, max_length=255, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    name: str = Field(min_length=2, max_length=100)
    password: str = Field(min_length=8, max_length=128)
    role: Literal["client", "lawyer"] = "lawyer"


class LoginRequest(BaseModel):
    email: str
    password: str
    portal: Literal["client", "lawyer", "admin"] | None = None


class UserOut(BaseModel):
    id: int
    email: str
    name: str
    role: str = "lawyer"


class AuthResponse(BaseModel):
    token: str
    user: UserOut


class NotificationOut(BaseModel):
    id: int
    type: str
    title: str
    body: str
    action_url: str | None
    read: bool
    created_at: datetime


class NotificationList(BaseModel):
    items: list[NotificationOut]
    total: int
    unread: int


class NotificationUnreadCount(BaseModel):
    unread: int


class NotificationPreferences(BaseModel):
    in_app_enabled: bool


class NotificationPreferencesUpdate(BaseModel):
    in_app_enabled: bool


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
    ocr_used: bool = False


class DocumentOut(DocumentMeta):
    text: str
    summary: SummaryOut | None


class DocumentList(BaseModel):
    items: list[DocumentMeta]
    total: int


class CaseCreate(BaseModel):
    title: str = Field(min_length=3, max_length=255)
    case_type: str = Field(min_length=2, max_length=100)
    status: str | None = None
    priority: str | None = None
    description: str | None = Field(default=None, max_length=5000)
    deadline: str | None = Field(default=None, max_length=32)


class CaseUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=255)
    case_type: str | None = Field(default=None, min_length=2, max_length=100)
    status: str | None = None
    priority: str | None = None
    description: str | None = Field(default=None, max_length=5000)
    deadline: str | None = Field(default=None, max_length=32)
    client_id: int | None = None


class CaseOut(BaseModel):
    id: int
    case_number: str
    title: str
    case_type: str
    status: str
    priority: str
    description: str
    deadline: str | None
    num_documents: int
    created_at: datetime
    client_id: int | None = None
    client_name: str | None = None
    lawyer_name: str | None = None


class CaseList(BaseModel):
    items: list[CaseOut]
    total: int


class SummarizeResponse(BaseModel):
    document_id: int
    summary: SummaryOut


class AskRequest(BaseModel):
    question: str = Field(min_length=3, max_length=2000)
    case_id: int | None = None


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


class TimelineEventOut(BaseModel):
    date: str
    date_text: str
    text: str
    document_id: int
    document_title: str


class TimelineResponse(BaseModel):
    events: list[TimelineEventOut]


class CitationOut(BaseModel):
    type: str  # statute | constitution | case_law
    text: str
    context: str


class CitationsResponse(BaseModel):
    citations: list[CitationOut]


class ContradictionSide(BaseModel):
    document_id: int
    document_title: str
    text: str


class ContradictionPair(BaseModel):
    a: ContradictionSide
    b: ContradictionSide
    score: float


class ContradictionsResponse(BaseModel):
    pairs: list[ContradictionPair]
    documents_analyzed: int
    disclaimer: str


class AdminStatsOut(BaseModel):
    total_users: int
    total_cases: int
    total_documents: int
    active_cases: int


class AdminUserOut(BaseModel):
    id: int
    email: str
    name: str
    role: str
    created_at: str
    case_count: int
    document_count: int
