# WakuLaw — Demo Script

**Closes #37.** The last of M9's five deliverables (pytest suite, CI, testing report, user guide, demo script) — the other four are already done; see `MASTER_SYSTEM_DOCUMENT.md` §2 and `docs/TESTING_REPORT.md`.

This is a literal, presenter-ready script: what to say, what to click, and what should appear on screen, following the flow in `ROADMAP.md`'s "Demo flow" outline. Target runtime: 8–10 minutes.

---

## Before you start

- [ ] `python run.py` (or `make api` + `make web`) running, both servers up
- [ ] App loads at http://localhost:5173
- [ ] A test account exists, or you're prepared to register live (takes 10 seconds — fine to do on camera, it shows the auth flow works)
- [ ] One real Pakistani court judgment ready as a `.txt` or `.pdf` file (a public judgment from `scp.gov.pk` or similar — see `docs/00_MVP/DATASETS.md` for sources). Keep it under 20 MB and under a few pages so extraction/summarization run fast live.
- [ ] Know in advance: does this environment have Ollama running (`ollama pull qwen2.5:3b`)? If not, that's fine — say so out loud when you reach Q&A (see step 5's note).
- [ ] Close any other tabs/notifications — this is a legal-research tool, keep the screen clean

**If anything breaks mid-demo:** stay calm, say what should have happened, and move to the next step. A live demo failing gracefully with an honest explanation is more convincing than a scripted video — this product's whole positioning is "we show you when we're not sure," so narrating a hiccup honestly is on-brand, not embarrassing.

---

## 1. Open WakuLaw (30 sec)

Land on the marketing homepage (`/`). Say: *"WakuLaw is an explainable AI legal research platform for Pakistani law — everything you're about to see runs locally, and every AI answer shows its evidence or tells you when it doesn't have enough."*

Click **Login** (or **Register** if this is a fresh account) → land on `/dashboard`.

## 2. Upload a judgment (1 min)

Go to **Documents** → drag in your prepared judgment file.

Say while it processes: *"On upload, we extract the text, clean it — strip page numbers, fix hyphenation — and split it into overlapping chunks for search."*

Click the new document to open **Document Detail**. Point out the extracted text is readable and matches the source.

**If it's a scanned PDF with no text layer:** this is now handled — OCR kicks in automatically (see the `ocr_used` badge on the document card). Worth mentioning if your sample happens to be a scan: *"and if the PDF is a scan with no text layer, OCR runs automatically to recover it — you'll see this badge."*

## 3. Generate a summary (1 min)

Click **Generate Summary**. Say: *"This isn't a language model paraphrasing — it's extractive. Every sentence you see is pulled directly from the document, ranked by relevance. It cannot hallucinate a fact that isn't in the source."*

Point out the four sections: **main issue, key facts, legal points, outcome** (if the judgment states one).

## 4. Organize into a case (30 sec, optional — skip if short on time)

Go to **Cases** → **New Case** → give it a title, attach the document you just uploaded. Say: *"Real users are usually working a caseload, not one document at a time — WakuLaw tracks status and priority per case."* This step is skippable if you're tight on time; steps 5–7 are the core of the demo.

## 5. Ask a legal question (1.5 min)

Go to **AI Chat**. Ask something the judgment actually addresses — e.g. *"What was the outcome of this case?"* or a specific factual question.

**Before you ask, say:** *"Depending on whether a local LLM is running, this either generates a natural-language answer or falls back to pulling and ranking the most relevant sentences directly — either way, you always see the sources."*

Point out on the response:
- The **answer**
- **Sources**, shown as "N passages from M documents," grouped by document
- **Confidence** (High/Medium/Low) with its one-line reason

Then ask something the document *doesn't* cover — e.g. *"What is the capital of France?"* Say: *"Watch what happens when there's nothing relevant to answer from."* It should refuse — "not enough information," no sources. **This refusal is the most important moment in the whole demo:** it's the proof that the system won't guess.

## 6. Find similar cases (1 min)

Go to **Similar Cases**. Enter a query describing the type of dispute in your uploaded judgment (e.g. "bail application" or "property possession dispute").

Say: *"This is semantic search — it matches by meaning, not just keywords."* Point out the similarity scores and that results are grouped by document.

## 7. Show the explainability angle explicitly (1 min)

This isn't a separate screen — it's woven through everything you already showed. Say explicitly: *"Every AI output you've seen — the summary, the Q&A answer, the similar-case matches — showed you its evidence and a confidence level. That's not a bolted-on feature, it's the core design: the system is built to refuse rather than guess, and to show its work rather than assert an answer."*

If time allows, briefly open **Explainable AI** (`/explainable`) — note out loud that this and a few other screens (Workspace, Prediction, Timeline, Reports, Analytics, Notifications, Admin, Settings) are **preview screens**: visible with an amber banner, running on sample data, part of the full product vision but not yet connected to real user data. Being upfront about this distinction is more credible than hiding it.

## 8. Limitations and future scope (1 min)

Close with honesty — this is a strength of the project, not a weakness to gloss over:

- **Not legal advice.** Decision-support and research only; every screen carries this disclaimer.
- **English only** for now; Urdu is future scope.
- **Scanned PDFs** now go through OCR automatically, but quality depends on scan resolution.
- **Retrieval quality** is an active area of work — a recent evaluation found room to improve semantic search, and hybrid lexical+dense retrieval and reranking are built and in review.
- **Out of scope by design:** outcome prediction, courtroom simulation, bias/fairness detection — all deferred because they need labeled data that doesn't publicly exist for Pakistani law yet. See `docs/00_MVP/ETHICS_AND_LIMITATIONS.md` for the full reasoning.

**Closing line:** *"The goal wasn't to build something that sounds confident — it was to build something that's honest about what it knows, and useful within those limits."*

---

## Timing summary

| Step | Time |
|---|---|
| 1. Open | 0:30 |
| 2. Upload | 1:00 |
| 3. Summarize | 1:00 |
| 4. Case (optional) | 0:30 |
| 5. Q&A (incl. refusal) | 1:30 |
| 6. Similar cases | 1:00 |
| 7. Explainability | 1:00 |
| 8. Limitations | 1:00 |
| **Total** | **~8 min** (7.5 without step 4) |

## If asked questions afterward

- **"How is this different from ChatGPT answering legal questions?"** → It only answers from documents you uploaded, always shows sources, and refuses rather than guessing — ChatGPT will confidently answer from general training data with no way to verify it against Pakistani law specifically.
- **"Is this production-ready?"** → It's an FYP-scoped MVP: functionally complete for the core flow, honest about what's preview vs. live, and open about known limitations (see `docs/00_MVP/MASTER_SYSTEM_DOCUMENT.md` §12).
- **"What's next?"** → Retrieval-quality improvements (hybrid search, reranking — in review now), a properly evaluated retrieval benchmark, and — if a labeled dataset can be built — an honest, clearly-caveated outcome-prediction prototype.
