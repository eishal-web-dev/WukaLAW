"""Completely offline legal-intelligence analysis endpoint."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from ai.legal_intelligence import analyze

router = APIRouter(prefix="/api/legal-intelligence", tags=["legal-intelligence"])


class AnalysisRequest(BaseModel):
    question: str = Field(min_length=1, max_length=10000)


@router.post("/analyze")
def analyze_question(request: AnalysisRequest):
    try:
        return analyze(request.question).to_dict()
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
