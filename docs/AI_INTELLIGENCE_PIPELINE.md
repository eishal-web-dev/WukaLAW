# WukaLAW AI Intelligence Pipeline

## Purpose

WukaLAW turns a client's saved case and documents into explainable procedural and precedent research. Core retrieval, pathway statistics, timing, and outcome recording are deterministic and do not require an LLM.

## Request flow

1. **User case and documents** — the saved description and extracted document text remain the evidence boundary.
2. **Legal issue extraction** — deterministic phrase rules identify supported legal issues and retain exact evidence phrases.
3. **Current-stage detection** — ordered procedural rules locate the latest supported court stage and expose a court-process position, never a percent-complete or outcome score.
4. **Similar Pakistani judgment retrieval** — the existing Similar Cases pipeline queries the configured wakulaw_legal_chunks Qdrant collection.
5. **Ranking** — issue-aware deterministic features rerank candidates and suppress weak semantic neighbours.
6. **Historical pathway analysis** — comparable passages are counted only when a later procedural stage is visibly supported.
7. **Historical timing** — statistics use explicit dated stage events only. Median and IQR are hidden below the minimum sample.
8. **Historical outcomes** — explicit disposition language is recorded as allowed, dismissed, mixed, conviction maintained, or conviction set aside. Favorable/unfavorable alignment is not shown unless the relevant party side is known.
9. **Brief generation and fallback** — an optional provider may produce a grounded enhanced brief. Provider errors trigger an extractive brief from retrieved passages; normal users do not see raw provider errors.
10. **Independent degradation** — current stage survives Similar Cases failure; pathway survives sparse timing; all core research survives an optional LLM failure.

## Unified response

GET /api/v1/cases/{case_id}/pathway-intelligence preserves existing fields and adds:

- current_pathway
- historical_pathway
- historical_timing
- historical_outcomes
- what_to_watch_next
- warnings

Each section reports its own availability and reason. One optional failure does not force a giant 503.

## Retrieval regression harness

tests/fixtures/legal_retrieval_gold.json covers family, murder/criminal, bail, property/civil, and constitutional queries. The harness reports domain correctness, required legal-term coverage, Recall@5 where exact labels exist, and MRR where exact labels exist.

Run it against the configured local collection with:

    .\.venv\Scripts\python.exe scripts\evaluate_legal_retrieval.py

The fixture is a regression guard, not a claim of model accuracy.

## Safety limitations

- Historical pathway, timing, and outcomes are observations, not predictions.
- No win probability, chance-of-success label, or ETA is produced.
- Client alignment remains unclear unless the relevant party side is explicitly known.
- Indexed passages can omit context; official judgments and current court orders must be verified.
- The extractive brief cannot infer missing facts, ratio, later treatment, or binding force.
- Timing requires at least three comparable records with explicit dated procedural events.
- OCR remains out of scope for this implementation pass.

# FYP demo checklist

## Family case

- Add a case mentioning maintenance/custody or dowry.
- Include a clear procedural phrase such as “final arguments were heard.”
- Confirm issue chips, current stage, historical pathway, and no invented outcome alignment.

## Criminal murder/alibi case

- Use section 302 PPC, murder, and alibi/evidence wording.
- Confirm Criminal issue detection and the regression query's criminal-domain result.
- Confirm an explicit dismissal/allowance is recorded without calling it a client win.

## Civil/property case

- Use ownership, possession, mutation, or partition facts.
- Confirm Property / Ownership detection and civil/property retrieval terms.

## Sparse-data case

- Use a short issue-only description with no stage/date/outcome phrase.
- Confirm WukaLAW asks for the latest order and shows no fake timing or outcome.

## Provider-down fallback

- Disable or invalidate the optional brief provider in a local test environment.
- Open “See what happened.”
- Confirm the endpoint returns brief_source extractive and the UI shows “Extracted case brief.”
- Confirm Similar Cases and pathway cards remain available.
