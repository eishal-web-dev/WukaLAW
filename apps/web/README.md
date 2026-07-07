# WakuLaw — Web Frontend

React frontend for the WakuLaw MVP: legal document upload, structured
summaries, source-grounded Q&A, and similar-case search.

**Stack:** Vite · React 18 · TypeScript · Tailwind CSS v4 · react-router-dom

> WakuLaw is a decision-support and research tool. It does not provide legal
> advice.

## Setup

```bash
cd apps/web
npm install
npm run dev
```

The app runs at http://localhost:5173.

## Configuration

The frontend talks to the WakuLaw API. The base URL is read from
`VITE_API_BASE_URL` and defaults to `http://localhost:8000/api/v1` (the local
FastAPI backend).

To override it, copy `.env.example` to `.env` and edit the value:

```bash
cp .env.example .env
```

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

Restart `npm run dev` after changing environment variables.

## Scripts

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the dev server with HMR        |
| `npm run build`   | Type-check and build for production  |
| `npm run preview` | Preview the production build locally |
| `npm run lint`    | Lint the codebase                    |

## Pages

| Route             | Purpose                                              |
| ----------------- | ---------------------------------------------------- |
| `/`               | Landing page                                         |
| `/dashboard`      | Stats and recent documents                           |
| `/upload`         | Upload `.txt` / `.pdf` documents (max 20 MB)         |
| `/documents`      | Document list                                        |
| `/documents/:id`  | Document detail, summary, full extracted text        |
| `/ask`            | Q&A with confidence label and source paragraphs      |
| `/similar`        | Semantic similar-case search with similarity scores  |
