# WakuLAW TASK-003 Preprocessing Report

## Run summary

- Input: `C:/Users/USER/OneDrive/Desktop/WakuLAW/datasets/processed/manifest.jsonl`
- Output: `C:/Users/USER/OneDrive/Desktop/WakuLAW/datasets/processed/clean_documents.jsonl`
- Documents processed: 7776
- Failures: 0
- Suspicious cleaning cases: 0
- Documents with explicit outcome phrases: 1139

## Metadata coverage

| Field | Documents | Coverage |
|---|---:|---:|
| articles_cited | 3029 | 38.95% |
| case_category | 5719 | 73.55% |
| case_number | 3228 | 41.51% |
| court | 6928 | 89.09% |
| decision_date | 5795 | 74.52% |
| explicit_outcome_phrases | 1139 | 14.65% |
| hearing_date | 3938 | 50.64% |
| judges | 5174 | 66.54% |
| jurisdiction | 7776 | 100.00% |
| laws_cited | 4882 | 62.78% |
| legal_citations | 3010 | 38.71% |
| sections_cited | 4527 | 58.22% |
| title | 7776 | 100.00% |

## Failures

- None

The pipeline is deterministic and rule-based. It does not infer win/loss labels.
