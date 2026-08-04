# TASK-012 Stratified BGE-M3 Legal Retrieval Report

## Decision

**Do not proceed with full-corpus dense-only embedding yet.** The stratified evaluation shows strong exact-law lookup but weak semantic judgment retrieval. The recommended production direction is **hybrid dense + lexical retrieval, metadata filtering, and reranking**, followed by a new grounded evaluation.

## Corpus inventory

- Source chunks: 70,244
- Source datasets: judgments 26,483; labeled_cases 26,483; laws 17,278
- Document types: judgments 52,966; laws 17,278
- Languages: English 70,008; Urdu 200; Unknown 28; mixed 8
- Major categories: Constitutional Cases 27,273; Suo Moto 9,077; Human Rights 5,365; Civil Appeals 2,935; Tax Cases 2,844; Constitutional Petitions 2,550; Tax Revenue 2,471; Criminal Appeals 1,726; Review 1,366; Family Law 993; Service 264; Family Cases 59
- Chunk types: judgment_body 45,844; section 15,714; case_header 6,068; outcome 1,038; body 994; chapter 283; part 184; article 89; reasoning 30

Family and service are comparatively weak; explicit reasoning/findings chunks and templates are scarce. English constitutional, civil, criminal, tax, human-rights, suo-moto, review, and statutory material are well represented.

## Sampling strategy

Seed 42 selects documents first and then representative chunks, caps each document at two chunks, excludes empty/OCR-pending text and exact duplicate hashes, and ranks outcome/reasoning/findings/article/section/judgment-body material ahead of headers. Cross-dataset duplicate hashes are resolved at selection time so richer category metadata is not lost.

- Target/selected: 600/600 canonical chunks
- Unique duplicate hashes: 600
- Documents represented: 573
- Composition: 433 judgment chunks and 167 law chunks
- Source datasets selected: labeled_cases 324; laws 167; judgments 109
- No stratum shortfalls
- Generated sample and embedding artifacts remain under ignored `datasets/processed/` paths.

### Strata

| Stratum | Requested | Available | Selected | Shortfall |
|---|---:|---:|---:|---:|
| laws_acts | 38 | 17278 | 38 | 0 |
| constitutional_cases | 38 | 27273 | 38 | 0 |
| constitutional_petitions | 38 | 2550 | 38 | 0 |
| criminal_appeals | 38 | 1726 | 38 | 0 |
| civil_appeals | 38 | 2935 | 38 | 0 |
| family | 38 | 2154 | 38 | 0 |
| labour_employment | 38 | 1996 | 38 | 0 |
| service | 38 | 665 | 38 | 0 |
| tax_revenue | 37 | 5686 | 37 | 0 |
| bail | 37 | 2280 | 37 | 0 |
| evidence | 37 | 8264 | 37 | 0 |
| human_rights | 37 | 5365 | 37 | 0 |
| suo_moto | 37 | 9077 | 37 | 0 |
| review_petitions | 37 | 1366 | 37 | 0 |
| explicit_outcomes | 37 | 1038 | 37 | 0 |
| templates | 37 | 2588 | 37 | 0 |

## Model and execution

- Model: `BAAI/bge-m3`
- Revision: `5617a9f61b028005a4858fdac845db406aefb181`
- Device: CPU
- Loading: cache-only/offline from `C:\Users\USER\.cache\huggingface`
- Dimension: 1024
- Normalized: yes; observed norms 0.99999988–1.00000012
- Finite values: all
- Metadata/vector rows: 600/600; indexes sequential and aligned
- Initial batch fallbacks: 8 → 4 → 2 → 1 after native memory termination
- Stable setting: batch 1 with explicit 512-token ceiling
- Truncated prepared inputs: 444 (warnings retained in embedding metadata; source chunks unchanged)
- Record failures: 0
- Wall time for stable process: approximately 12 h 8 m; effective worker CPU about 4 h 8 m. Wall time was inflated by a stale batch-8 child process until it was identified and stopped.
- Evaluation time after model load: 13.7 seconds

The existing checkpoint format records counts but does not persist partial vectors. A timed-out wrapper also left a child alive; production generation should add true batch-level atomic partial artifacts and process ownership before another large run.

## Query-set design

Forty deterministic English queries were generated from sampled text and metadata: 38 grounded queries and two deliberate no-match controls. Styles include exact lookup, paraphrase, fact pattern, similar case, and outcome; difficulty is balanced (13 easy, 13 medium, 14 hard). Ground-truth chunk IDs are copied from sampled records, never invented.

## Overall metrics

| Metric | Dense BGE-M3 | Lexical baseline |
|---|---:|---:|
| Recall@1 | 0.3947 | 0.4737 |
| Recall@3 | 0.5 | 0.6053 |
| Recall@5 | 0.5 | 0.7105 |
| Recall@10 | 0.5263 | 0.7368 |
| Precision@5 | 0.1 | 0.1421 |
| Precision@10 | 0.0526 | 0.0737 |
| MRR | 0.4467 | 0.5577 |
| nDCG@5 | 0.4577 | 0.5928 |
| nDCG@10 | 0.4665 | 0.6011 |

The lexical baseline beats dense retrieval at every reported cutoff. Dense exact lookup is strong (Recall@10 1.0, MRR 0.9375), while semantic queries are weak (Recall@10 0.4, MRR 0.3159). Law retrieval is much stronger than judgment retrieval (Recall@10 0.9333 vs 0.2609).

## Grouped results

### Domain

| Domain | R@1 | R@5 | R@10 | MRR |
|---|---:|---:|---:|---:|
| bail | 1.0 | 1.0 | 1.0 | 1.0 |
| civil | 0.5 | 0.5 | 0.5 | 0.5 |
| constitutional | 0.0 | 0.0 | 0.25 | 0.0357 |
| criminal | 0.3333 | 0.3333 | 0.3333 | 0.3333 |
| evidence | 1.0 | 1.0 | 1.0 | 1.0 |
| family | 0.3333 | 0.3333 | 0.3333 | 0.3333 |
| human_rights | 0.3333 | 0.3333 | 0.3333 | 0.3333 |
| labour | 0.6667 | 1.0 | 1.0 | 0.8333 |
| laws | 0.6667 | 1.0 | 1.0 | 0.7778 |
| review | 0.0 | 0.3333 | 0.3333 | 0.1667 |
| service | 0.6667 | 1.0 | 1.0 | 0.8333 |
| suo_moto | 0.0 | 0.0 | 0.0 | 0.0 |
| tax | 0.3333 | 0.3333 | 0.3333 | 0.3333 |

Best domains were bail and evidence (R@10/MRR 1.0), followed by labour and service (R@10 1.0, MRR 0.8333). Worst was suo_moto (all zero), followed by constitutional (R@10 0.25, MRR 0.0357).

### Difficulty

| Difficulty | R@1 | R@5 | R@10 | MRR |
|---|---:|---:|---:|---:|
| easy | 0.3077 | 0.4615 | 0.4615 | 0.3846 |
| hard | 0.25 | 0.3333 | 0.3333 | 0.2778 |
| medium | 0.6154 | 0.6923 | 0.7692 | 0.6648 |

## Per-query results

| Query | Domain/style | First relevant | R@10 | Top result | Failure |
|---|---|---:|---:|---|---|
| sq001: 21D. Bail. âˆ’ (1) Notwithstanding the provisions of sections 439, 49... | bail/exact_lookup | 1 | 1.0 | THE ANTI -TERRORISM ACT, 1997 — wc_c38bce9c9924403410e7dcb105e23414 | hit |
| sq002: legal rules concerning supreme cannot sight | civil/paraphrased_lookup | — | 0.0 | 2091 C.A Supreme (351) — wc_e6f6b186e7dd97ca00124a9f1a84c3ab | low semantic score |
| sq003: What law applies to a dispute involving supreme learned counsel? | constitutional/fact_pattern | — | 0.0 | 362 C.A Supreme (1323) — wc_48a79a1e64a5c32c227a0a5fc2d1ba1c | low semantic score |
| sq004: Find similar Pakistani cases about supreme observed system | criminal/similar_case | — | 0.0 | 615 C.A Supreme (1551) — wc_08b20805f2a612c43f50240d365254d2 | low semantic score |
| sq005: What outcome was recorded regarding electronic transaction ordinance | evidence/outcome | 1 | 1.0 | THE ELECTRONIC TRANSACTION S ORDINANCE , 2002 — wc_5cb2b4d192812b8ccc6e4ce400821110 | hit |
| sq006: 11. Removal of an offender in custody to any other place in Pakistan ... | family/exact_lookup | 1 | 1.0 | THE TRANSFER OF OFFENDERS ORDINANCE, 2002 — wc_011a52ffc120eb8e3b07c8a9b72359c0 | hit |
| sq007: legal rules concerning supreme civil application | human_rights/paraphrased_lookup | 1 | 1.0 | 2494 C.A Supreme (714) — wc_016911b11c340fbe8b39b6adf5fabcb9 | hit |
| sq008: What law applies to a dispute involving bahria university ordinance? | labour/fact_pattern | 1 | 1.0 | THE BAHRIA UNIVERSITY ORDINANCE 2000 — wc_00051f465222d935744d6b3a6eb2d9ea | hit |
| sq009: Find similar Pakistani cases about institute culture powers | laws/similar_case | 3 | 1.0 | THE PAKISTAN INSTITUTE OF FASHION AND DESIGN — wc_1bc96cfdf63acb0fc238b4e34885f9a6 | hit |
| sq010: What outcome was recorded regarding supreme dated balochistan | review/outcome | 2 | 1.0 | 2202 C.A Supreme (451) — wc_9553b53f906e1ee32ef72b59b468bfdb | hit |
| sq011: 7. Functions of Board of Advanced Studies and Research.___ The functi... | service/exact_lookup | 1 | 1.0 | THE FOUNDATION UNIVERSITY ORDINANCE, 2002 — wc_161107007e3aed5d34a8b7f4bef5d755 | hit |
| sq012: legal rules concerning supreme learned counsel | suo_moto/paraphrased_lookup | — | 0.0 | 752 C.A Supreme (1675) — wc_24a5fe42f0fb177b97ec3e2f4c231d8f | low semantic score |
| sq013: What law applies to a dispute involving supreme would attention? | tax/fact_pattern | — | 0.0 | 1841 C.A Supreme (2655) — wc_4b9c57bc4e221c21bdf59dd080c5eeaa | low semantic score |
| sq014: Find similar Pakistani cases about supreme regarding pensionary | civil/similar_case | 1 | 1.0 | 1949 C.A Supreme (2752) — wc_0acd63be322bab54f6c18084a6078836 | hit |
| sq015: What outcome was recorded regarding supreme mention arguments | constitutional/outcome | — | 0.0 | 2202 C.A Supreme (451) — wc_9553b53f906e1ee32ef72b59b468bfdb | low semantic score |
| sq016: 4. We have seen the evaluation reports prepare d by the evaluators en... | criminal/exact_lookup | 1 | 1.0 | 781 C.A Supreme (1700) — wc_077404305925734902bbcb48edc49ae7 | hit |
| sq017: legal rules concerning public recording evidence | evidence/paraphrased_lookup | 1 | 1.0 | THE PUBLIC DEBT ACT, 1944 — wc_fa622ba94fe63c15878742f5b4d3a746 | hit |
| sq018: What law applies to a dispute involving supreme heard learned? | family/fact_pattern | — | 0.0 | 752 C.A Supreme (1675) — wc_24a5fe42f0fb177b97ec3e2f4c231d8f | low semantic score |
| sq019: Find similar Pakistani cases about supreme examination record | human_rights/similar_case | — | 0.0 | 615 C.A Supreme (1551) — wc_08b20805f2a612c43f50240d365254d2 | low semantic score |
| sq020: What outcome was recorded regarding risks insurance ordinance | labour/outcome | 1 | 1.0 | THE WAR RISKS INSURANCE ORDINANCE, 1971 — wc_0f7fb27fc3be3552515cdd2c0196eaa1 | hit |
| sq021: 4. Functions and Powers of the Institute. â€” The institute shall be ... | laws/exact_lookup | 1 | 1.0 | THE PAKISTAN INSTITUTE OF RESEARCH AND — wc_03bb10da485f5c37627c7772f69aa775 | hit |
| sq022: legal rules concerning supreme reasons recorded | review/paraphrased_lookup | — | 0.0 | 1841 C.A Supreme (2655) — wc_4b9c57bc4e221c21bdf59dd080c5eeaa | low semantic score |
| sq023: What law applies to a dispute involving bahria university ordinance? | service/fact_pattern | 2 | 1.0 | THE BAHRIA UNIVERSITY ORDINANCE 2000 — wc_00051f465222d935744d6b3a6eb2d9ea | hit |
| sq024: Find similar Pakistani cases about supreme moreover interpreting | suo_moto/similar_case | — | 0.0 | 615 C.A Supreme (1551) — wc_08b20805f2a612c43f50240d365254d2 | low semantic score |
| sq025: What outcome was recorded regarding counter duties ordinance | tax/outcome | — | 0.0 | THE TEA (CONTROL OF PRICES, DISTRIBUTION AND MOVEMENT)ORDINANCE, 1960 — wc_5a5a91a0a999c0bc6b665b3320d0a9c4 | low semantic score |
| sq026: 9. In order to streamline the proper administration of a service, cadre | civil/exact_lookup | 1 | 1.0 | 2698 C.A Supreme (899) — wc_0c5c99be96dddd546ba44e23e84499d9 | hit |
| sq027: legal rules concerning supreme petitioner apply | constitutional/paraphrased_lookup | — | 0.0 | C.A Supreme (1774) — wc_8b5abab579bd1d4935070d378f8aa6c7 | low semantic score |
| sq028: What law applies to a dispute involving supreme great significance? | criminal/fact_pattern | — | 0.0 | 1841 C.A Supreme (2655) — wc_4b9c57bc4e221c21bdf59dd080c5eeaa | low semantic score |
| sq029: Find similar Pakistani cases about supreme appears weighed | family/similar_case | — | 0.0 | 1729 C.A Supreme (2554) — wc_4d0fcd2ff5f9d1e6747b254d1779088a | low semantic score |
| sq030: What outcome was recorded regarding supreme words phrases | human_rights/outcome | — | 0.0 | 2202 C.A Supreme (451) — wc_9553b53f906e1ee32ef72b59b468bfdb | low semantic score |
| sq031: 2. Definitions.â€• (1) In this Ordinance, unless there is anything re... | labour/exact_lookup | 2 | 1.0 | THE PRESIDENTâ€™S SALARY, ALLOWANCES AND PRIVILEGES ACT, 1975. — wc_9bc3d9d6ebe92b3f93e304485697f0dd | hit |
| sq032: legal rules concerning pakistan environmental protection | laws/paraphrased_lookup | 1 | 1.0 | THE PAKISTAN ENVIRONMENTAL PROTECTION ACT, 1997 — wc_0ca9f6b5090009bc7d17d50efa077c51 | hit |
| sq033: What law applies to a dispute involving supreme pakistan appellate? | review/fact_pattern | — | 0.0 | 457 C.A Supreme (1409) — wc_b144eba489b635542f44e4fcff4e8bb8 | low semantic score |
| sq034: Find similar Pakistani cases about pakistan halal authority | service/similar_case | 1 | 1.0 | THE PAKISTAN HALAL AUTHORITY ACT, 2016 — wc_1e5851eb524d2a11c7493621dc79c83c | hit |
| sq035: What outcome was recorded regarding supreme question urged | suo_moto/outcome | — | 0.0 | 2202 C.A Supreme (451) — wc_9553b53f906e1ee32ef72b59b468bfdb | low semantic score |
| sq036: 18. Provisions as to composite insurers.___(1) For the rem oval of do... | tax/exact_lookup | 1 | 1.0 | THE LIFE INSURANCE (NATIONALISATION) ORDER , 1972 — wc_216062d84d69724e3504919318799900 | hit |
| sq037: legal rules concerning supreme disputed petitioner | civil/paraphrased_lookup | — | 0.0 | THE NON -PERFORMING ASSETS AND REHABILITATION OF — wc_5b61f6c378d0444d196b074a8e809c39 | low semantic score |
| sq038: What law applies to a dispute involving supreme learned counsel? | constitutional/fact_pattern | 7 | 1.0 | 362 C.A Supreme (1323) — wc_48a79a1e64a5c32c227a0a5fc2d1ba1c | hit |
| sq039: quantum computing patents on Mars | no_match/no_match | — | 0.0 | THE PAKISTAN SCIENCE FOUNDATION ACT, 1973 — wc_8a58e8c46a09c36fe32719a80b0423cf | relevant content absent from sample |
| sq040: Antarctic maritime whaling treaty dispute | no_match/no_match | — | 0.0 | 2348 C.A Supreme (583) — wc_56282a5cfb84a96a48fafb25c03bcad8 | relevant content absent from sample |

## Failure analysis

- 20 of 38 grounded queries retrieved a relevant chunk within top 10.
- 18 grounded queries were classified as low semantic score.
- Two no-match controls correctly have no relevant content in the sample.
- Dense filtered queries were weak (R@10 0.2917) relative to unfiltered queries (0.9286); these fixtures express filter expectations but this local dense evaluator does not apply a production metadata-filter stage.
- The high truncation rate, sparse judgment ground truth, category vocabulary overlap, and lack of reranking plausibly depress semantic judgment retrieval. These are measured/inferred limitations, not LLM judgments.

## Recommendation

Use hybrid dense + lexical retrieval, apply metadata filters as a separate stage, and rerank the merged candidates. Re-evaluate with broader human-reviewed relevance pools before full generation. Do not treat the current single-positive ground truth as exhaustive: some unlabelled top results may be legally relevant but are counted non-relevant by design.

Do **not** proceed with the full corpus on this CPU workflow yet. At the measured effective CPU time, approximately 42,649 canonical chunks would require roughly 12 CPU-days, excluding contention and retries. Raw float32 vectors would require about 174.7 MB, plus metadata/index overhead. For a production GPU run, plan approximately 12–16 GB VRAM, tune batch and sequence length empirically, retain checkpointable partial artifacts, and expect model/runtime-specific throughput testing rather than relying on this CPU extrapolation.

## Integrity and exclusions

- `datasets/processed/chunks.jsonl` SHA-256 remained `bd653ed61514fcefcb523a4db4b3aaefe48ab3b9af4d68d57dea9f8397616ce1`.
- `datasets/raw`, source processed datasets, production Qdrant, and existing first-200 fake/BGE artifacts were not modified by TASK-012.
- No model download, second neural model, fake embedding, LLM, Qdrant indexing, or commit was performed.


