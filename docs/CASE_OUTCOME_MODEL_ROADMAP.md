# WukaLAW Case Outcome Intelligence Roadmap

## Purpose

This document defines a practical plan for building WukaLAW's Pakistani case-outcome intelligence system.

WukaLAW should **not** promise that a client will win or lose. Its purpose is to combine the client's case background, verified documents, evidence, timeline, applicable Pakistani law, and similar judgments to produce:

- arguments supporting each side;
- missing-evidence warnings;
- likely procedural and outcome scenarios;
- calibrated confidence with an explanation;
- citations that a lawyer can inspect.

The product must always present this as **decision support, not legal advice or a guaranteed court prediction**.

## Recommended system design

A single fine-tuned language model should not be responsible for both legal research and outcome prediction. WukaLAW should use separate, testable components:

1. **Case profile builder** — structures the description, claims, parties, status, timeline, deadlines and evidence.
2. **Legal retrieval system** — finds relevant Pakistani statutes, rules and judgments.
3. **Reranker** — prioritizes authorities with the correct court, jurisdiction, case category and fact pattern.
4. **Outcome model** — estimates scenario probabilities from structured, historically labelled cases.
5. **Explanation model** — produces a client-friendly analysis grounded in the case profile and retrieved authorities.
6. **Citation and safety validator** — blocks unsupported claims and verifies cited sources.

The outcome model supplies calibrated estimates. The explanation model explains the evidence and limitations. Retrieval supplies current, authoritative legal material.

## Initial scope

Begin with one coherent practice area instead of combining unrelated criminal, civil, constitutional and family disputes.

### Recommended first specialty

Pakistani family law:

- haq mehr/dower;
- dowry and bridal property recovery;
- maintenance;
- dissolution of marriage;
- child custody and visitation;
- recovery of personal belongings.

Family law matches WukaLAW's existing client use cases and makes it easier to define consistent labels and evaluation standards.

### Initial data target

Collect approximately **3,000–10,000 cleaned and deduplicated family-law judgments** before attempting meaningful supervised outcome modelling. Quality and representative coverage matter more than raw volume.

Coverage should be measured across:

- Supreme Court and relevant High Courts;
- Family Courts and appellate decisions where lawfully available;
- provinces and territories;
- judgment years;
- claim types;
- procedural stages;
- outcomes and relief types.

## Dataset schema

Each decision should become one structured case record.

| Category | Suggested fields |
| --- | --- |
| Identity | internal ID, neutral citation, court, bench, date, jurisdiction |
| Procedure | originating court, current stage, appeal/revision status |
| Case type | family-law category and subcategory |
| Parties | anonymized party roles, not personal identifiers |
| Claims | relief requested by each party |
| Allegations | facts asserted but not necessarily proven |
| Established facts | facts accepted or supported in the decision |
| Disputed facts | material points contested by the parties |
| Evidence | documents, witnesses, admissions, expert evidence |
| Law | statutes, sections, rules and cited precedents |
| Reasoning | decisive legal and factual reasons |
| Outcome | allowed, dismissed, partly allowed, remanded, settled or other |
| Relief | money/property/custody/maintenance or other relief granted |
| Limitations | missing pages, OCR issues, ambiguous labels |
| Provenance | source URL/file, page and paragraph references |

Names, phone numbers, addresses, account numbers, children's identities and other personal information must be removed before the material is used for training.

## Data pipeline

### 1. Ingestion

- Download from lawful, traceable sources.
- Preserve the original file and record its provenance.
- Calculate a content hash for deduplication and audit.
- Store the court, date and source metadata separately from OCR text.

### 2. Text extraction and OCR

- Use native PDF text when available.
- Use Urdu/English OCR only when required.
- Mark OCR-derived text as unverified.
- Require human review before unverified OCR enters the training set.
- Retain page boundaries so citations remain traceable.

### 3. Cleaning

- Remove navigation, repeated headers, stamps and duplicated pages.
- Normalize Urdu and English Unicode carefully without changing legal meaning.
- Detect duplicate and near-duplicate judgments.
- Separate judgments from petitions, annexures and unrelated attachments.

### 4. Structuring

Convert each judgment into the schema using extraction software, then require legal review for the fields used as prediction labels.

### 5. Versioning

Every dataset release should record:

- source inventory;
- cleaning rules;
- annotation guidelines;
- schema version;
- reviewer identity or reviewer pool;
- quality statistics;
- train, validation and test membership.

## Expert annotation

Pakistani lawyers or supervised legal researchers should label representative cases.

For every labelled example, capture:

- important facts;
- disputed facts;
- facts accepted by the court;
- evidence supporting each claim;
- missing or weak evidence;
- applicable law;
- applicant's strongest argument;
- respondent's strongest argument;
- actual outcome;
- decisive reasoning;
- preferred client-facing explanation.

Annotation guidance must distinguish **what a party alleged** from **what the court found**. Reviewer disagreements should be recorded and adjudicated rather than silently overwritten.

## Baseline before fine-tuning

WukaLAW should first establish a strong retrieval-augmented generation baseline.

The baseline answer must combine:

- selected case description;
- conversation history;
- timeline entries;
- verified uploaded documents;
- evidence linked to events;
- upcoming deadlines;
- relevant Pakistani legislation;
- similar judgments from the correct jurisdiction.

This baseline should be evaluated before training. Fine-tuning cannot compensate for missing or irrelevant source retrieval.

## Training strategy

### Stage 1: structured outcome baseline

Train interpretable baseline models on structured features before using a neural model. Compare:

- majority-class baseline;
- logistic regression;
- gradient-boosted trees;
- calibrated tree-based classifiers.

Initial labels may include:

- claim allowed;
- claim dismissed;
- partly allowed;
- remanded;
- settled/withdrawn;
- procedural or insufficient-data outcome.

This stage exposes data leakage, class imbalance and weak labels early.

### Stage 2: instruction fine-tuning

Use LoRA or QLoRA on an appropriate open model to teach:

- WukaLAW's required answer structure;
- Pakistani legal terminology;
- allegation-versus-evidence language;
- two-sided legal analysis;
- abstention when evidence is insufficient;
- concise, client-friendly explanations.

Do not train a foundation model from scratch. The expense and data requirements are not justified for the first production version.

### Stage 3: calibrated outcome modelling

Develop the outcome component separately from answer generation. Its probabilities must be calibrated on unseen decisions using methods such as Platt scaling or isotonic regression.

The language model may explain the outcome model's supported features, but it must not invent a probability or alter the model's value.

### Stage 4: lawyer-reviewed learning loop

WukaLAW can collect future training examples when a lawyer:

- corrects an answer;
- marks a citation relevant or irrelevant;
- changes an allegation to a supported fact;
- adds missing law;
- records the eventual case outcome.

Store the original output, corrections, sources and model version. Never train automatically on unreviewed client conversations.

## Required answer format

A case intelligence answer should normally contain:

1. **Direct answer**
2. **Your position** — clearly attributed to the client
3. **What the current evidence supports**
4. **What remains disputed or unverified**
5. **Relevant Pakistani law**
6. **Similar judgments and why they matter**
7. **Arguments supporting your position**
8. **Arguments the opposing side may raise**
9. **Possible outcome scenarios**
10. **Confidence and its limitations**
11. **Missing evidence and recommended next steps**

Preferred language:

> Based on the current record, this scenario appears more strongly supported. This is not a guaranteed court outcome.

Prohibited language:

> You will definitely win.

## Evaluation plan

### Retrieval evaluation

Measure:

- Recall@k;
- nDCG@k;
- jurisdiction and court accuracy;
- statute/case citation relevance;
- paragraph-level evidence coverage.

### Answer evaluation

Measure:

- factual faithfulness;
- citation correctness;
- distinction between allegation and established fact;
- completeness;
- usefulness according to lawyers;
- hallucination rate;
- correct refusal when information is insufficient.

### Outcome evaluation

Measure:

- macro F1, not accuracy alone;
- per-class precision and recall;
- Brier score;
- expected calibration error;
- performance by court, year, province and case type;
- false-confidence rate.

### Test-set design

Use a time-based holdout: train on earlier decisions and test on later, unseen decisions. Do not randomly place passages from the same judgment—or duplicate judgments—across training and test sets.

Maintain a smaller, lawyer-reviewed gold evaluation set that is never used for training or prompt development.

## Safety, privacy and governance

- Encrypt private client material at rest and in transit.
- Keep each client's cases isolated.
- Do not train on client documents without explicit, informed permission.
- Remove personal identifiers from training examples.
- Log the model version, retrieved sources and prediction version for every answer.
- Allow lawyers to report incorrect reasoning and citations.
- Re-evaluate after changes to datasets, embeddings, rerankers, prompts or models.
- Display a visible decision-support disclaimer.
- Never replace a lawyer, judge or court process with the model's output.

## Proposed delivery plan

| Phase | Approximate duration | Deliverable |
| --- | ---: | --- |
| Scope and schema | Weeks 1–2 | Family-law taxonomy, schema and annotation guide |
| Data acquisition | Weeks 3–6 | Provenance-tracked, deduplicated judgment corpus |
| RAG baseline | Weeks 5–8 | Citation-grounded case intelligence answers |
| Expert annotation | Weeks 7–10 | Lawyer-reviewed training and gold evaluation sets |
| Model baselines | Weeks 10–12 | Outcome classifier and instruction adapter |
| Validation | Weeks 13–14 | Calibration, safety and subgroup evaluation |
| Limited beta | Week 15 | Lawyer-supervised decision-support release |

The phases can overlap, but the evaluation set and leakage controls must be defined before model training.

## Immediate next actions

1. Approve Pakistani family law as the first scope.
2. Finalize the case dataset schema.
3. Inventory existing WukaLAW datasets and record their licences and provenance.
4. Build a 100-case lawyer-reviewed gold evaluation set.
5. Measure the current RAG assistant against that set.
6. Collect and clean the initial family-law corpus.
7. Train simple outcome baselines before selecting an open language model.
8. Add a lawyer feedback and correction workflow to WukaLAW.

## Definition of success

The first release is successful when it can:

- answer common case questions using the selected case's complete background;
- cite the exact law and judgment passages used;
- distinguish client statements from verified evidence;
- identify missing evidence;
- present both sides of the dispute;
- provide calibrated scenarios instead of guaranteed predictions;
- pass lawyer review at an agreed quality threshold;
- abstain safely when the record is inadequate.
