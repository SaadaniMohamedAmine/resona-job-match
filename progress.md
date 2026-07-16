# Progress

## Phase 1 — Fondations & Design System ✅

### Branche : `feat-integration-phase-1`

### Commits
1. **feat: install phase 1 dependencies** — Prisma, NextAuth, UploadThing, next-intl, Sentry, zod, clsx, tailwind-merge, bcryptjs, @tabler/icons-react, prettier
2. **feat: add prisma schema and lib/db** — Schéma complet (User, Account, Session, Resume, JobPost, Analysis, Application, Subscription + enums Plan, ApplicationStatus)
3. **feat: setup nextauth v5** — Providers: credentials (email/password) + Google OAuth, JWT session, Prisma adapter
4. **feat: setup uploadthing file router** — Route handler PDF (4MB max)
5. **feat: setup i18n next-intl** — EN/FR messages, locale-prefixed routing, NextIntlClientProvider, middleware
6. **feat: setup sentry client/server/edge configs** — tracesSampleRate 0.2
7. **feat: configure tailwind v4 design tokens** — Couleurs (#16140F / #F7F5F2 / #C9A961 / #B8AD98 / #2A2620), polices (Space Grotesk / IBM Plex Sans), radius (16px / 8px), lib/utils.ts (cn helper)
8. **feat: build design system components** — Wordmark, ScoreRing, SkillTag, Stepper, LoaderRing, Skeleton, Icon
9. **feat: add manifest, og image, and metadata** — PWA manifest, OG image dynamique, generateMetadata SEO

### Décisions
- **OpenAI remplacé par Groq + HuggingFace** (coût, gratuité) — modèles : `mixtral-8x7b-32768` pour analyse/rewrite/cover, `sentence-transformers/all-MiniLM-L6-v2` pour embeddings
- **Dimension vecteur : 384** (all-MiniLM-L6-v2) au lieu de 1536 (OpenAI)
- **LinkedIn OAuth reporté** (nécessite une page LinkedIn company) — le bouton LinkedIn affichera "Bientôt dispo" en Phase 3
- **Pas de LinkedIn provider dans NextAuth** pour éviter les erreurs
- **Librairie UI** : Tabler icons (stroke 1.5), pas d'icônes filled
- **Dark mode par défaut**, design system dark graphité/champagne

### Services configurés (.env.local)
- ✅ Neon PostgreSQL (US East)
- ✅ NextAuth (Google OAuth)
- ✅ Groq
- ✅ HuggingFace
- ✅ UploadThing
- ✅ Sentry
- ⏳ LinkedIn (reporté)

## Phase 2 — Backend & IA ✅

### Branche : `feat-integration-phase-2`

### Endpoints API implémentés
- `POST /api/analyze` — Analyse CV + embeddings + score match
- `POST /api/rewrite` — Réécriture de section
- `POST /api/cover-letter` — Génération lettre de motivation
- `GET /api/resumes` + `DELETE /api/resumes/[id]` — CRUD analyses
- `GET /api/applications` + `POST` + `PATCH /[id]` + `DELETE /[id]` — CRUD candidatures

### Librairies ajoutées
- `pdf-parse` v2 — extraction texte PDF
- `@upstash/ratelimit` + `@upstash/redis` — rate limiting

### Fichiers créés
- `lib/pdf.ts` — extraction PDF
- `lib/rate-limit.ts` — rate limiter Upstash (5/jour free, 30/min global)
- `lib/api-handler.ts` — wrapper d'erreurs Sentry

### Fixes
- Client Groq lazy (évite crash build sans env var)
- Params Promise Next.js 16 (layout, routes avec params)
- Prisma 6 downgrade (v7 incompatible), Zod 3 downgrade

### Infra configurée
- Upstash Redis (rate limiting)
- Toutes les env vars ajoutées sur Vercel (non-sensitive + sensitive)

### À faire
- [ ] Push initial sur Neon (créer l'extension vector + prisma db push)
- [ ] Phase 3 : Frontend & Parcours (toutes les pages)
- [ ] Phase 4 : Billing Stripe
- [ ] Phase 5 : Tests & Qualité
- [ ] Phase 6 : Déploiement + seed
- [ ] Phase 7 : Présentation portfolio
