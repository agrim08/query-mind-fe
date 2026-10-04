<div align="center">

<img src="public/logo-horizontal.svg" alt="QueryMind" height="40" />

**Your database, in plain English.**

Ask a question. See the SQL being written. Get the results.

[![Next.js](https://img.shields.io/badge/Next.js-16-080909?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-080909?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-080909?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Clerk](https://img.shields.io/badge/Auth-Clerk-080909?style=flat-square)](https://clerk.com)

</div>

---

This repo is the Next.js frontend of QueryMind. The FastAPI backend (AI pipeline, safety layers,
schema indexing, accuracy evals) is [agrim08/query-mind-be](https://github.com/agrim08/query-mind-be).

## What you can do

- **Ask your database a question** in plain English. The SQL streams in token by token while it's
  written, then the results appear with row count, timing and a CSV download. Every answer shows
  the SQL, so you can check what was run.
- **Connect PostgreSQL databases.** The connection is tested before it's saved, then the schema is
  indexed with live progress (streamed over Server-Sent Events).
- **Look back at past questions** with their SQL, status and timing, and export the history as CSV
  or PDF.
- **Design a new database** with the Schema Designer: describe it in plain English, get an editable
  ER diagram (React Flow), and export it as runnable PostgreSQL or a PDF.
- **Teach it your business** on the Knowledge page: describe your business (type, paste or speak),
  let the AI draft it from your schema, and review the definitions it extracts (what "revenue" or
  "active customer" means for you). Mark good answers with 👍 so similar questions reuse them.
- **Ask follow-ups** like "now only Europe" or "by month": the next question builds on the last answer
  until you start a new topic. Starter questions fill the empty dashboard.
- **Plans** (Free, Pro, Team) through Clerk Billing. Limits are enforced by the backend; the frontend
  only reflects them.

## Tech stack

| Area | Choice |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript (strict) |
| Auth and billing | Clerk (`@clerk/nextjs`), route protection in `proxy.ts` |
| State | Zustand (query stream, selected connection, UI preferences) |
| Styling | Tailwind CSS v4 with design tokens in `app/globals.css` |
| Diagrams | React Flow (`@xyflow/react`) |
| Exports | jsPDF and html-to-image, loaded on demand |
| Icons | lucide-react |

## Project structure

```
app/
  (app)/          signed-in pages: dashboard, connections, history, design, billing, settings
  (auth)/         Clerk sign-in and sign-up
  page.tsx        landing page; robots, sitemap, manifest and Open Graph image routes alongside
components/       billing, design, landing, layout, providers, sql
lib/
  api.ts          the only module that calls the backend (fetch + SSE parsing) and its types
  store.ts        Zustand stores; uiStore.ts for persisted UI preferences
  plans.ts        plan limits shown in the UI
  schemaSql.ts    Schema Designer → PostgreSQL export
proxy.ts          Clerk route protection (Next.js 16 "proxy", formerly middleware)
```

## Running locally

Needs Node.js 20+, the backend running (see its README), and a Clerk application.

```bash
npm install
cp .env.example .env.local     # then fill it in
npm run dev                    # http://localhost:3000
```

| Variable | Notes |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | From the Clerk dashboard |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-in`, `/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/dashboard` |
| `NEXT_PUBLIC_API_URL` | Backend URL **including** `/api/v1`, e.g. `http://localhost:8000/api/v1` |
| `NEXT_PUBLIC_SITE_URL` | Public site URL for canonical links, Open Graph and the sitemap |

Checks before committing:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

---

Built by [Agrim Gupta](https://agrimdev.vercel.app) · [LinkedIn](https://linkedin.com/in/agrim-gupta08)
