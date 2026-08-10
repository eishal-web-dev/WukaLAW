class TesseractUnavailable(RuntimeError): pass

class TesseractEngine:
    name = "tesseract"
    def recognize(self, image, language="auto"):
        try:
            import pytesseract
            pytesseract.get_tesseract_version()
        except Exception as error:
            raise TesseractUnavailable("Local OCR is unavailable") from error
        requested = "eng+urd" if language == "auto" else language
        available = set(pytesseract.get_languages(config=""))
        selected = "+".join(code for code in requested.split("+") if code in available)
        if not selected: raise TesseractUnavailable(f"OCR language data unavailable: {requested}")
        try:
            data = pytesseract.image_to_data(image, lang=selected, output_type=pytesseract.Output.DICT, config="--psm 6")
        except Exception as error:
            raise RuntimeError("OCR could not read this page") from error
        words = [value.strip() for value in data.get("text", []) if value.strip()]
        scores = []
        for value in data.get("conf", []):
            try:
                if float(value) >= 0: scores.append(float(value))
            except (TypeError, ValueError): pass
        return " ".join(words), (sum(scores) / len(scores) if scores else None)
