from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import Base, engine
from app.routers import auth_routes, case_custom_search, case_pathway, cases, documents, legal_intelligence, notifications, precedent_briefs, qa, rag, search, similar_cases, ocr

app = FastAPI(
    title="WukaLAW API",
    description=(
        "Explainable AI Legal Intelligence Platform Ã¢â‚¬â€ MVP. "
        "Decision-support only; not legal advice."
    ),
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

# lightweight dev migration: create_all doesn't alter existing tables
with engine.connect() as connection:
    from sqlalchemy import text

    columns = [row[1] for row in connection.execute(text("PRAGMA table_info(documents)"))]
    if columns and "case_id" not in columns:
        connection.execute(text("ALTER TABLE documents ADD COLUMN case_id INTEGER"))
    if columns and "processing_metadata" not in columns:
        connection.execute(text("ALTER TABLE documents ADD COLUMN processing_metadata JSON"))
    chunk_columns = [row[1] for row in connection.execute(text("PRAGMA table_info(chunks)"))]
    if chunk_columns and "page" not in chunk_columns:
        connection.execute(text("ALTER TABLE chunks ADD COLUMN page INTEGER"))
    if chunk_columns and "extraction_method" not in chunk_columns:
        connection.execute(text("ALTER TABLE chunks ADD COLUMN extraction_method VARCHAR(32)"))
    user_columns = [row[1] for row in connection.execute(text("PRAGMA table_info(users)"))]
    if user_columns and "notifications_enabled" not in user_columns:
        connection.execute(text("ALTER TABLE users ADD COLUMN notifications_enabled BOOLEAN NOT NULL DEFAULT 1"))
    connection.commit()

api = APIRouter(prefix="/api/v1")


@api.get("/health", tags=["health"])
def health():
    return {"status": "ok"}


api.include_router(auth_routes.router)
api.include_router(notifications.router)
api.include_router(cases.router)
api.include_router(case_custom_search.router)
api.include_router(precedent_briefs.router)
api.include_router(case_pathway.router)
api.include_router(documents.router)
api.include_router(ocr.router)
api.include_router(search.router)
api.include_router(qa.router)
app.include_router(api)
app.include_router(rag.router)
app.include_router(legal_intelligence.router)
app.include_router(similar_cases.router)
