"""Offline legal-intelligence smoke examples."""
from __future__ import annotations
import json, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path: sys.path.insert(0, str(ROOT))
from ai.legal_intelligence import analyze

for question in ("My boss fired me in Lahore", "My husband isn't giving me my dowry"):
    print(json.dumps(analyze(question).to_dict(), ensure_ascii=False, indent=2))
