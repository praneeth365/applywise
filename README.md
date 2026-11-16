# ApplyWise

**AI-powered job application manager — track applications, tailor your resume with AI, and practice interviews in one workspace.**

ApplyWise is a full-stack Next.js application that helps job seekers run an organized, data-driven job search. It combines a visual application tracker with Gemini AI tooling for resume optimization and mock interview practice, all behind secure Supabase authentication.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Database Setup](#database-setup)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Security Notes](#security-notes)

---

## Overview

Job hunting is chaotic: applications live in spreadsheets, resumes get rewritten per role, and interviews require focused preparation. ApplyWise unifies that entire workflow into a single SaaS-style dashboard:

- A **Kanban / table tracker** for every application and its stage.
- An **AI resume analyzer** that scores your resume against a job description (ATS match), highlights missing keywords, and rewrites bullets.
- An **AI mock interview coach** that generates role-specific questions and scores your answers in real time.

All data is stored per-user in Supabase (Postgres) with row-level security, and protected routes are enforced through middleware-backed auth.

---

## Key Features

### 📋 Kanban / Table Application Tracker
- Toggle between **Table** and **Board (Kanban)** views of every application.
- Status pipeline: **Wishlist → Applied → Interviewing → Offer → Rejected**.
- Search by company or role, filter by status with live counts, and sort by newest, highest match score, or company.
- Add / edit applications via a modal and inspect details in a side drawer.
- Dashboard with KPI cards, pipeline overview, and recent applications.

### 📄 PDF Resume ATS Analyzer (Gemini AI)
- Upload a **PDF** resume or paste raw text, then pair it with a target job description.
- Get an **ATS match score (0–100)**, a two-sentence summary, three concrete strengths, and tailored, impact-driven bullet rewrites.
- See **matched skills** and **missing keywords** critical to the ATS.
- Optionally link an analysis to an existing application and write the match score back automatically.
- Uses JSON-mode responses plus a primary → fallback model retry on rate limits.

### 🎤 AI Mock Interview Coach
- Generate **five role-specific technical and behavioral questions** tailored to a company/role.
- Answer interactively and receive **instant AI scoring and feedback**.
- Save practice sessions to your account and resume them later.

### 🔐 Authentication & Dashboard
- Email/password auth via **Supabase Auth**.
- Protected routes enforced through Next.js middleware.
- Optimistic UI updates for application CRUD.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org/) (App Router, Server Components, Route Handlers) |
| UI | [React 19](https://react.dev/), [Tailwind CSS 3](https://tailwindcss.com/), [Lucide React](https://lucide.dev/) icons |
| Language | [TypeScript 5](https://www.typescriptlang.org/) (strict mode) |
| Auth & Database | [Supabase](https://supabase.com/) (Postgres + Auth) via `@supabase/ssr` |
| AI | [Google Gemini](https://ai.google.dev/) via `@google/genai` |
| PDF Parsing | [`pdf-parse`](https://www.npmjs.com/package/pdf-parse) (`pdfjs-dist`) |
| Testing | [Vitest](https://vitest.dev/), Testing Library, jsdom |
| Quality | ESLint, `tsc --noEmit`, GitHub Actions CI |

---

## Getting Started

### Prerequisites
- **Node.js 20+** and npm
- A **Supabase** project (URL + publishable key)
- A **Google Gemini API key** ([get one here](https://ai.google.dev/))

### Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/applywise.git
cd applywise

# 2. Install dependencies
npm install

# 3. Create your local environment file from the template
cp .env.example .env.local      # macOS/Linux
copy .env.example .env.local    # Windows

# 4. Fill in the real values in .env.local (see the table below)

# 5. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## Environment Variables

Create a `.env.local` file in the project root (copy from `.env.example`). All variables are required.

| Variable | Description | Required | Example |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL. Public — exposed to the browser. | ✅ Yes | `https://your-project-ref.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable (browser-safe) key. | ✅ Yes | `sb_publishable_...` |
| `GEMINI_API_KEY` | Google Gemini API key. **Server-side only** — used by the resume analyzer and mock interview API routes. | ✅ Yes | `your-gemini-api-key` |

> ⚠️ The `NEXT_PUBLIC_` prefix means a value is bundled into client code — only use it for genuinely public keys. **Never** prefix `GEMINI_API_KEY` with `NEXT_PUBLIC_`.

---

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server with hot reload. |
| `npm run build` | Create an optimized production build. |
| `npm run start` | Serve the production build. |
| `npm run lint` | Run ESLint. |
| `npm run typecheck` | Type-check the project with `tsc --noEmit`. |
| `npm test` | Run the full Vitest suite once. |
| `npm run test:watch` | Run tests in watch mode. |

---

## Database Setup

The application expects the following Postgres tables in Supabase: `applications`, `interviews`, and `interview_sessions`, each protected with row-level security scoped to `auth.uid()`.

To initialize the schema:

1. Open your Supabase project → **SQL Editor**.
2. Paste the contents of [`supabase/schema.sql`](./supabase/schema.sql) and click **Run**.

Then enable **Email** auth under Supabase → **Authentication → Providers** so users can sign up and log in.

---

## Deployment

### Vercel (recommended)

1. Push the repository to **GitHub** (`main` branch).
2. In **Vercel**, click **Add New → Project** and import the repository.
3. Vercel auto-detects Next.js — no build overrides needed.
4. Add the three environment variables under **Project Settings → Environment Variables** (Production, Preview, and Development):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `GEMINI_API_KEY`
5. Deploy. `@google/genai`, `pdf-parse`, and `pdfjs-dist` are handled via `serverExternalPackages` in `next.config.ts`, so no special runtime config is required.

> The CI workflow in [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) runs `typecheck`, `test`, and `build` with placeholder env values on every push/PR to `main`.

---

## Project Structure

```
applywise/
├─ app/                    # Next.js App Router pages & API route handlers
│  ├─ api/                 #   /api/analyze-resume, /api/interview-sessions
│  ├─ applications/        #   Tracker (Table + Board views)
│  ├─ resume-analyzer/     #   PDF Resume ATS Analyzer
│  ├─ interview-prep/      #   AI Mock Interview Studio
│  ├─ login/               #   Auth page
│  └─ page.tsx             #   Dashboard
├─ components/             # UI components (applications, analyzer, interview, dashboard, layout)
├─ context/                # ApplicationsContext (Supabase CRUD + auth state)
├─ lib/
│  ├─ ai/                  # Gemini helpers + resume analysis
│  ├─ supabase/            # Browser/server clients + query mappers
│  └─ mock-data.ts         # Shared types & constants
├─ supabase/schema.sql     # Database schema + RLS policies
├─ __tests__/              # Vitest unit & component tests
├─ middleware.ts           # Route protection
└─ next.config.ts          # Next.js configuration
```

---

## Security Notes

- **`.env.local` is git-ignored.** The `.gitignore` uses `.env*` with an `!.env.example` exception, so real credentials are never committed — only the safe `.env.example` template is tracked.
- **`GEMINI_API_KEY` is server-only.** It is consumed exclusively inside `/api` route handlers and is never exposed to the client bundle.
- All user data is isolated in Supabase with **row-level security** policies keyed to the authenticated user.

---

Made with Next.js, Supabase, and Google Gemini.