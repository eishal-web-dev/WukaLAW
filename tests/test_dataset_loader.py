"""Focused tests for WakuLAW's streaming unified dataset loader."""

from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path

from ai.preprocessing.dataset_loader import load_datasets


class DatasetLoaderTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary_directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary_directory.cleanup)
        self.root = Path(self.temporary_directory.name)
        self.raw = self.root / "datasets" / "raw"
        self.raw.mkdir(parents=True)
        self.output = self.root / "datasets" / "processed" / "manifest.jsonl"

    def _records(self, path: Path | None = None) -> list[dict[str, object]]:
        manifest = path or self.output
        return [json.loads(line) for line in manifest.read_text(encoding="utf-8").splitlines()]

    def _raw_snapshot(self) -> dict[str, bytes]:
        return {
            path.relative_to(self.raw).as_posix(): path.read_bytes()
            for path in self.raw.rglob("*")
            if path.is_file()
        }

    def test_pakistan_laws_json_supports_text_and_content_fields(self) -> None:
        laws = self.raw / "laws"
        laws.mkdir()
        (laws / "pakistan_laws.json").write_text(
            json.dumps(
                [
                    {"file_name": "act-one.pdf", "text": "THE FIRST ACT, 2020\nSection 1."},
                    {"file_name": "act-two.pdf", "content": "THE SECOND ORDINANCE, 2021"},
                ]
            ),
            encoding="utf-8",
        )

        summary = load_datasets(self.raw, self.output, datasets=["laws"])
        records = self._records()

        self.assertEqual(summary.total_documents, 2)
        self.assertEqual([record["source_file_name"] for record in records], ["act-one.pdf", "act-two.pdf"])
        self.assertEqual([record["document_type"] for record in records], ["law", "law"])
        self.assertEqual(records[1]["text"], "THE SECOND ORDINANCE, 2021")
        self.assertIn("#entry=0", records[0]["source_path"])
        self.assertEqual(records[0]["metadata"]["container_source_path"], "laws/pakistan_laws.json")

    def test_txt_judgment_infers_court_and_category(self) -> None:
        folder = self.raw / "judgments" / "supreme_court_constitutional_cases"
        folder.mkdir(parents=True)
        (folder / "case.txt").write_text(
            "IN THE SUPREME COURT OF PAKISTAN\n"
            "PRESENT: MR. JUSTICE TEST JUDGE\n"
            "CONSTITUTION PETITION NO. 10/2020\n",
            encoding="utf-8",
        )

        load_datasets(self.raw, self.output, datasets=["judgments"])
        record = self._records()[0]

        self.assertEqual(record["document_type"], "judgment")
        self.assertEqual(record["court"], "Supreme Court of Pakistan")
        self.assertEqual(record["case_category"], "Constitutional Cases")
        self.assertEqual(record["language"], "English")
        self.assertEqual(record["source_path"], "judgments/supreme_court_constitutional_cases/case.txt")

    def test_labeled_parent_folder_is_candidate_category_not_outcome(self) -> None:
        folder = self.raw / "labeled_cases" / "Labeled Data" / "Civil Appeals"
        folder.mkdir(parents=True)
        (folder / "appeal.txt").write_text(
            "IN THE SUPREME COURT OF PAKISTAN\nCIVIL APPEAL NO. 2 OF 2022", encoding="utf-8"
        )

        load_datasets(self.raw, self.output, datasets=["labeled_cases"])
        record = self._records()[0]

        self.assertEqual(record["case_category"], "Civil Appeals")
        self.assertTrue(record["metadata"]["candidate_category_only"])
        self.assertIsNone(record["metadata"]["outcome_label"])
        self.assertIn("not an outcome label", record["metadata"]["label_interpretation"])

    def test_missing_root_and_malformed_json_are_reported_safely(self) -> None:
        with self.assertRaises(FileNotFoundError):
            load_datasets(self.root / "missing", self.output)

        laws = self.raw / "laws"
        laws.mkdir()
        (laws / "broken.json").write_text("{not-an-array}", encoding="utf-8")
        judgments = self.raw / "judgments"
        judgments.mkdir()
        (judgments / "valid.txt").write_text("A valid legal judgment document", encoding="utf-8")

        summary = load_datasets(self.raw, self.output, datasets=["laws", "judgments"])
        records = self._records()

        self.assertEqual(summary.total_documents, 2)
        self.assertEqual(summary.failed_documents, 1)
        self.assertEqual(records[0]["extraction_status"], "failed")
        self.assertEqual(records[1]["extraction_status"], "extracted")

    def test_document_ids_are_stable_across_runs(self) -> None:
        judgments = self.raw / "judgments"
        judgments.mkdir()
        (judgments / "stable.txt").write_text("Stable legal text", encoding="utf-8")
        second_output = self.root / "second.jsonl"

        load_datasets(self.raw, self.output, datasets=["judgments"])
        load_datasets(self.raw, second_output, datasets=["judgments"])

        self.assertEqual(self._records()[0]["document_id"], self._records(second_output)[0]["document_id"])

    def test_jsonl_duplicate_detection_and_raw_immutability(self) -> None:
        judgments = self.raw / "judgments"
        judgments.mkdir()
        text = "IN THE SUPREME COURT OF PAKISTAN\nExact duplicate judgment"
        (judgments / "one.txt").write_text(text, encoding="utf-8")
        (judgments / "two.txt").write_text(text, encoding="utf-8")
        before = self._raw_snapshot()

        summary = load_datasets(self.raw, self.output, datasets=["judgments"])
        records = self._records()

        self.assertEqual(before, self._raw_snapshot())
        self.assertFalse(summary.raw_changed)
        self.assertEqual(len(summary.duplicate_groups), 1)
        self.assertEqual(len(records), 2)
        self.assertNotEqual(records[0]["document_id"], records[1]["document_id"])
        self.assertEqual(records[1]["metadata"]["probable_duplicate_of"], records[0]["document_id"])

    def test_template_pdf_is_registered_pending_ocr_without_text(self) -> None:
        templates = self.raw / "templates" / "petitions"
        templates.mkdir(parents=True)
        pdf = templates / "petition.pdf"
        pdf.write_bytes(b"%PDF-1.4\n1 0 obj <</Type /Page>> endobj\n%%EOF\n")
        before = pdf.read_bytes()

        summary = load_datasets(self.raw, self.output, datasets=["templates"])
        record = self._records()[0]

        self.assertEqual(before, pdf.read_bytes())
        self.assertEqual(summary.empty_documents, 1)
        self.assertEqual(record["document_type"], "template")
        self.assertEqual(record["extraction_status"], "pending_ocr")
        self.assertEqual(record["text"], "")
        self.assertFalse(record["metadata"]["ocr_performed"])


if __name__ == "__main__":
    unittest.main()
