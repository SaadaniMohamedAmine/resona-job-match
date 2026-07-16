# Résona — Phase 1 : Fondations & Design System

> Document de délégation. Contient la spec, la checklist de tâches, et le code complet à implémenter tel quel. Aucun aller-retour attendu : toutes les décisions (stack, versions, structure) sont déjà tranchées ci-dessous.

---

## 1. Spec

**Objectif de la phase :** poser l'infrastructure du projet (scaffold, base de données, auth, upload, i18n, monitoring) et construire tous les composants réutilisables du design system, avant toute page métier. À la fin de cette phase, l'app doit démarrer (`npm run dev`), se connecter à la base, et afficher un design system Storybook-like (ou une page `/design-system` de test) montrant chaque composant.

**Dépendances :** aucune (première phase).

**Ne pas faire dans cette phase :** pages métier (Phase 3), endpoints IA (Phase 2), Stripe (Phase 4).

**Stack figée (dernières versions stables au moment de l'implémentation — vérifier `npm view <package> version` avant `npm install` pour confirmer la version exacte) :**
- Next.js (App Router, dernière version stable) + TypeScript strict
- Tailwind CSS v4 (config CSS-first via `@theme`, pas de `tailwind.config.ts`)
- Prisma + PostgreSQL (Neon) + extension `pgvector`
- NextAuth / Auth.js v5 (`next-auth`)
- UploadThing
- next-intl (i18n FR/EN)
- @sentry/nextjs

**Identité visuelle à respecter (rappel — voir aussi le prompt Stitch livré séparément) :**
- Couleurs : base `#16140F` (dark), compagnon clair `#F7F5F2`, accent `#C9A961`, texte secondaire sur dark `#B8AD98`
- Polices : Space Grotesk (titres, 500/700), IBM Plex Sans (texte, 400/500)
- Pas de couleurs de statut (vert/rouge) — icônes trait fin uniquement
- Densité généreuse, surfaces plates, aucun glow/gradient décoratif

---

## 2. Tasks

- [ ] Initialiser le repo Next.js + TypeScript + Tailwind v4
- [ ] Configurer ESLint/Prettier
- [ ] Setup Prisma + connexion Neon PostgreSQL
- [ ] Activer l'extension `pgvector` sur Neon
- [ ] Écrire le schéma Prisma complet (User, Account, Session, Resume, JobPost, Analysis, Application)
- [ ] `prisma db push`
- [ ] Configurer NextAuth v5 (email/password + OAuth Google + LinkedIn)
- [ ] Configurer UploadThing
- [ ] Configurer les variables d'environnement (`.env.example`)
- [ ] Structurer les dossiers (`app/`, `components/`, `lib/`, `types/`)
- [ ] Initialiser Git + premier commit
- [ ] Créer `PROGRESS.md` + `DECISIONS.md`
- [ ] Installer les polices Space Grotesk + IBM Plex Sans (`next/font/google`)
- [ ] Définir les tokens de thème Tailwind v4 (couleurs, radius, spacing)
- [ ] Implémenter le thème dark/light (dark par défaut) avec persistance
- [ ] Construire le composant `Wordmark`
- [ ] Construire le composant `ScoreRing`
- [ ] Construire le composant `SkillTag` (matching / gap, icône seule différencie)
- [ ] Construire le composant `Stepper`
- [ ] Construire le composant `LoaderRing` (loader global + variante analyse)
- [ ] Construire le composant `Skeleton`
- [ ] Intégrer les icônes (Tabler outline, 1.5px)
- [ ] Produire la spec exacte favicon/app icons (monogramme R)
- [ ] Produire la spec exacte de l'image OG
- [ ] Setup i18n (next-intl, structure FR/EN, `messages/en.json` + `messages/fr.json`)
- [ ] Setup Sentry (config de base client + serveur)

---

## 3. Code complet

### 3.1 Scaffold & configuration

```bash
npx create-next-app@latest resona --typescript --tailwind --app --src-dir=false --import-alias "@/*"
cd resona
npm install prisma @prisma/client next-auth@beta @auth/prisma-adapter uploadthing @uploadthing/react next-intl @sentry/nextjs zod clsx tailwind-merge
npm install -D prettier eslint-config-prettier
```

`.env.example`

```bash
# Database
DATABASE_URL="postgresql://user:password@ep-xxxx.neon.tech/resona?sslmode=require"

# NextAuth
AUTH_SECRET="generate-with-openssl-rand-base64-32"
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""
AUTH_LINKEDIN_ID=""
AUTH_LINKEDIN_SECRET=""

# OpenAI
OPENAI_API_KEY=""

# UploadThing
UPLOADTHING_TOKEN=""

# Sentry
NEXT_PUBLIC_SENTRY_DSN=""
SENTRY_AUTH_TOKEN=""

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

`.prettierrc`

```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

Structure de dossiers cible :

```
app/
  [locale]/
    (marketing)/
      page.tsx                 # landing
      privacy/page.tsx
      terms/page.tsx
    (auth)/
      sign-up/page.tsx
      login/page.tsx
    (app)/
      upload/page.tsx
      analyzing/page.tsx
      results/[analysisId]/page.tsx
      resumes/page.tsx
      tracker/page.tsx
      dashboard/page.tsx
      settings/
        account/page.tsx
        billing/page.tsx
    layout.tsx
  api/
    analyze/route.ts
    rewrite/route.ts
    cover-letter/route.ts
    resumes/route.ts
    applications/route.ts
    uploadthing/
      core.ts
      route.ts
    stripe/
      checkout/route.ts
      webhook/route.ts
    auth/[...nextauth]/route.ts
components/
  ui/
    wordmark.tsx
    score-ring.tsx
    skill-tag.tsx
    stepper.tsx
    loader-ring.tsx
    skeleton.tsx
    icon.tsx
  forms/
    dropzone.tsx
lib/
  auth.ts
  db.ts
  uploadthing.ts
  ai/
    analyze.ts
    embeddings.ts
  utils.ts
prisma/
  schema.prisma
messages/
  en.json
  fr.json
i18n.ts
middleware.ts
sentry.client.config.ts
sentry.server.config.ts
sentry.edge.config.ts
```

### 3.2 Base de données — Prisma schema

`prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// --- Auth (NextAuth v5 / Prisma adapter shape) ---

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String? // hashed, null if OAuth-only
  plan          Plan      @default(FREE)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts     Account[]
  sessions     Session[]
  resumes      Resume[]
  analyses     Analysis[]
  applications Application[]
  subscription Subscription?
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

enum Plan {
  FREE
  PRO
}

// --- Product domain ---

model Resume {
  id          String   @id @default(cuid())
  userId      String
  fileUrl     String
  fileName    String
  extractedText String @db.Text
  createdAt   DateTime @default(now())

  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  analyses  Analysis[]

  // pgvector column — managed via raw SQL migration, not by Prisma Client directly
  embedding Unsupported("vector(1536)")?
}

model JobPost {
  id          String   @id @default(cuid())
  title       String
  company     String?
  description String   @db.Text
  createdAt   DateTime @default(now())

  analyses Analysis[]

  embedding Unsupported("vector(1536)")?
}

model Analysis {
  id             String   @id @default(cuid())
  userId         String
  resumeId       String
  jobPostId      String
  matchScore     Int // 0-100
  matchingSkills String[] // simple string list, MVP
  missingSkills  String[]
  suggestions    Json // structured suggestions from GPT-4o
  coverLetter    String? @db.Text
  createdAt      DateTime @default(now())

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  resume  Resume  @relation(fields: [resumeId], references: [id], onDelete: Cascade)
  jobPost JobPost @relation(fields: [jobPostId], references: [id], onDelete: Cascade)

  application Application?
}

enum ApplicationStatus {
  APPLIED
  INTERVIEW
  OFFER
  REJECTED
}

model Application {
  id          String             @id @default(cuid())
  userId      String
  analysisId  String?            @unique
  company     String
  role        String
  status      ApplicationStatus  @default(APPLIED)
  appliedAt   DateTime           @default(now())
  updatedAt   DateTime           @updatedAt

  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  analysis Analysis? @relation(fields: [analysisId], references: [id], onDelete: SetNull)
}

// --- Billing (used by Phase 4, modeled here so Phase 1 schema is final) ---

model Subscription {
  id                   String   @id @default(cuid())
  userId               String   @unique
  stripeCustomerId     String   @unique
  stripeSubscriptionId String?  @unique
  stripePriceId        String?
  status               String // active | canceled | past_due | trialing
  currentPeriodEnd     DateTime?
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

Migration SQL manuelle à exécuter une fois avant/après le premier `prisma db push` (Prisma ne peut pas créer l'extension lui-même) :

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

Requête de similarité cosinus (utilisée en Phase 2, définie ici pour référence) :

```sql
SELECT id, 1 - (embedding <=> $1::vector) AS similarity
FROM "Resume"
ORDER BY embedding <=> $1::vector
LIMIT 1;
```

`lib/db.ts`

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```

### 3.3 Auth — NextAuth v5

`lib/auth.ts`

```ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import LinkedIn from "next-auth/providers/linkedin";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    LinkedIn({
      clientId: process.env.AUTH_LINKEDIN_ID,
      clientSecret: process.env.AUTH_LINKEDIN_SECRET,
    }),
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (raw) => {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const user = await db.user.findUnique({
          where: { email: parsed.data.email },
        });
        if (!user?.password) return null;

        const valid = await bcrypt.compare(parsed.data.password, user.password);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    session: async ({ session, token }) => {
      if (session.user && token.sub) session.user.id = token.sub;
      return session;
    },
  },
});
```

`app/api/auth/[...nextauth]/route.ts`

```ts
export { GET, POST } from "@/lib/auth";
```

### 3.4 Upload — UploadThing

`lib/uploadthing.ts`

```ts
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/lib/auth";

const f = createUploadthing();

export const ourFileRouter = {
  resumeUploader: f({ pdf: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const session = await auth();
      if (!session?.user) throw new Error("Unauthorized");
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { userId: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
```

`app/api/uploadthing/core.ts`

```ts
export { ourFileRouter } from "@/lib/uploadthing";
```

`app/api/uploadthing/route.ts`

```ts
import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

export const { GET, POST } = createRouteHandler({ router: ourFileRouter });
```

### 3.5 i18n — next-intl

`i18n.ts`

```ts
import { getRequestConfig } from "next-intl/server";

export const locales = ["en", "fr"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`./messages/${locale}.json`)).default,
}));
```

`middleware.ts`

```ts
import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n";

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "as-needed",
});

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
```

`messages/en.json`

```json
{
  "landing": {
    "tagline": "Your resume, aligned to every opportunity.",
    "cta_primary": "Analyze your resume",
    "cta_secondary": "See how it works"
  },
  "upload": {
    "dropzone_label": "Drop your resume here or click to browse",
    "jd_label": "Paste the job description",
    "cta": "Analyze"
  },
  "results": {
    "matching_skills": "Matching skills",
    "missing_skills": "Missing skills",
    "rewrite_cta": "Rewrite my resume",
    "cover_letter_cta": "Generate cover letter"
  },
  "empty": {
    "resumes": "Nothing analyzed yet",
    "resumes_body": "Upload your first resume to get your match score.",
    "applications": "Nothing tracked yet",
    "applications_body": "Add your first application to start tracking."
  }
}
```

`messages/fr.json`

```json
{
  "landing": {
    "tagline": "Votre CV, aligné à chaque opportunité.",
    "cta_primary": "Analyser mon CV",
    "cta_secondary": "Voir comment ça marche"
  },
  "upload": {
    "dropzone_label": "Déposez votre CV ici ou cliquez pour parcourir",
    "jd_label": "Collez l'offre d'emploi",
    "cta": "Analyser"
  },
  "results": {
    "matching_skills": "Compétences correspondantes",
    "missing_skills": "Compétences manquantes",
    "rewrite_cta": "Réécrire mon CV",
    "cover_letter_cta": "Générer une lettre de motivation"
  },
  "empty": {
    "resumes": "Rien d'analysé pour le moment",
    "resumes_body": "Uploadez votre premier CV pour obtenir votre score.",
    "applications": "Rien de suivi pour le moment",
    "applications_body": "Ajoutez votre première candidature pour commencer le suivi."
  }
}
```

### 3.6 Monitoring — Sentry

`sentry.client.config.ts`

```ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.2,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,
});
```

`sentry.server.config.ts` / `sentry.edge.config.ts`

```ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.2,
});
```

### 3.7 Design tokens — Tailwind v4

`app/globals.css`

```css
@import "tailwindcss";

@theme {
  /* Résona brand tokens */
  --color-base: #16140f;
  --color-base-light: #f7f5f2;
  --color-accent: #c9a961;
  --color-muted: #b8ad98;
  --color-track: #2a2620;

  --font-display: "Space Grotesk", sans-serif;
  --font-body: "IBM Plex Sans", sans-serif;

  --radius-card: 16px;
  --radius-control: 8px;
}

:root {
  color-scheme: dark;
}

body {
  background-color: var(--color-base);
  color: var(--color-base-light);
  font-family: var(--font-body);
}

[data-theme="light"] body {
  background-color: var(--color-base-light);
  color: var(--color-base);
}
```

`app/[locale]/layout.tsx` (fonts + providers)

```tsx
import { Space_Grotesk, IBM_Plex_Sans } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import "../globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-display",
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-body",
});

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();
  return (
    <html lang={locale} data-theme="dark">
      <body className={`${spaceGrotesk.variable} ${ibmPlexSans.variable}`}>
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
```

### 3.8 Composants du design system

`components/ui/wordmark.tsx`

```tsx
export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={`font-[family-name:var(--font-display)] font-bold text-xl tracking-tight text-[var(--color-accent)] ${className ?? ""}`}
    >
      Résona
    </span>
  );
}
```

`components/ui/score-ring.tsx`

```tsx
export function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={`Match score: ${score}%`}>
      <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--color-track)" strokeWidth="10" />
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 50 50)"
        style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
      />
      <text
        x="50"
        y="55"
        textAnchor="middle"
        fontSize="18"
        fontWeight="500"
        fill="var(--color-accent)"
        className="font-[family-name:var(--font-display)]"
      >
        {score}%
      </text>
    </svg>
  );
}
```

`components/ui/skill-tag.tsx`

```tsx
import { IconCheck, IconAlertCircle } from "@tabler/icons-react";

export function SkillTag({ label, variant }: { label: string; variant: "match" | "gap" }) {
  const Icon = variant === "match" ? IconCheck : IconAlertCircle;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-track)] px-3 py-1 text-sm text-[var(--color-base-light)]">
      <Icon size={14} stroke={1.5} className="text-[var(--color-accent)]" />
      {label}
    </span>
  );
}
```

`components/ui/stepper.tsx`

```tsx
export function Stepper({ steps, currentStep }: { steps: string[]; currentStep: number }) {
  return (
    <ol className="flex items-center gap-4">
      {steps.map((step, i) => (
        <li key={step} className="flex items-center gap-2">
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
              i <= currentStep ? "bg-[var(--color-accent)] text-[var(--color-base)]" : "border border-[var(--color-track)] text-[var(--color-muted)]"
            }`}
          >
            {i + 1}
          </span>
          <span className={i === currentStep ? "text-[var(--color-base-light)]" : "text-[var(--color-muted)]"}>
            {step}
          </span>
        </li>
      ))}
    </ol>
  );
}
```

`components/ui/loader-ring.tsx`

```tsx
export function LoaderRing({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 50 50" className="animate-spin" role="status" aria-label="Loading">
      <circle
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="90 40"
      />
    </svg>
  );
}
```

`components/ui/skeleton.tsx`

```tsx
export function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-[var(--radius-control)] bg-[var(--color-track)] ${className ?? ""}`} />;
}
```

`components/ui/icon.tsx`

```tsx
import type { Icon as TablerIconType } from "@tabler/icons-react";

export function Icon({ icon: IconComponent, size = 18 }: { icon: TablerIconType; size?: number }) {
  return <IconComponent size={size} stroke={1.5} aria-hidden="true" />;
}
```

Icônes : package `@tabler/icons-react`, trait fin forcé à `stroke={1.5}` partout, jamais d'icônes pleines (`-filled`).

### 3.9 Favicon & app icons — spec exacte

Pas de génération de binaire ici (Stitch/le code ne produisent pas de `.ico`). Source SVG du monogramme à rasteriser dans les tailles listées :

```svg
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="96" fill="#16140F"/>
  <text x="256" y="330" text-anchor="middle" font-family="Space Grotesk" font-weight="700" font-size="280" fill="#C9A961">R</text>
</svg>
```

Exporter en : `favicon.ico` (16x16, 32x32), `apple-touch-icon.png` (180x180), `icon-192.png`, `icon-512.png`, `icon-maskable.png` (avec 20% de padding de sécurité autour du R).

`app/manifest.ts`

```ts
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Résona",
    short_name: "Résona",
    description: "Your resume, aligned to every opportunity.",
    start_url: "/",
    background_color: "#16140F",
    theme_color: "#16140F",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
```

### 3.10 Image OG — spec exacte

`app/opengraph-image.tsx` (générée dynamiquement via `next/og`, pas besoin d'asset statique) :

```tsx
import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#16140F",
          color: "#C9A961",
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 700 }}>Résona</div>
        <div style={{ fontSize: 28, color: "#B8AD98", marginTop: 16 }}>
          Your resume, aligned to every opportunity.
        </div>
      </div>
    ),
    size
  );
}
```

---

**Definition of Done — Phase 1 :** `npm run dev` démarre sans erreur, la connexion Neon fonctionne, `prisma db push` passe, login Google/LinkedIn fonctionne en local, tous les composants ci-dessus rendent correctement sur une page de test, favicon et OG image visibles dans les meta tags.
