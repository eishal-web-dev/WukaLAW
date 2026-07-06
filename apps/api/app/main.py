from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import Base, engine
from app.routers import documents, qa, search

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

api = APIRouter(prefix="/api/v1")


@api.get("/health", tags=["health"])
def health():
    return {"status": "ok"}


api.include_router(documents.router)
api.include_router(search.router)
api.include_router(qa.router)
app.include_router(api)
