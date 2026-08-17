# WakuLaw — User Guide

**Closes #40.** This guide covers the live MVP features: what a user can actually do today, end to end.

WakuLaw is a decision-support and research tool for Pakistani legal research. It is **not legal advice** and does not replace a lawyer, judge, or court. Every AI answer shows its sources and a confidence level, or tells you it doesn't have enough information rather than guessing.

## 1. Getting started

### 1.1 Running the app

- **Easiest:** `python run.py` from the repo root — installs dependencies on first run and starts both the frontend and backend. Press Ctrl+C to stop.
- **Docker:** `docker compose -f docker/docker-compose.yml up --build`
- **Manual:** `make setup`, then `make api` and `make web` in separate terminals.

Once running:
- App: http://localhost:5173
- API docs (Swagger): http://localhost:8000/docs

### 1.2 Better AI answers (optional)

By default, Q&A uses an extractive fallback (it pulls and ranks sentences directly from your documents). For more natural answers, install [Ollama](https://ollama.com) and run:

```
ollama pull qwen2.5:3b
```

WakuLaw detects Ollama automatically — no configuration needed.

### 1.3 Create an account

Go to `/register`, provide an email, name, and a password of at least 8 characters. You'll be logged in immediately and redirected to the dashboard. Existing users log in at `/login`.

Your data is private: every document, case, and query is scoped to your account. Other users cannot see or query your documents.

## 2. Uploading and viewing documents

1. Go to **Documents** (`/documents`) and upload a `.txt` or `.pdf` file (up to 20 MB).
2. WakuLaw extracts the text, cleans it (removes page numbers, rejoins hyphenated words, normalizes whitespace), and splits it into overlapping chunks for search.
3. Click a document to open **Document Detail** (`/documents/:id`), where you can read the extracted text and (optionally) attach it to a case.

**Note:** scanned/image PDFs with no extractable text are rejected — OCR support is planned but not yet built. If a PDF returns fewer than 20 extractable words, upload will fail with an explanation.

## 3. Summarizing a document

From **Document Detail**, generate a summary. WakuLaw produces a structured, extractive summary — sentences taken directly from your document, never invented:

- **Main issue**
- **Key facts**
- **Legal points**
- **Outcome** (if the document states one)
- **Short summary**

The summary is cached, so re-opening the document won't regenerate it. Because it's extractive rather than generative, it cannot hallucinate facts that aren't in the source text.

## 4. Organizing documents into cases

Go to **Cases** (`/cases`) to create, view, edit, or delete cases. Each case gets an auto-generated number (e.g. `WL-2026-014`), and you can set:

- **Status:** Active, Review, On Hold, or Closed
- **Priority:** Low, Medium, High, or Critical
- **Description and deadline** (optional)

Open a case (`/cases/:id`) to see its attached documents, upload a new document directly into it, or attach an existing document. Deleting a case detaches its documents rather than deleting them.

## 5. Asking questions (Legal Q&A / RAG)

Go to **AI Chat** (`/ai-chat`) and ask a question in plain language. WakuLaw only answers from documents you've uploaded — it will not invent case law or legal facts. Depending on what you ask, you'll get one of a few response types:

| What you ask | What happens |
|---|---|
| "How many documents do I have?" / "List my documents" | Answered directly from your document list — no AI generation needed |
| A single word or something too vague | WakuLaw asks you to be more specific and gives example questions |
| A short lookup, e.g. a person's name | WakuLaw reports which documents contain that term and the best-matching sentences |
| A real question about your documents' content | WakuLaw retrieves the most relevant passages and generates a grounded answer |

Every substantive answer includes:
- **Sources** — shown as "N passages from M documents," grouped by document
- **Confidence** — High, Medium, or Low, each with a one-line reason based on how closely the retrieved passages match your question

If nothing in your documents is relevant enough, WakuLaw says so directly ("not enough information") instead of guessing, and shows no sources.

## 6. Finding similar cases

Go to **Similar Cases** (`/similar-cases`) and enter a query describing a case or legal issue. WakuLaw searches your uploaded documents semantically (by meaning, not just keyword match) and returns the closest-matching passages, grouped by document, each with a similarity score.

Queries with no meaningfully similar content return an empty result rather than weak, misleading matches.

## 7. Dashboard, Evidence, and Profile

- **Dashboard** (`/dashboard`) — live overview: document/case counts and recent activity.
- **Evidence** (`/evidence`) — documents grouped per case.
- **Profile** (`/profile`) — your account details.

## 8. Screens still in preview

The following screens are part of the full product vision and are visible in the UI (with an amber "preview" banner) but currently run on sample data, not your real documents: **Workspace, Prediction, Explainable AI, Timeline, Reports, Analytics, Notifications, Admin, Settings**. They're included so the full design is demoable, but nothing you do on these screens is saved or reflects your actual data yet.

The **Landing, About, Practice Areas, Case Studies, Contact, Find Lawyer,** and **Lawyer Profile** pages are static marketing content and not connected to your account data.

## 9. Understanding confidence and limitations

- WakuLaw's confidence levels reflect how closely your documents match your question — not legal correctness. A "high confidence" answer is well-grounded in your uploaded text; it is not a legal opinion.
- English only; Urdu support is future scope.
- Retrieval quality depends on the embedding model in use; improvements (reranking, hybrid search) are in progress.
- All AI outputs may contain errors. Always verify against the original source document before relying on any answer.

## 10. Getting help

If something looks wrong or a feature described here isn't behaving as expected, check `docs/00_MVP/MASTER_SYSTEM_DOCUMENT.md` for the current authoritative feature list, or open an issue.
