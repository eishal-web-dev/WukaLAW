from ai.legal_intelligence.language_detector import detect_language
from ai.legal_intelligence.models import Language


def test_english(): assert detect_language("My employer dismissed me") == Language.ENGLISH
def test_urdu(): assert detect_language("مجھے قانونی مدد چاہیے") == Language.URDU
def test_unknown(): assert detect_language("12345 !!!") == Language.UNKNOWN
