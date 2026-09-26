"""Download public Pakistani judgment text through Hugging Face's dataset API."""
from __future__ import annotations

import argparse
import json
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any, Callable

DEFAULT_DATASET = "Ibtehaj10/supreme-court-of-pak-judgments"
DEFAULT_API = "https://datasets-server.huggingface.co"
TEXT_KEYS = ("text", "judgment", "judgement", "content", "document", "case_text", "full_text", "body", "opinion")
TITLE_KEYS = (
    "title", "case_title", "case_name", "name", "citation", "citation_number",
    "case_details", "id",
)


def _get_json(url: str, timeout: int = 60) -> dict[str, Any]:
    request = urllib.request.Request(url, headers={"User-Agent": "WukaLAW-corpus-bootstrap/1.0"})
    with urllib.request.urlopen(request, timeout=timeout) as response:
        return json.load(response)


def _first_text(row: dict[str, Any], keys: tuple[str, ...]) -> str:
    folded = {str(key).casefold(): value for key, value in row.items()}
    for key in keys:
        value = folded.get(key)
        if isinstance(value, str) and value.strip():
            return value.strip()
    return ""


def _extract_text(row: dict[str, Any]) -> str:
    direct = _first_text(row, TEXT_KEYS)
    if direct:
        return direct
    candidates = [value.strip() for value in row.values() if isinstance(value, str) and len(value.strip()) >= 300]
    return max(candidates, key=len, default="")


def _safe_name(value: str, index: int) -> str:
    cleaned = re.sub(r"[^A-Za-z0-9._-]+", "-", value).strip("-._")[:100]
    return f"{index:05d}-{cleaned or 'judgment'}.txt"


def _resolve_config_split(dataset: str, getter: Callable[[str], dict[str, Any]]) -> tuple[str, str]:
    url = f"{DEFAULT_API}/splits?" + urllib.parse.urlencode({"dataset": dataset})
    splits = getter(url).get("splits") or []
    if not splits:
        raise RuntimeError(f"No accessible dataset split was reported for {dataset}")
    preferred = next((item for item in splits if item.get("split") == "train"), splits[0])
    return str(preferred["config"]), str(preferred["split"])


def download(dataset: str, output: Path, *, limit: int, page_size: int = 100, timeout: int = 60,
             overwrite: bool = False, getter: Callable[[str], dict[str, Any]] | None = None) -> dict[str, Any]:
    if limit < 1:
        raise ValueError("limit must be at least 1")
    getter = getter or (lambda url: _get_json(url, timeout))
    config, split = _resolve_config_split(dataset, getter)
    output.mkdir(parents=True, exist_ok=True)
    downloaded = skipped = rejected = offset = 0
    while downloaded + skipped < limit:
        length = min(page_size, limit - downloaded - skipped)
        query = urllib.parse.urlencode({"dataset": dataset, "config": config, "split": split, "offset": offset, "length": length})
        rows = getter(f"{DEFAULT_API}/rows?{query}").get("rows") or []
        if not rows:
            break
        for wrapper in rows:
            row_index = int(wrapper.get("row_idx", offset))
            row = wrapper.get("row") or {}
            if not isinstance(row, dict):
                rejected += 1
                continue
            text = _extract_text(row)
            if len(text) < 200:
                rejected += 1
                continue
            target = output / _safe_name(_first_text(row, TITLE_KEYS), row_index)
            if target.exists() and not overwrite:
                skipped += 1
            else:
                target.write_text(text.replace("\x00", ""), encoding="utf-8", newline="\n")
                downloaded += 1
        offset += len(rows)
        if len(rows) < length:
            break
        time.sleep(0.05)
    if downloaded + skipped == 0:
        raise RuntimeError("The dataset returned no usable judgment text")
    return {"dataset": dataset, "source": f"https://huggingface.co/datasets/{dataset}", "config": config,
            "split": split, "downloaded": downloaded, "skipped": skipped, "rejected": rejected,
            "output": str(output.resolve())}


def parser() -> argparse.ArgumentParser:
    value = argparse.ArgumentParser(description="Download real Pakistani judgments for Similar Cases")
    value.add_argument("--dataset", default=DEFAULT_DATASET)
    value.add_argument("--output", type=Path, default=Path("datasets/raw/judgments"))
    value.add_argument("--limit", type=int, default=5000)
    value.add_argument("--page-size", type=int, default=100)
    value.add_argument("--timeout", type=int, default=60)
    value.add_argument("--overwrite", action="store_true")
    return value


def main(argv=None) -> int:
    args = parser().parse_args(argv)
    try:
        result = download(args.dataset, args.output, limit=args.limit, page_size=args.page_size,
                          timeout=args.timeout, overwrite=args.overwrite)
    except (ValueError, RuntimeError, OSError, urllib.error.URLError) as exc:
        print(f"judgment download failed: {exc}")
        return 1
    print(json.dumps(result, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
