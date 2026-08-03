# WakuLAW Similar Case Search

## Architecture and retrieval flow

`POST /api/cases/similar` validates a situation, case number, or document ID; runs the offline Legal Intelligence Engine; builds a judgment-only `LegalSearchQuery`; over-fetches three times the requested result count; excludes the source document and exact duplicate hashes; deduplicates by `document_id`; ranks the strongest chunk per case; and constructs deterministic explanations. No LLM participates.

Document-based search first retrieves canonical chunks for the supplied document ID, combines their text into a case profile, searches other judgments, and excludes the original document and chunks with matching duplicate hashes.

## Ranking formula and weights

Ordering score = `clamped vector relevance × 0.70 + available deterministic boosts`.

Default boosts: same legal domain 0.05, same category 0.05, same court 0.03, same jurisdiction 0.03, shared law 0.04, shared section 0.03, shared article 0.03, shared citation 0.02, explicit entity 0.01, explicit outcome term 0.005, and preferred substantive chunk type 0.005. Missing metadata creates no feature. Weights are configurable through `FeatureWeights`.

The returned `similarity_score` is the clamped raw retrieval relevance score, not the boosted ordering score. Labels are configurable: `highly_relevant` ≥ 0.85, `relevant` ≥ 0.65, `possibly_relevant` ≥ 0.40, otherwise `weak_match`.

## Explanation rules

Explanations mention only calculated factors backed by query analysis, indexed metadata, or retrieved text. Known differences report court, jurisdiction, category, absent shared sections, and unavailable outcomes. Every substantive explanation says similarity does not make cases legally identical or predict an outcome.

## API contract

```json
{"situation":"My department dismissed me without a hearing","top_k":10,"court":null,"jurisdiction":"Pakistan","case_category":null,"include_outcomes":true,"document_id":null,"case_number":null}
```

The response contains the original situation, normalized query, intelligence snapshot, applied filters, candidate count, results, warnings, and processing time. Each result contains traceable chunk/case/source metadata, raw retrieval relevance, label, factors, differences, explanation, explicit extracted outcome when available, and duplicate sources.

## Smoke tests

Offline fake scenarios cover service dismissal, dowry recovery, criminal bail, tax appeal, and Article 25. They return deterministic fake judgments and expose domains, filters, scores, factors, explanations, extracted outcomes, and warnings without external services.

## Limitations and production readiness

Dates and judges are returned only when present in preserved payloads. Case numbers, outcomes, and categories are sparse; provincial metadata is not validated broadly. Vector relevance is not win probability, legal strength, prediction confidence, or likelihood of the same judgment. Before production: evaluate thresholds/weights on labeled Pakistani judgment pairs, validate more metadata categories, add authentication/rate limits, test real BGE-M3/Qdrant read-only retrieval, improve multi-chunk document profiles, and add monitoring.

## Source integrity

Tests use fake retrieval only. No datasets, processed sources, embeddings, production Qdrant collections, or vector-store data are modified.
