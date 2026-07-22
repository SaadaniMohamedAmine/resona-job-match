# Résona

Your resume, aligned to every opportunity.

Résona is an AI-powered resume and job-match platform: upload your resume, paste a job description, and get a semantic match score, a gap analysis, AI-rewritten resume sections, and a ready-to-send cover letter — plus a kanban tracker for every application you send.

**Live demo:** [resona-job-match.vercel.app](https://resona-job-match.vercel.app) — login `demo@resona.dev` / `demo-password-2026`

## Why this exists

75% of resumes are rejected by ATS software before a human ever reads them. Most resume tools optimize for keyword stuffing. Résona instead uses semantic embeddings to understand *meaning*, not just matching words — the same resume phrased differently can score very differently depending on how well it actually maps to the role.

## Features

- **Semantic match scoring** — HuggingFace embeddings (`all-MiniLM-L6-v2`) + pgvector cosine similarity, not keyword counting
- **Gap detection** — Groq (Llama 3.3 70B) identifies exactly which skills from the job description are missing
- **AI section rewriting** — before/after comparison, factually grounded in your original content
- **Cover letter generation** — tailored to the specific role and company
- **Application tracker** — kanban board (Applied → Interview → Offer → Rejected)
- **Live demo, no signup** — try a real analysis on sample profiles straight from the landing page
- **Semantic similarity, visualized** — the pgvector cosine score shown distinctly from the AI's language-based match score
- **Score progression** — a trend view of your match score across every analysis
- **Command palette (⌘K)** — instant navigation and actions, anywhere in the app
- **Built with** — a transparent, honest breakdown of the real stack and why each piece was chosen
- **Stripe billing** — Free / Pro plans with usage-based quotas
- **i18n** — English and French
- **Full test suite** — unit, integration, and e2e coverage with CI

## Architecture

```mermaid
flowchart LR
  User -->|uploads PDF| UploadThing
  User -->|pastes JD| Frontend[Next.js App Router]
  Frontend --> API[API Routes]
  API --> PdfParse[pdf-parse: text extraction]
  API --> Groq[Groq: Llama 3.3 70B analysis]
  API --> HF[HuggingFace: embeddings]
  API --> Postgres[(Neon PostgreSQL + pgvector)]
  API --> Stripe[Stripe: billing]
  API --> Upstash[(Upstash Redis: rate limiting)]
  Frontend --> Auth[NextAuth: Google / LinkedIn / credentials]
  API --> Sentry[Sentry: error monitoring]
```

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router), TypeScript |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL (Neon) + pgvector |
| ORM | Prisma |
| Auth | NextAuth / Auth.js (email/password + Google + LinkedIn) |
| AI | Groq (Llama 3.3 70B) + HuggingFace embeddings (all-MiniLM-L6-v2) |
| File storage | UploadThing |
| Payments | Stripe |
| Rate limiting | Upstash Redis |
| i18n | next-intl |
| Monitoring | Sentry |
| Testing | Vitest, Playwright |
| CI/CD | GitHub Actions, Vercel |

## Key decisions

- **Semantic matching over keyword matching** — the differentiator vs. most ATS-optimization tools, computed via a dedicated embeddings model (HuggingFace) kept separate from the generation model (Groq), at the cost of an extra network call per analysis.
- **No color-coded status system** — matching/missing skills are distinguished by icon + label only, never green/red, to keep the visual language restrained and premium rather than "dashboard-y."
- **NextAuth over a managed auth provider** — full control over the auth flow, no vendor lock-in, at the cost of more upfront implementation.
- **Upstash Redis for rate limiting, not in-memory** — required for correctness on Vercel's stateless serverless functions.

## Running locally

```bash
git clone https://github.com/SaadaniMohamedAmine/resona-job-match.git
cd resona-job-match
npm install
cp .env.example .env.local
npx prisma db push
npm run db:seed
npm run dev
```

## Screenshots

![Landing page](./docs/screenshots/landing.png)
![Results overview with ScoreRing](./docs/screenshots/results-overview.png)
![Section rewrite, before/after](./docs/screenshots/rewrite.png)
![Application tracker](./docs/screenshots/tracker.png)

## Try it live

- **Instant demo, no account** — `/demo` runs a real analysis on a sample profile in seconds.
- **Command palette** — press `⌘K` / `Ctrl+K` anywhere to jump around instantly.
- **Built with** — `/built-with` breaks down the real stack, not a marketing version of it.

---

Built by [Mohamed Amine Saadani](https://github.com/SaadaniMohamedAmine) — [LinkedIn](https://www.linkedin.com/in/mohamed-amine-saadani-306b58338/)
