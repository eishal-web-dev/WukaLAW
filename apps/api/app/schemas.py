from datetime import date, datetime
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
    created_at: datetime


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
    ocr_review_status: str | None = None


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


class CaseRequestCreate(BaseModel):
    """What a client submits to request a new case. Deliberately smaller
    than CaseCreate -- a client doesn't set status/priority/deadline,
    those are a lawyer's call once the request is reviewed and claimed."""
    title: str = Field(min_length=3, max_length=255)
    case_type: str = Field(min_length=2, max_length=100)
    description: str = Field(min_length=10, max_length=5000)


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


class ChatTurnInput(BaseModel):
    role: Literal["user", "ai", "assistant"]
    content: str = Field(min_length=1, max_length=10000)


class AskRequest(BaseModel):
    question: str = Field(min_length=3, max_length=2000)
    case_id: int | None = None
    history: list[ChatTurnInput] = Field(default_factory=list, max_length=40)


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
    document_id: int | None = None
    document_title: str | None = None
    event_id: int | None = None


class CaseEventCreate(BaseModel):
    date: date
    text: str = Field(min_length=3, max_length=5000)
    document_id: int | None = None


class CaseEventUpdate(BaseModel):
    date: date
    text: str = Field(min_length=3, max_length=5000)
    document_id: int | None = None


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


class ReportGenerateRequest(BaseModel):
    report_type: str = Field(default="case_summary")


class ReportOut(BaseModel):
    id: int
    case_id: int
    case_number: str
    report_type: str
    title: str
    created_at: datetime


class ReportDetailOut(ReportOut):
    content: str


class AdminRoleUpdate(BaseModel):
    role: Literal["client", "lawyer"]


class AdminCaseOut(BaseModel):
    id: int
    case_number: str
    title: str
    case_type: str
    status: str
    priority: str
    lawyer_name: str | None
    client_name: str | None
    document_count: int
    created_at: datetime


class AdminDocumentOut(BaseModel):
    id: int
    title: str
    filename: str
    owner_name: str
    case_number: str | None
    size_bytes: int
    ocr_used: bool
    has_summary: bool
    created_at: datetime


class AdminActivityOut(BaseModel):
    id: str
    kind: Literal["user", "case", "document"]
    title: str
    detail: str
    created_at: datetime


class AdminSystemOut(BaseModel):
    api_status: str
    database_backend: str
    storage_backend: str
    ai_provider: str
    ai_configured: bool
    embedding_model: str
    legal_retrieval_backend: str
    legal_corpus_configured: bool
    total_chunks: int
    notifications_enabled_users: int
    billing_configured: bool
    support_configured: bool
    cms_configured: bool
    backup_configured: bool


class BillingPlanWrite(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    monthly_price: int = Field(default=0, ge=0, le=100000000)
    currency: Literal["PKR", "USD", "GBP", "AED"] = "PKR"
    features: list[str] = Field(default_factory=list, max_length=50)
    active: bool = True


class BillingPlanOut(BillingPlanWrite):
    id: int
    created_at: datetime


class SupportTicketWrite(BaseModel):
    requester_email: str = Field(min_length=5, max_length=255)
    subject: str = Field(min_length=2, max_length=255)
    description: str = Field(min_length=2, max_length=20000)
    priority: Literal["Low", "Normal", "High", "Urgent"] = "Normal"
    status: Literal["Open", "In Progress", "Resolved", "Closed"] = "Open"


class SupportTicketOut(SupportTicketWrite):
    id: int
    created_at: datetime


class CmsPostWrite(BaseModel):
    title: str = Field(min_length=2, max_length=255)
    slug: str = Field(min_length=2, max_length=255, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    excerpt: str = Field(default="", max_length=2000)
    body: str = Field(min_length=2, max_length=100000)
    status: Literal["Draft", "Published", "Archived"] = "Draft"


class CmsPostOut(CmsPostWrite):
    id: int
    created_at: datetime
    updated_at: datetime


class OrganizerBase(BaseModel):
    case_id: int | None = None


class CalendarEventCreate(OrganizerBase):
    title: str = Field(min_length=2, max_length=255)
    starts_at: datetime
    ends_at: datetime | None = None
    event_type: str = Field(default="Meeting", max_length=32)
    location: str = Field(default="", max_length=255)
    notes: str = Field(default="", max_length=5000)


class CalendarEventUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=255)
    case_id: int | None = None
    starts_at: datetime | None = None
    ends_at: datetime | None = None
    event_type: str | None = Field(default=None, max_length=32)
    location: str | None = Field(default=None, max_length=255)
    notes: str | None = Field(default=None, max_length=5000)


class CalendarEventOut(CalendarEventCreate):
    id: int
    case_number: str | None = None
    case_title: str | None = None
    created_at: datetime


class LawyerTaskCreate(OrganizerBase):
    title: str = Field(min_length=2, max_length=255)
    status: Literal["To Do", "In Progress", "Review", "Done"] = "To Do"
    priority: Literal["Low", "Medium", "High", "Critical"] = "Medium"
    due_at: datetime | None = None
    notes: str = Field(default="", max_length=5000)


class LawyerTaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=255)
    case_id: int | None = None
    status: Literal["To Do", "In Progress", "Review", "Done"] | None = None
    priority: Literal["Low", "Medium", "High", "Critical"] | None = None
    due_at: datetime | None = None
    notes: str | None = Field(default=None, max_length=5000)


class LawyerTaskOut(LawyerTaskCreate):
    id: int
    case_number: str | None = None
    case_title: str | None = None
    created_at: datetime


class HearingCreate(BaseModel):
    case_id: int
    title: str = Field(min_length=2, max_length=255)
    scheduled_at: datetime
    court: str = Field(min_length=2, max_length=255)
    judge: str = Field(default="", max_length=255)
    hearing_type: str = Field(default="Hearing", max_length=64)
    status: Literal["Scheduled", "Completed", "Adjourned", "Cancelled"] = "Scheduled"
    preparation_notes: str = Field(default="", max_length=10000)
    outcome: str = Field(default="", max_length=10000)


class HearingUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=255)
    scheduled_at: datetime | None = None
    court: str | None = Field(default=None, min_length=2, max_length=255)
    judge: str | None = Field(default=None, max_length=255)
    hearing_type: str | None = Field(default=None, max_length=64)
    status: Literal["Scheduled", "Completed", "Adjourned", "Cancelled"] | None = None
    preparation_notes: str | None = Field(default=None, max_length=10000)
    outcome: str | None = Field(default=None, max_length=10000)


class HearingOut(HearingCreate):
    id: int
    case_number: str
    case_title: str
    created_at: datetime


class ResearchLogCreate(OrganizerBase):
    query: str = Field(min_length=3, max_length=5000)
    notes: str = Field(default="", max_length=10000)
    results: list[dict] = Field(default_factory=list)


class ResearchLogOut(ResearchLogCreate):
    id: int
    case_number: str | None = None
    case_title: str | None = None
    created_at: datetime


class LawyerClientOut(BaseModel):
    id: int
    name: str
    email: str
    case_count: int
    active_case_count: int
    document_count: int
    last_case_at: datetime
    cases: list[CaseOut] = Field(default_factory=list)
