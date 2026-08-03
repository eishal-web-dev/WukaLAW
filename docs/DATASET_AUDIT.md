# WakuLAW Dataset Audit

Generated: `2026-08-03T05:54:12.364634+00:00`  
Input: `C:/Users/USER/OneDrive/Desktop/WakuLAW/datasets/raw`  
Mode: **read-only inspection** (no cleaning, preprocessing, OCR, embeddings, moves, or source-file writes)

## Summary

- Datasets: 4
- Supported files: 6811
- Total size: 560.9 MiB
- Corrupted/unreadable files: 0
- Encoding issues: 0
- Unsupported files skipped: 1

## Dataset Overview

| Dataset | Folder | Files | Size | Types | Language | Court | Document type | Recommended uses |
|---|---|---:|---:|---|---|---|---|---|
| judgments | `datasets/raw/judgments` | 3998 | 451.8 MiB | .pdf: 1189, .txt: 2809 | English | Supreme Court of Pakistan | Judgment | RAG, OCR |
| labeled_cases | `datasets/raw/labeled_cases` | 2809 | 62.2 MiB | .txt: 2809 | English | Supreme Court of Pakistan | Judgment | RAG |
| laws | `datasets/raw/laws` | 2 | 44.8 MiB | .json: 1, .md: 1 | English | Supreme Court of Pakistan | Judgment | RAG |
| templates | `datasets/raw/templates` | 2 | 2.1 MiB | .pdf: 2 | Unknown | Unknown | Petition/pleading | Templates, OCR |

## judgments

### Suitability recommendations

- **RAG: Yes.** Contains readable legal/text material suitable for retrieval review.
- **Classification: No.** No structured label/outcome field was detected.
- **Prediction: No.** No defensible prediction target was detected from sampled structure.
- **Templates: No.** No template/form structure was detected.
- **OCR: Yes.** At least one valid PDF has no text detectable by basic inspection; test OCR separately.
- **Ignore: No.** Usable files were found; do not ignore without review.

### Sample structure

```json
[
  {
    "path": "judgments/supreme_court_1200/archive(6)/Supreme Court Judgements/Dr Qibla Ayaz/Offence of Qazf (Enforcement of Hadood) Ord. 1979.pdf",
    "kind": "pdf",
    "pdf_version": "1.7",
    "estimated_page_count": 7,
    "encrypted": false,
    "extractable_text_detected": false,
    "text_extraction": "basic PDF literal-string inspection (not OCR)"
  },
  {
    "path": "judgments/supreme_court_1200/archive(6)/Supreme Court Judgements/Justice Amin-Ud-Din Khan/c.a._1080_2013.pdf",
    "kind": "pdf",
    "pdf_version": "1.5",
    "estimated_page_count": 5,
    "encrypted": false,
    "extractable_text_detected": false,
    "text_extraction": "basic PDF literal-string inspection (not OCR)"
  },
  {
    "path": "judgments/supreme_court_1200/archive(6)/Supreme Court Judgements/Justice Amin-Ud-Din Khan/c.a._1295_2019.pdf",
    "kind": "pdf",
    "pdf_version": "1.6",
    "estimated_page_count": 4,
    "encrypted": false,
    "extractable_text_detected": false,
    "text_extraction": "basic PDF literal-string inspection (not OCR)"
  },
  {
    "path": "judgments/supreme_court_1200/archive(6)/Supreme Court Judgements/Justice Amin-Ud-Din Khan/c.a._138_l_2010.pdf",
    "kind": "pdf",
    "pdf_version": "1.7",
    "estimated_page_count": 4,
    "encrypted": false,
    "extractable_text_detected": false,
    "text_extraction": "basic PDF literal-string inspection (not OCR)"
  },
  {
    "path": "judgments/supreme_court_1200/archive(6)/Supreme Court Judgements/Justice Amin-Ud-Din Khan/c.a._1421_2015.pdf",
    "kind": "pdf",
    "pdf_version": "1.7",
    "estimated_page_count": 5,
    "encrypted": false,
    "extractable_text_detected": false,
    "text_extraction": "basic PDF literal-string inspection (not OCR)"
  }
]
```

## labeled_cases

### Suitability recommendations

- **RAG: Yes.** Contains readable legal/text material suitable for retrieval review.
- **Classification: No.** No structured label/outcome field was detected.
- **Prediction: No.** No defensible prediction target was detected from sampled structure.
- **Templates: No.** No template/form structure was detected.
- **OCR: No.** No likely image-only PDF was detected.
- **Ignore: No.** Usable files were found; do not ignore without review.

### Sample structure

```json
[
  {
    "path": "labeled_cases/Labeled Data/Civil Appeals/102_C.A_supreme (109).txt",
    "kind": "plain_text",
    "sample_character_count": 10646,
    "sample_line_count": 196,
    "sample_nonempty_line_count": 175
  },
  {
    "path": "labeled_cases/Labeled Data/Civil Appeals/1035_C.A_supreme (193).txt",
    "kind": "plain_text",
    "sample_character_count": 29382,
    "sample_line_count": 422,
    "sample_nonempty_line_count": 381
  },
  {
    "path": "labeled_cases/Labeled Data/Civil Appeals/1068_C.A_supreme (196).txt",
    "kind": "plain_text",
    "sample_character_count": 37642,
    "sample_line_count": 720,
    "sample_nonempty_line_count": 720
  },
  {
    "path": "labeled_cases/Labeled Data/Civil Appeals/106_C.A_supreme (1093).txt",
    "kind": "plain_text",
    "sample_character_count": 20045,
    "sample_line_count": 331,
    "sample_nonempty_line_count": 297
  },
  {
    "path": "labeled_cases/Labeled Data/Civil Appeals/1113_C.A_supreme (20).txt",
    "kind": "plain_text",
    "sample_character_count": 32124,
    "sample_line_count": 594,
    "sample_nonempty_line_count": 594
  }
]
```

## laws

### Suitability recommendations

- **RAG: Yes.** Contains readable legal/text material suitable for retrieval review.
- **Classification: No.** No structured label/outcome field was detected.
- **Prediction: No.** No defensible prediction target was detected from sampled structure.
- **Templates: No.** No template/form structure was detected.
- **OCR: No.** No likely image-only PDF was detected.
- **Ignore: No.** Usable files were found; do not ignore without review.

### Sample structure

```json
[
  {
    "path": "laws/pdf_data(1).json",
    "kind": "json",
    "top_level_type": "Not parsed",
    "note": "File exceeds 20000000 byte safe parse limit; sampled only"
  },
  {
    "path": "laws/README(1).md",
    "kind": "markdown",
    "sample_character_count": 1216,
    "sample_line_count": 43,
    "sample_nonempty_line_count": 35,
    "heading_count_in_sample": 3,
    "heading_examples": [
      "🇵🇰 Pakistan Laws Dataset",
      "📌 Dataset Summary",
      "📂 Data Structure"
    ]
  }
]
```

## templates

### Suitability recommendations

- **RAG: No.** No readable text suitable for retrieval was detected.
- **Classification: No.** No structured label/outcome field was detected.
- **Prediction: No.** No defensible prediction target was detected from sampled structure.
- **Templates: Yes.** Template or form language was detected.
- **OCR: Yes.** At least one valid PDF has no text detectable by basic inspection; test OCR separately.
- **Ignore: No.** Usable files were found; do not ignore without review.

### Sample structure

```json
[
  {
    "path": "templates/legal_notice/525636914.pdf",
    "kind": "pdf",
    "pdf_version": "1.7",
    "estimated_page_count": 17,
    "encrypted": false,
    "extractable_text_detected": false,
    "text_extraction": "basic PDF literal-string inspection (not OCR)"
  },
  {
    "path": "templates/petitions/656113608.pdf",
    "kind": "pdf",
    "pdf_version": "1.5",
    "estimated_page_count": 0,
    "encrypted": false,
    "extractable_text_detected": false,
    "text_extraction": "basic PDF literal-string inspection (not OCR)"
  }
]
```

## Interpretation limits

- Language, court, and document type are heuristic estimates based on file paths and bounded text samples.
- PDF inspection validates basic structure and looks for simple text literals; it does not perform OCR.
- Classification and prediction recommendations do not approve a target. Labels, leakage, licensing, and temporal splits still require human review.
- Unsupported formats are listed in the JSON report but are not parsed.
