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

from app.db import Base, engine
from app.routers import auth_routes, case_pathway, cases, documents, legal_intelligence, precedent_briefs, qa, rag, search, similar_cases

app = FastAPI(
    title="WakuLaw API",
    description=(
        "Explainable AI Legal Intelligence Platform — MVP. "
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
        connection.commit()

api = APIRouter(prefix="/api/v1")


@api.get("/health", tags=["health"])
def health():
    return {"status": "ok"}


api.include_router(auth_routes.router)
api.include_router(cases.router)
api.include_router(precedent_briefs.router)
api.include_router(case_pathway.router)
api.include_router(documents.router)
api.include_router(search.router)
api.include_router(qa.router)
app.include_router(api)
app.include_router(rag.router)
app.include_router(legal_intelligence.router)
app.include_router(similar_cases.router)
