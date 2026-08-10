"""Page-aware native extraction and local OCR orchestration."""
from dataclasses import asdict, dataclass, field
from pathlib import Path
from .detector import detect_language, native_page_usable, quality_status
from .engines import TesseractEngine, TesseractUnavailable
from .preprocessing import prepare_image

SUPPORTED_EXTENSIONS = {".txt", ".pdf", ".jpg", ".jpeg", ".png", ".webp"}
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

@dataclass
class OCRPage:
    page: int; text: str; extraction_method: str; confidence: float | None = None; warning: str | None = None

@dataclass
class OCRResult:
    text: str; language: str; engine: str | None; confidence: float | None; extraction_method: str; quality: str
    pages: list[OCRPage] = field(default_factory=list); warnings: list[str] = field(default_factory=list)
    def metadata(self):
        return {"extraction_method": self.extraction_method, "ocr_engine": self.engine, "ocr_language": self.language,
            "ocr_confidence": self.confidence, "ocr_quality": self.quality, "page_count": len(self.pages),
            "pages_ocrd": sum(p.extraction_method == "ocr" for p in self.pages), "processing_warnings": self.warnings,
            "pages": [{k:v for k,v in asdict(p).items() if k != "text"} for p in self.pages]}

class OCRService:
    def __init__(self, engine=None): self.engine = engine or TesseractEngine()
    @staticmethod
    def _open_image(path):
        try:
            from PIL import Image
            image = Image.open(path); image.verify(); return Image.open(path).copy()
        except ImportError as error: raise RuntimeError("Image support is not installed") from error
        except Exception as error: raise ValueError("The uploaded image is corrupt or unreadable") from error
    @staticmethod
    def _render_pdf_page(path, index):
        try: import pypdfium2 as pdfium
        except ImportError as error: raise RuntimeError("Scanned PDF rendering support is not installed") from error
        pdf = pdfium.PdfDocument(str(path))
        try: return pdf[index].render(scale=2).to_pil()
        finally: pdf.close()
    def _ocr(self, image, language):
        original = image.copy()
        try:
            text, score = self.engine.recognize(prepare_image(image), language)
            if text.strip(): return text, score
        except TesseractUnavailable: raise
        except Exception: pass
        return self.engine.recognize(original, language)
    def extract(self, path: Path, language="auto"):
        ext = path.suffix.lower()
        if ext not in SUPPORTED_EXTENSIONS: raise ValueError("Unsupported document format")
        if language not in {"auto","eng","urd","eng+urd"}: raise ValueError("Unsupported OCR language")
        if ext == ".txt": return self._finish([OCRPage(1, path.read_text(encoding="utf-8-sig"), "native_text")])
        if ext in IMAGE_EXTENSIONS:
            text, score = self._ocr(self._open_image(path), language); return self._finish([OCRPage(1,text,"ocr",score)])
        from pypdf import PdfReader
        pages=[]
        for index, page in enumerate(PdfReader(str(path)).pages):
            native = page.extract_text() or ""
            if native_page_usable(native): pages.append(OCRPage(index+1,native,"native_pdf")); continue
            try:
                text, score = self._ocr(self._render_pdf_page(path,index),language); pages.append(OCRPage(index+1,text,"ocr",score))
            except Exception: pages.append(OCRPage(index+1,"","ocr",warning="Page could not be scanned"))
        return self._finish(pages)
    def _finish(self,pages):
        text="\n\n".join(p.text for p in pages if p.text.strip()); warnings=[f"Page {p.page}: {p.warning}" for p in pages if p.warning]
        methods={p.extraction_method for p in pages if p.text.strip()}; method="hybrid" if len(methods)>1 else next(iter(methods),"ocr")
        scores=[p.confidence for p in pages if p.confidence is not None]; score=sum(scores)/len(scores) if scores else None
        quality=quality_status(text,score,len(warnings))
        if quality in {"poor","review_recommended"} and any(p.extraction_method=="ocr" for p in pages): warnings.append("Document processed with low OCR confidence. Please upload a clearer scan for better AI results.")
        return OCRResult(text,detect_language(text),self.engine.name if any(p.extraction_method=="ocr" for p in pages) else None,score,method,quality,pages,warnings)
