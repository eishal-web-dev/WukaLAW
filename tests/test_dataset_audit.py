"""Tests for the read-only WakuLAW dataset auditor."""

from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock


REPOSITORY_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPOSITORY_ROOT / "scripts"))

import audit_datasets as auditor  # noqa: E402


class DatasetAuditTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary_directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary_directory.cleanup)
        self.root = Path(self.temporary_directory.name)
        self.raw = self.root / "datasets" / "raw"
        self.raw.mkdir(parents=True)

    def _snapshot(self) -> dict[str, bytes]:
        return {
            path.relative_to(self.raw).as_posix(): path.read_bytes()
            for path in self.raw.rglob("*")
            if path.is_file()
        }

    def test_scans_supported_formats_recursively_and_preserves_raw_files(self) -> None:
        cases = self.raw / "pakistani_cases" / "nested"
        cases.mkdir(parents=True)
        (cases / "judgments.txt").write_text(
            "Supreme Court of Pakistan\nJudgment in a constitutional petition.", encoding="utf-8"
        )
        (cases / "notes.md").write_text("# Lahore High Court cases\nLegal commentary", encoding="utf-8")
        (cases / "labels.csv").write_text(
            "case_text,outcome\nFacts before decision,allowed\nOther facts,dismissed\n", encoding="utf-8"
        )
        (cases / "records.json").write_text(
            json.dumps([{"case_text": "Facts", "decision": "allowed"}]), encoding="utf-8"
        )
        (cases / "judgment.pdf").write_bytes(
            b"%PDF-1.4\n1 0 obj <</Type /Page>> endobj\n"
            b"BT (Supreme Court of Pakistan judgment) Tj ET\n%%EOF\n"
        )
        (cases / "ignored.xml").write_text("<case />", encoding="utf-8")
        before = self._snapshot()

        report = auditor.audit_datasets(self.raw)

        self.assertEqual(before, self._snapshot(), "The auditor must not mutate datasets/raw")
        self.assertEqual(report["summary"]["dataset_count"], 1)
        self.assertEqual(report["summary"]["file_count"], 5)
        self.assertEqual(report["summary"]["unsupported_file_count"], 1)
        dataset = report["datasets"][0]
        self.assertEqual(dataset["dataset_name"], "pakistani_cases")
        self.assertEqual(dataset["file_types"], {".csv": 1, ".json": 1, ".md": 1, ".pdf": 1, ".txt": 1})
        self.assertEqual(dataset["probable_language"], "English")
        self.assertTrue(dataset["recommendations"]["RAG"]["recommended"])
        self.assertTrue(dataset["recommendations"]["Classification"]["recommended"])
        self.assertTrue(dataset["recommendations"]["Prediction"]["recommended"])

    def test_reports_corruption_and_non_utf8_encoding_without_crashing(self) -> None:
        mixed = self.raw / "mixed"
        mixed.mkdir()
        (mixed / "broken.json").write_text('{"case": ', encoding="utf-8")
        (mixed / "broken.pdf").write_bytes(b"this is not a pdf")
        (mixed / "legacy.txt").write_bytes("Caf\u00e9 legal judgment".encode("cp1252"))

        report = auditor.audit_datasets(self.raw)

        dataset = report["datasets"][0]
        self.assertEqual(len(dataset["corrupted_files"]), 2)
        self.assertEqual(len(dataset["encoding_issues"]), 1)
        self.assertEqual(report["summary"]["corrupted_file_count"], 2)
        self.assertEqual(report["summary"]["encoding_issue_count"], 1)

    def test_one_unreadable_file_does_not_abort_dataset(self) -> None:
        dataset = self.raw / "cases"
        dataset.mkdir()
        (dataset / "one.txt").write_text("A legal judgment", encoding="utf-8")
        (dataset / "two.txt").write_text("Another legal judgment", encoding="utf-8")
        original_read_prefix = auditor._read_prefix

        def selective_failure(path: Path, limit: int = auditor.MAX_TEXT_SAMPLE_BYTES) -> bytes:
            if path.name == "one.txt":
                raise OSError("permission denied for test")
            return original_read_prefix(path, limit)

        with mock.patch.object(auditor, "_read_prefix", side_effect=selective_failure):
            report = auditor.audit_datasets(self.raw)

        self.assertEqual(report["summary"]["file_count"], 2)
        self.assertEqual(report["summary"]["corrupted_file_count"], 1)
        self.assertIn("permission denied", report["datasets"][0]["corrupted_files"][0]["error"])

    def test_missing_input_still_writes_valid_empty_reports(self) -> None:
        missing = self.root / "does-not-exist"
        json_output = self.root / "out" / "audit.json"
        markdown_output = self.root / "docs" / "audit.md"

        exit_code = auditor.main(
            [
                "--input",
                str(missing),
                "--json-output",
                str(json_output),
                "--markdown-output",
                str(markdown_output),
                "--log-level",
                "ERROR",
            ]
        )

        self.assertEqual(exit_code, 0)
        payload = json.loads(json_output.read_text(encoding="utf-8"))
        self.assertFalse(payload["input_exists"])
        self.assertEqual(payload["summary"]["file_count"], 0)
        self.assertIn("No supported datasets found", markdown_output.read_text(encoding="utf-8"))

    def test_root_level_files_are_audited_as_individual_datasets(self) -> None:
        (self.raw / "acts.txt").write_text("Constitution of Pakistan section 1", encoding="utf-8")
        (self.raw / "labels.csv").write_text("facts,label\nExample,allowed\n", encoding="utf-8")

        report = auditor.audit_datasets(self.raw)

        self.assertEqual([item["dataset_name"] for item in report["datasets"]], ["acts", "labels"])


if __name__ == "__main__":
    unittest.main()
