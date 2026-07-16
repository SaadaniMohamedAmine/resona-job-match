# Résona — Phase 7 : Présentation Portfolio

> Document de délégation. Spec, tasks, contenu complet (README, script vidéo). Dépend des Phases 1-6 (le produit doit être déployé pour que les captures/démo soient réelles, pas des mockups).

---

## 1. Spec

**Objectif :** la couche qui fait que Résona convertit un recruteur qui ne va pas cloner le repo. README structuré, diagramme d'architecture, démo vidéo/GIF, captures d'écran réelles.

**Dépendances :** Phase 6 complète (produit déployé, compte démo `demo@resona.dev` fonctionnel).

---

## 2. Tasks

- [ ] Rédiger `README.md` (contenu ci-dessous, à coller tel quel puis ajuster l'URL réelle)
- [ ] Générer le diagramme d'architecture (Mermaid, intégré au README)
- [ ] Produire le script de démo vidéo (à coller dans ai.invideo.io)
- [ ] Enregistrer la vidéo/GIF avec les captures réelles de l'app déployée
- [ ] Prendre les captures d'écran listées ci-dessous et les intégrer au README

---

## 3. Contenu complet

### 3.1 README.md

```markdown
# Résona

Your resume, aligned to every opportunity.

Résona is an AI-powered resume and job-match platform: upload your resume, paste a job description, and get a semantic match score, a gap analysis, AI-rewritten resume sections, and a ready-to-send cover letter — plus a kanban tracker for every application you send.

**Live demo:** [your-domain.com](https://your-domain.com) — login `demo@resona.dev` / `demo-password-2026`

## Why this exists

75% of resumes are rejected by ATS software before a human ever reads them. Most resume tools optimize for keyword stuffing. Résona instead uses semantic embeddings to understand *meaning*, not just matching words — the same resume phrased differently can score very differently depending on how well it actually maps to the role.

## Features

- **Semantic match scoring** — OpenAI embeddings (`text-embedding-3-small`) + pgvector cosine similarity, not keyword counting
- **Gap detection** — GPT-4o identifies exactly which skills from the job description are missing
- **AI section rewriting** — before/after comparison, factually grounded in your original content
- **Cover letter generation** — tailored to the specific role and company
- **Application tracker** — kanban board (Applied → Interview → Offer → Rejected)
- **Stripe billing** — Free / Pro plans with usage-based quotas
- **i18n** — English and French
- **Full test suite** — unit, integration, and e2e coverage with CI

## Architecture

\`\`\`mermaid
flowchart LR
  User -->|uploads PDF| UploadThing
  User -->|pastes JD| Frontend[Next.js App Router]
  Frontend --> API[API Routes]
  API --> PdfParse[pdf-parse: text extraction]
  API --> OpenAI[OpenAI: GPT-4o + embeddings]
  API --> Postgres[(Neon PostgreSQL + pgvector)]
  API --> Stripe[Stripe: billing]
  API --> Upstash[(Upstash Redis: rate limiting)]
  Frontend --> Auth[NextAuth: Google / LinkedIn / credentials]
  API --> Sentry[Sentry: error monitoring]
\`\`\`

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router), TypeScript |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL (Neon) + pgvector |
| ORM | Prisma |
| Auth | NextAuth / Auth.js (email/password + Google + LinkedIn) |
| AI | OpenAI GPT-4o + text-embedding-3-small |
| File storage | UploadThing |
| Payments | Stripe |
| Rate limiting | Upstash Redis |
| i18n | next-intl |
| Monitoring | Sentry |
| Testing | Vitest, Playwright |
| CI/CD | GitHub Actions, Vercel |

## Key decisions

- **Semantic matching over keyword matching** — the differentiator vs. most ATS-optimization tools, at the cost of higher OpenAI API usage per analysis.
- **No color-coded status system** — matching/missing skills are distinguished by icon + label only, never green/red, to keep the visual language restrained and premium rather than "dashboard-y."
- **NextAuth over a managed auth provider** — full control over the auth flow, no vendor lock-in, at the cost of more upfront implementation.
- **Upstash Redis for rate limiting, not in-memory** — required for correctness on Vercel's stateless serverless functions.

## Running locally

\`\`\`bash
git clone https://github.com/your-username/resona.git
cd resona
npm install
cp .env.example .env # fill in your own keys
npx prisma db push
npm run db:seed
npm run dev
\`\`\`

## Screenshots

![Landing page](./docs/screenshots/landing.png)
![Results overview with ScoreRing](./docs/screenshots/results-overview.png)
![Section rewrite, before/after](./docs/screenshots/rewrite.png)
![Application tracker](./docs/screenshots/tracker.png)

---

Built by Mohamed Amine Saadani — [portfolio](#) · [LinkedIn](#)
```

### 3.2 Diagramme d'architecture

Déjà inclus dans le README ci-dessus (bloc Mermaid) — se rend nativement sur GitHub. Pas de fichier séparé nécessaire.

### 3.3 Script de démo vidéo (à coller dans ai.invideo.io)

> Même format que PulseAI (`PulseAI-InVideo-Script.md`), adapté au ton Résona : calme, premium, retenue — pas d'énergie "startup tech agressive". Musique posée plutôt qu'"upbeat corporate".

```
Create a 60-second product demo video for "Résona", a premium AI-powered resume and job-match analysis platform. Tone: calm, premium, confident — like an Apple product video, not a hyped tech startup ad. Style: dark graphite background (#16140F), champagne gold accents (#C9A961), generous negative space, minimal text overlays, restrained elegant music (no aggressive build-ups).

SCRIPT:

[Scene 1 - Hook, 0-6s]
Visual: Dark graphite background, the Résona wordmark fades in slowly, centered, generous whitespace.
Voiceover: "Your resume, aligned to every opportunity."

[Scene 2 - Problem, 6-14s]
Visual: A resume document fading to gray, a subtle "rejected" icon appearing quietly — no alarming red, just muted tones.
Voiceover: "Most resumes are rejected before a human ever reads them. Résona changes that."

[Scene 3 - Solution intro, 22-30s]
Visual: Upload screen, a PDF dropping into the dropzone, then the ScoreRing animating from 0 to 87%, champagne gold arc filling in smoothly.
Voiceover: "Upload your resume. Paste the role. Résona reads both — not just the keywords, the meaning."

[Scene 4 - Feature: Gap detection, 30-38s]
Visual: Matching skills and missing skills tags appearing one by one, thin check and alert icons, no color coding.
Voiceover: "See exactly what matches — and exactly what's missing — before a recruiter does."

[Scene 5 - Feature: Rewrite, 38-46s]
Visual: Side-by-side before/after resume section, the rewritten column highlighting subtly in champagne gold.
Voiceover: "Résona rewrites your resume, section by section — grounded in what you've actually done."

[Scene 6 - Feature: Cover letter + tracker, 46-54s]
Visual: Cover letter modal appearing, then cut to the kanban tracker with cards moving from Applied to Interview.
Voiceover: "A tailored cover letter in one click. Every application, tracked in one place."

[Scene 7 - CTA, 54-60s]
Visual: Résona landing page, URL text appears, calm and centered: your-domain.com
Voiceover: "Résona. Your resume, aligned to every opportunity."
Text overlay: "Built solo, end-to-end — Next.js, PostgreSQL, OpenAI"

MUSIC: minimal, elegant, restrained piano or ambient — no upbeat corporate build-up.
PACING: slow, deliberate cuts, each scene allowed to breathe (no fast-cut energy).
END CARD: Résona wordmark + URL + "Built by Mohamed Amine Saadani".
```

Variante courte LinkedIn (30s) :

```
Create a calm, premium 30-second teaser for "Résona", an AI resume and job-match platform. Dark graphite background, champagne gold accents, restrained elegant music, minimal captions.

[0-5s] Hook: "Your resume, aligned to every opportunity." — wordmark fades in on dark graphite.
[5-12s] "Résona reads your resume and the job description semantically — not just keywords." — ScoreRing animating to 87%.
[12-20s] "Rewrites your resume section by section, and drafts your cover letter." — before/after rewrite visual.
[20-26s] "Every application, tracked in one calm view." — kanban tracker.
[26-30s] "Résona." — wordmark + URL end card.

Music: minimal, elegant, restrained. Slow deliberate cuts. End card with URL and "Built by Mohamed Amine Saadani".
```

### 3.4 Notes pratiques

- Captures à prendre sur le compte démo déployé (Phase 6), pas sur localhost — pour que les données (score 87%, kanban rempli) soient cohérentes avec le script.
- Dossier `docs/screenshots/` à créer dans le repo avec : `landing.png`, `results-overview.png`, `rewrite.png`, `tracker.png` — mêmes noms que référencés dans le README ci-dessus.
- Garder la mention "Built by Mohamed Amine Saadani" sur l'end card, cohérent avec le traitement PulseAI, pour la crédibilité solo-builder sur LinkedIn.

---

**Definition of Done — Phase 7 :** `README.md` en place à la racine du repo avec le diagramme Mermaid qui se rend correctement sur GitHub, 4 captures d'écran réelles présentes dans `docs/screenshots/`, vidéo de démo produite et prête à être postée sur LinkedIn/portfolio.
