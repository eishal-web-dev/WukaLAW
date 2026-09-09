import os
import sys
from pathlib import Path

# make `app` and the repository-level `ai` package importable regardless of cwd
_API_ROOT = str(Path(__file__).resolve().parents[1])
_REPO_ROOT = str(Path(__file__).resolve().parents[3])
for _path in (_API_ROOT, _REPO_ROOT):
    if _path in sys.path:
        sys.path.remove(_path)
sys.path.insert(0, _REPO_ROOT)
sys.path.insert(1, _API_ROOT)

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.auth import ADMIN_EMAIL, sync_configured_admin
from app.config import settings
from app.db import Base, SessionLocal, engine
from app.routers import admin, auth_routes, case_custom_search, case_pathway, cases, documents, legal_intelligence, notifications, precedent_briefs, qa, rag, reports, search, similar_cases

app = FastAPI(
    title="WukaLAW API",
    description=(
        "Explainable AI Legal Intelligence Platform — MVP. "
        "Decision-support only; not legal advice."
    ),
    version="0.1.0",
)

_cors_origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
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
    user_columns = [row[1] for row in connection.execute(text("PRAGMA table_info(users)"))]
    if user_columns and "notifications_enabled" not in user_columns:
        connection.execute(text("ALTER TABLE users ADD COLUMN notifications_enabled BOOLEAN NOT NULL DEFAULT 1"))
    connection.commit()

    user_columns = [row[1] for row in connection.execute(text("PRAGMA table_info(users)"))]
    if user_columns and "role" not in user_columns:
        connection.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'lawyer'"))
    connection.execute(text("UPDATE users SET role = 'lawyer' WHERE role IS NULL"))
    connection.execute(
        text("UPDATE users SET role = 'lawyer' WHERE role = 'admin' AND lower(email) != :admin_email"),
        {"admin_email": ADMIN_EMAIL},
    )
    connection.commit()

    case_columns = [row[1] for row in connection.execute(text("PRAGMA table_info(cases)"))]
    if case_columns and "client_id" not in case_columns:
        connection.execute(text("ALTER TABLE cases ADD COLUMN client_id INTEGER"))
    connection.commit()

    # SQLite can't ALTER COLUMN to drop a NOT NULL constraint directly --
    # needed here because client-submitted case requests have no lawyer
    # yet (owner_id is null until a lawyer claims the request). This does
    # the standard SQLite rebuild: new table with the relaxed constraint,
    # copy the data across, swap it in. Only runs once -- if owner_id is
    # already nullable, PRAGMA reports notnull=0 and this is skipped.
    case_info = connection.execute(text("PRAGMA table_info(cases)")).fetchall()
    owner_id_row = next((row for row in case_info if row[1] == "owner_id"), None)
    if owner_id_row is not None and owner_id_row[3] == 1:  # notnull column
        connection.execute(text("""
            CREATE TABLE cases_new (
                id INTEGER PRIMARY KEY,
                owner_id INTEGER,
                client_id INTEGER,
                case_number VARCHAR(32),
                title VARCHAR(255),
                case_type VARCHAR(100),
                status VARCHAR(32),
                priority VARCHAR(32),
                description TEXT,
                deadline VARCHAR(32),
                created_at DATETIME,
                FOREIGN KEY(owner_id) REFERENCES users(id),
                FOREIGN KEY(client_id) REFERENCES users(id)
            )
        """))
        connection.execute(text("""
            INSERT INTO cases_new (id, owner_id, client_id, case_number, title, case_type, status, priority, description, deadline, created_at)
            SELECT id, owner_id, client_id, case_number, title, case_type, status, priority, description, deadline, created_at FROM cases
        """))
        connection.execute(text("DROP TABLE cases"))
        connection.execute(text("ALTER TABLE cases_new RENAME TO cases"))
        connection.execute(text("CREATE INDEX IF NOT EXISTS ix_cases_owner_id ON cases (owner_id)"))
        connection.execute(text("CREATE INDEX IF NOT EXISTS ix_cases_client_id ON cases (client_id)"))
    connection.commit()

if settings.admin_bootstrap_password:
    with SessionLocal() as admin_db:
        sync_configured_admin(admin_db, settings.admin_bootstrap_password)

api = APIRouter(prefix="/api/v1")


@api.get("/health", tags=["health"])
def health():
    return {"status": "ok"}


api.include_router(auth_routes.router)
api.include_router(admin.router)
api.include_router(notifications.router)
api.include_router(cases.router)
api.include_router(case_custom_search.router)
api.include_router(precedent_briefs.router)
api.include_router(case_pathway.router)
api.include_router(documents.router)
api.include_router(search.router)
api.include_router(qa.router)
api.include_router(reports.router)
app.include_router(api)
app.include_router(rag.router)
app.include_router(legal_intelligence.router)
app.include_router(similar_cases.router)
