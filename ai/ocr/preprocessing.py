"""Conservative preprocessing; the OCR service retains an original fallback."""
def prepare_image(image):
    try:
        from PIL import ImageEnhance, ImageFilter, ImageOps
    except ImportError as error:
        raise RuntimeError("Image support is not installed") from error
    result = ImageOps.exif_transpose(image).convert("L")
    if min(result.size) < 1200:
        scale = min(2.0, 1200 / max(1, min(result.size)))
        result = result.resize((int(result.width * scale), int(result.height * scale)))
    return ImageEnhance.Contrast(result).enhance(1.15).filter(ImageFilter.UnsharpMask(radius=1, percent=110, threshold=3))
