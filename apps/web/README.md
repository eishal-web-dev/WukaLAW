# WakuLaw — Web Frontend

React frontend for the WakuLaw MVP, rebuilt on the Figma design system:
gold/dark legal-intelligence UI with marketing pages, a full app shell
(sidebar + topbar), live backend integration where the API supports it, and
clearly-labelled preview screens for features still in development.

**Stack:** Vite · React 18 · TypeScript · Tailwind CSS v4 · shadcn/ui ·
react-router-dom · recharts · lucide-react

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

The frontend talks to the WukaLAW API. During local development, requests use
`/api` and Vite proxies them to `http://127.0.0.1:8000`. This works even if
Vite selects a port other than 5173 and avoids browser CORS failures.

To override it, copy `.env.example` to `.env` and edit the value:

```bash
cp .env.example .env
```

```env
VITE_API_BASE_URL=
VITE_DEV_API_TARGET=http://127.0.0.1:8000
```

For a deployed frontend, set `VITE_API_BASE_URL` to the public FastAPI URL,
including `/api/v1`. Restart `npm run dev` after changing either variable.

Auth uses a bearer token kept in `localStorage` (`wakulaw_token` /
`wakulaw_user`). A 401 from any protected endpoint clears the session and
redirects to `/login`.

## Scripts

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the dev server with HMR        |
| `npm run build`   | Type-check and build for production  |
| `npm run preview` | Preview the production build locally |
| `npm run lint`    | Lint the codebase                    |

## Screens

### Public (marketing — static content)

| Route              | Purpose                                   |
| ------------------ | ----------------------------------------- |
| `/`                | Landing page (Sign In → `/login`, Get Started → `/register`) |
| `/about`           | About / mission                           |
| `/practice-areas`  | Practice areas grid                       |
| `/case-studies`    | Case studies with filters                 |
| `/contact`         | Contact form (static)                     |
| `/find-lawyer`     | Lawyer directory (sample data)            |
| `/lawyer-profile`  | Lawyer profile + booking flow (sample)    |

### Live (wired to the backend API)

| Route              | Backend integration                                            |
| ------------------ | -------------------------------------------------------------- |
| `/login`           | `POST /auth/login`; redirects to `/dashboard` when authed      |
| `/register`        | `POST /auth/register` (password ≥ 8 chars)                     |
| `/dashboard`       | Real case + document counts, recent cases, deadlines (activity chart is sample) |
| `/cases`           | Full case CRUD — create / edit / delete / filter (`/cases` endpoints) |
| `/cases/:id`       | Case detail, per-case document list, upload-into-case          |
| `/documents`       | Real list + drag-and-drop upload with progress                 |
| `/documents/:id`   | Extracted text, structured summary, Generate Summary           |
| `/evidence`        | Selected case's documents (this IS the case-documents view for now) |
| `/ai-chat`         | `POST /ask` — answer with line breaks, confidence badge + reason, grouped sources ("N passages from M documents"), model label |
| `/similar-cases`   | `POST /similar-cases` — results grouped by document with scores |
| `/profile`         | `GET /auth/me` + sign out                                       |
| `/notifications`   | Persisted alerts, live unread badges, filters, read/delete actions, and saved in-app preference |

All app routes require authentication (redirect to `/login`); `/login` and
`/register` redirect to `/dashboard` when already signed in. AI outputs always
carry the permanent disclaimer: *"Decision-support only — not legal advice."*

### Preview (sample data, amber "Preview" banner)

| Route            | Screen                          |
| ---------------- | ------------------------------- |
| `/workspace`     | Case Workspace (3-panel)        |
| `/prediction`    | AI Court Prediction             |
| `/explainable`   | Explainable AI                  |
| `/timeline`      | Timeline Intelligence           |
| `/reports`       | Reports                         |
| `/analytics`     | Analytics                       |
| `/settings`      | Settings (in-app notification preference is persisted; remaining controls are preview) |
| `/admin`         | Admin dashboard                 |

## Project layout

```
src/
  lib/          api.ts (typed client), auth.tsx, notifications.tsx, sources.ts, format.ts,
                theme.tsx (dark/light), mock.ts (preview sample data)
  components/   AppShell (sidebar/topbar), PublicShell (marketing nav/footer),
                design.tsx (Btn/Card/Badge/KPICard/… primitives),
                UploadZone, PreviewBanner, Disclaimer, RouteGuards, ui/ (shadcn kit)
  pages/        one file per screen
  styles/       Tailwind v4 theme tokens (gold/dark + wk-light)
```
