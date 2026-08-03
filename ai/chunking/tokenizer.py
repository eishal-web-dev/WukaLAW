"""Dependency-free deterministic token estimates."""
def estimate_tokens(text: str) -> int:
    return max(1, round(len(text) / 4)) if text else 0
def token_character_budget(tokens: int) -> int:
    if tokens <= 0: raise ValueError("token counts must be positive")
    return tokens * 4
