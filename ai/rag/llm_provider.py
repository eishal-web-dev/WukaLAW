"""Pluggable LLM interfaces; credentials are read only from the environment."""
from __future__ import annotations

import os
from abc import ABC, abstractmethod
from typing import Callable

import httpx


class LLMProvider(ABC):
    @abstractmethod
    def generate(self, prompt: str) -> str: ...


class FakeLLMProvider(LLMProvider):
    name = "fake"

    def __init__(self, response: str = "INSUFFICIENT_EVIDENCE"):
        self.response = response
        self.prompts: list[str] = []

    def generate(self, prompt: str) -> str:
        self.prompts.append(prompt)
        return self.response


class OpenAIProvider(LLMProvider):
    name = "openai"

    def __init__(self, model: str = "gpt-4.1-mini", api_key: str | None = None, base_url: str = "https://api.openai.com/v1"):
        self.model, self.api_key, self.base_url = model, api_key or os.getenv("OPENAI_API_KEY"), base_url.rstrip("/")

    def generate(self, prompt: str) -> str:
        if not self.api_key:
            raise RuntimeError("OPENAI_API_KEY is not configured")
        response = httpx.post(
            f"{self.base_url}/responses",
            headers={"Authorization": f"Bearer {self.api_key}"},
            json={"model": self.model, "input": prompt},
            timeout=120,
        )
        response.raise_for_status()
        data = response.json()
        if data.get("output_text"):
            return str(data["output_text"])
        return "".join(
            part.get("text", "")
            for item in data.get("output", [])
            for part in item.get("content", [])
            if part.get("type") == "output_text"
        )


class GeminiProvider(LLMProvider):
    name = "gemini"

    def __init__(self, model: str | None = None, api_key: str | None = None):
        self.model = model or os.getenv("GEMINI_MODEL", "gemini-3.6-flash")
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")

    def generate(self, prompt: str) -> str:
        if not self.api_key:
            raise RuntimeError("GEMINI_API_KEY is not configured")
        try:
            from google import genai
            from google.genai.errors import ClientError
        except ImportError as exc:
            raise RuntimeError("google-genai is not installed") from exc

        try:
            client = genai.Client(api_key=self.api_key)
            response = client.models.generate_content(model=self.model, contents=prompt)
        except ClientError as exc:
            if getattr(exc, "code", None) == 429 or "RESOURCE_EXHAUSTED" in str(exc):
                raise RuntimeError("Gemini quota has been reached") from exc
            raise RuntimeError(f"Gemini request failed: {exc}") from exc

        text = getattr(response, "text", None)
        if not text:
            raise RuntimeError("Gemini returned an empty response")
        return str(text).strip()


class GroqProvider(LLMProvider):
    name = "groq"

    def __init__(self, model: str | None = None, api_key: str | None = None):
        self.model = model or os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
        self.api_key = api_key or os.getenv("GROQ_API_KEY")

    def generate(self, prompt: str) -> str:
        if not self.api_key:
            raise RuntimeError("GROQ_API_KEY is not configured")
        try:
            from groq import Groq
            client = Groq(api_key=self.api_key)
            response = client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0,
            )
        except Exception as exc:
            message = str(exc)
            if "429" in message or "rate_limit" in message.casefold():
                raise RuntimeError("Groq rate limit has been reached") from exc
            raise RuntimeError(f"Groq request failed: {exc}") from exc

        text = response.choices[0].message.content
        if not text:
            raise RuntimeError("Groq returned an empty response")
        return str(text).strip()


class OllamaProvider(LLMProvider):
    name = "ollama"

    def __init__(self, model: str = "llama3.1", base_url: str = "http://localhost:11434"):
        self.model, self.base_url = model, base_url.rstrip("/")

    def generate(self, prompt: str) -> str:
        response = httpx.post(
            f"{self.base_url}/api/generate",
            json={"model": self.model, "prompt": prompt, "stream": False},
            timeout=120,
        )
        response.raise_for_status()
        return str(response.json().get("response", "")).strip()


class LocalLlamaProvider(LLMProvider):
    name = "local"

    def __init__(self, endpoint: str | None = None, model: str = "local-llama"):
        self.endpoint, self.model = endpoint or os.getenv("LOCAL_LLAMA_URL", "http://localhost:8080/v1/chat/completions"), model

    def generate(self, prompt: str) -> str:
        response = httpx.post(
            self.endpoint,
            json={"model": self.model, "messages": [{"role": "user", "content": prompt}]},
            timeout=120,
        )
        response.raise_for_status()
        return str(response.json()["choices"][0]["message"]["content"]).strip()


class CallableLLMProvider(LLMProvider):
    name = "callable"

    def __init__(self, function: Callable[[str], str]):
        self.function = function

    def generate(self, prompt: str) -> str:
        return self.function(prompt)


class FallbackLLMProvider(LLMProvider):
    """Tries each configured provider in order and moves on to the next one
    if the current one raises — e.g. a missing/invalid key, a rate limit, an
    exhausted quota, or a network error. Every underlying provider already
    normalizes its own failures into ``RuntimeError``, but this catches any
    ``Exception`` defensively so one misbehaving provider can't take down the
    whole chain.

    Each attempt is tried exactly once per call; there is no retry within a
    single provider. ``last_used`` records which provider actually produced
    the answer, so callers can surface that for transparency (this app's
    whole positioning is "show your evidence" — which model answered is part
    of that).
    """

    name = "fallback"

    def __init__(self, providers: list[tuple[str, LLMProvider]]):
        if not providers:
            raise ValueError("FallbackLLMProvider needs at least one provider")
        self.providers = providers
        self.last_used: str | None = None
        self.last_errors: list[str] = []

    def generate(self, prompt: str) -> str:
        errors: list[str] = []
        for provider_name, provider in self.providers:
            try:
                result = provider.generate(prompt)
            except Exception as exc:  # noqa: BLE001 - deliberately broad, see class docstring
                errors.append(f"{provider_name}: {exc}")
                continue
            self.last_used = provider_name
            self.last_errors = errors
            return result

        self.last_used = None
        self.last_errors = errors
        raise RuntimeError("All configured LLM providers failed: " + "; ".join(errors))
