"""Local Tesseract adapter and non-sensitive readiness reporting."""
from __future__ import annotations

class TesseractUnavailable(RuntimeError):
    pass

class TesseractEngine:
    name = "tesseract"

    @staticmethod
    def health() -> dict:
        try:
            import pytesseract
            pytesseract.get_tesseract_version()
            languages = sorted(set(pytesseract.get_languages(config="")))
            executable = True
        except Exception:
            languages, executable = [], False
        english = "eng" in languages
        urdu = "urd" in languages
        return {
            "tesseract_available": executable,
            "installed_languages": languages,
            "english_available": english,
            "urdu_available": urdu,
            "ocr_ready": executable and english,
        }

    def recognize(self, image, language: str = "auto") -> tuple[str, float | None]:
        status = self.health()
        if not status["tesseract_available"]:
            raise TesseractUnavailable("Local OCR is unavailable")
        import pytesseract
        requested = "eng+urd" if language == "auto" else language
        available = set(status["installed_languages"])
        selected = "+".join(code for code in requested.split("+") if code in available)
        if not selected:
            raise TesseractUnavailable(f"OCR language data unavailable: {requested}")
        try:
            data = pytesseract.image_to_data(
                image, lang=selected, output_type=pytesseract.Output.DICT, config="--psm 6"
            )
        except Exception as error:
            raise RuntimeError("OCR could not read this page") from error
        words = [value.strip() for value in data.get("text", []) if value.strip()]
        scores = []
        for value in data.get("conf", []):
            try:
                score = float(value)
                if score >= 0:
                    scores.append(score)
            except (TypeError, ValueError):
                pass
        return " ".join(words), (sum(scores) / len(scores) if scores else None)
