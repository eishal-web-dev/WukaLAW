from fastapi import APIRouter
from ai.ocr.engines import TesseractEngine

router = APIRouter(prefix="/ocr", tags=["ocr"])

@router.get("/health")
def ocr_health():
    """Return readiness without exposing executable or filesystem paths."""
    return TesseractEngine.health()
