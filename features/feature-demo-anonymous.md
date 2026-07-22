# Résona — Feature: Démo interactive sans compte

> Document de délégation. Spec, tasks, code complet. Vérifié contre le vrai code (tokens, icônes, architecture IA/embeddings/rate-limit) au 2026-07-21 — voir `feature-updates-status-corrections.md` pour le détail des écarts trouvés avec les docs précédents. Ce doc utilise le **vrai** système : tokens `--color-base/#16140f`, `--color-accent/#c9a961`, `--color-muted/#b8ad98`, `--color-track/#2a2620`, `--radius-card/16px`, `--radius-control/8px`, classes `text-base-light`/`text-muted`/`text-accent`/`border-track`/`bg-track`/`bg-accent`, icônes `@tabler/icons-react` — pas de tokens Material Design 3 ni de Material Symbols.

---

## 1. Spec

**Objectif** : convertir un visiteur froid (recruteur, prospect) en quelques secondes, sans friction de compte. C'est le levier le plus fort pour capter l'attention d'un recruteur qui survole le portfolio.

**Principe** : une page publique `/demo` propose 2-3 profils pré-construits (CV + JD déjà écrits), l'utilisateur clique un profil, l'analyse tourne pour de vrai (vrai appel Groq, vrais embeddings HuggingFace), le résultat s'affiche avec les mêmes composants visuels que la vraie page de résultats. Le score et les skills matching/missing sont visibles en entier ; le panneau Recommandations et les boutons Rewrite/Cover letter sont visuellement verrouillés derrière un CTA d'inscription — pas une restriction de sécurité, juste un hook de conversion.

**Contrainte technique clé** : aucune écriture en base pour un visiteur anonyme (le modèle `Resume` exige un `userId`). L'analyse tourne donc entièrement en mémoire : pas de `db.resume.create`, pas de `db.jobPost.create`, pas de `db.analysis.create`. La similarité cosinus est calculée en JS pur sur les deux vecteurs d'embedding, sans passer par pgvector.

**Rate limiting** : par IP, via Upstash (même pattern que `lib/rate-limit.ts` existant), 5 démos / heure / IP — généreux pour un vrai usage, assez strict pour éviter l'abus des quotas Groq/HuggingFace.

## 2. Tasks

- [ ] Ajouter `checkDemoLimit` (rate limit par IP) à `lib/rate-limit.ts`
- [ ] Ajouter `cosineSimilarityVectors` (calcul JS pur, sans DB) à `lib/ai/embeddings.ts`
- [ ] Créer `lib/ai/demo-samples.ts` avec 2 profils CV/JD pré-écrits
- [ ] Créer `app/api/demo-analyze/route.ts`
- [ ] Créer `app/[locale]/(marketing)/demo/page.tsx`
- [ ] Ajouter un lien "Try live demo — no signup" sur la landing page (hero)
- [ ] Ajouter le lien `/demo` au `PublicFooter`

## 3. Code complet

### 3.1 Rate limit anonyme par IP

Ajout à `lib/rate-limit.ts` (le fichier existant garde tout son contenu — ceci s'ajoute à la fin) :

```ts
const demoLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 h"),
  prefix: "resona:demo",
});

export async function checkDemoLimit(ip: string) {
  return demoLimiter.limit(ip);
}
```

### 3.2 Similarité cosinus en mémoire (sans DB)

Ajout à `lib/ai/embeddings.ts` (le fichier existant garde `generateEmbedding`, `saveResumeEmbedding`, `saveJobPostEmbedding`, `cosineSimilarity` tels quels — ceci s'ajoute) :

```ts
export function cosineSimilarityVectors(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
```

### 3.3 Profils de démo

`lib/ai/demo-samples.ts`

```ts
export const DEMO_SAMPLES = [
  {
    id: "frontend-strong",
    label: "Senior Frontend Engineer",
    matchHint: "Strong match",
    resumeText: `Sarah Chen — Senior Frontend Engineer
6 years building production React/TypeScript applications. Led migration of a 40k-LOC Angular app to Next.js, cutting load time by 45%. Deep expertise in component architecture, design systems, and Tailwind CSS. Shipped accessibility-first UI used by 2M+ monthly users. Mentored 3 junior engineers. Comfortable with CI/CD, Vitest, Playwright.`,
    jobTitle: "Senior Frontend Engineer",
    company: "Northwind Labs",
    jobDescription: `We're looking for a Senior Frontend Engineer with strong React and TypeScript experience to lead our design system and component architecture. You'll work closely with product and design to ship accessible, performant interfaces. Requirements: 5+ years React, TypeScript, Tailwind CSS or similar, experience with automated testing (Vitest/Jest, Playwright/Cypress), CI/CD familiarity, mentorship experience a plus.`,
  },
  {
    id: "fullstack-partial",
    label: "Fullstack Developer",
    matchHint: "Partial match",
    resumeText: `Amina Kader — Fullstack Developer
4 years experience across Node.js/Express backends and React frontends. Built and maintained REST APIs, basic PostgreSQL schemas, deployed on Heroku. Some exposure to Docker. Comfortable with Git workflows and agile ceremonies. Currently learning TypeScript and Next.js.`,
    jobTitle: "Fullstack Engineer",
    company: "Ridgeline Systems",
    jobDescription: `Fullstack Engineer to join our platform team. You'll work across a Next.js/TypeScript frontend and a Node.js/PostgreSQL backend, with infrastructure on AWS via Terraform. Requirements: solid Node.js and React, TypeScript proficiency, experience with PostgreSQL, familiarity with Docker and cloud infrastructure (AWS or GCP), comfort working in a fast-moving startup environment.`,
  },
] as const;

export type DemoSampleId = (typeof DEMO_SAMPLES)[number]["id"];
```

### 3.4 API route — sans auth, sans écriture DB

`app/api/demo-analyze/route.ts`

```ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { analyzeResume } from "@/lib/ai/analyze";
import { generateEmbedding, cosineSimilarityVectors } from "@/lib/ai/embeddings";
import { checkDemoLimit } from "@/lib/rate-limit";
import { DEMO_SAMPLES } from "@/lib/ai/demo-samples";
import { withErrorHandling } from "@/lib/api-handler";

const bodySchema = z.object({
  sampleId: z.enum(DEMO_SAMPLES.map((s) => s.id) as [string, ...string[]]),
});

export const POST = withErrorHandling(async (req: Request) => {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { success } = await checkDemoLimit(ip);
  if (!success) {
    return NextResponse.json(
      { error: "Demo limit reached. Sign up for a free account to keep analyzing." },
      { status: 429 }
    );
  }

  const json = await req.json();
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const sample = DEMO_SAMPLES.find((s) => s.id === parsed.data.sampleId);
  if (!sample) return NextResponse.json({ error: "Unknown sample" }, { status: 400 });

  const [result, resumeEmbedding, jobEmbedding] = await Promise.all([
    analyzeResume(sample.resumeText, sample.jobDescription),
    generateEmbedding(sample.resumeText),
    generateEmbedding(sample.jobDescription),
  ]);

  const semanticSimilarity = cosineSimilarityVectors(resumeEmbedding, jobEmbedding);

  return NextResponse.json({ ...result, semanticSimilarity, sample: { jobTitle: sample.jobTitle, company: sample.company } });
});
```

### 3.5 Page démo

`app/[locale]/(marketing)/demo/page.tsx`

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { IconLock, IconEdit, IconSparkles, IconCircleCheck, IconAlertCircle } from "@tabler/icons-react";
import { ScoreRing } from "@/components/ui/score-ring";
import { SkillTag } from "@/components/ui/skill-tag";
import { LoaderRing } from "@/components/ui/loader-ring";
import { DEMO_SAMPLES } from "@/lib/ai/demo-samples";

type Result = {
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  semanticSimilarity: number;
  sample: { jobTitle: string; company?: string };
};

export default function DemoPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  async function runDemo(sampleId: string) {
    setSelected(sampleId);
    setLoading(true);
    setError("");
    setResult(null);
    const res = await fetch("/api/demo-analyze", {
      method: "POST",
      body: JSON.stringify({ sampleId }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(typeof data.error === "string" ? data.error : "Demo unavailable right now.");
      setLoading(false);
      return;
    }
    setResult(await res.json());
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-24 md:px-16">
      <div className="mb-16 text-center">
        <h1 className="font-display text-3xl font-bold text-base-light">Try it — no signup required</h1>
        <p className="mx-auto mt-3 max-w-xl text-muted">
          Pick a sample profile and watch Résona run a real match analysis, live.
        </p>
      </div>

      <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {DEMO_SAMPLES.map((sample) => (
          <button
            key={sample.id}
            onClick={() => runDemo(sample.id)}
            disabled={loading}
            className={`rounded-(--radius-card) border p-6 text-left transition-colors disabled:opacity-50 ${
              selected === sample.id ? "border-accent bg-track/30" : "border-track hover:border-accent/40"
            }`}
          >
            <p className="font-display text-lg font-medium text-base-light">{sample.label}</p>
            <p className="mt-1 text-sm text-muted">vs {sample.jobTitle} @ {sample.company}</p>
            <span className="mt-3 inline-block text-xs tracking-widest text-accent uppercase">
              {sample.matchHint}
            </span>
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex flex-col items-center gap-4 py-16">
          <LoaderRing size={32} />
          <p className="text-sm text-muted">Running real analysis…</p>
        </div>
      )}

      {error && <p className="text-center text-sm text-accent">{error}</p>}

      {result && !loading && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="flex flex-col gap-8 lg:col-span-8">
            <section className="flex flex-col items-center rounded-(--radius-card) border border-track bg-track/20 p-10 text-center">
              <ScoreRing score={result.matchScore} size={140} />
              <p className="mt-4 text-xs tracking-widest text-muted uppercase">
                Semantic similarity (pgvector): {Math.round(result.semanticSimilarity * 100)}%
              </p>
            </section>

            <section className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              <div className="rounded-(--radius-card) border border-track bg-track/20 p-6">
                <div className="mb-4 flex items-center gap-2">
                  <IconCircleCheck size={18} stroke={1.5} className="text-accent" />
                  <h3 className="font-display text-base font-medium text-base-light">Matching skills</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.matchingSkills.map((s) => (
                    <SkillTag key={s} label={s} variant="match" />
                  ))}
                </div>
              </div>
              <div className="rounded-(--radius-card) border border-track bg-track/20 p-6">
                <div className="mb-4 flex items-center gap-2">
                  <IconAlertCircle size={18} stroke={1.5} className="text-accent" />
                  <h3 className="font-display text-base font-medium text-base-light">Missing skills</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.missingSkills.map((s) => (
                    <SkillTag key={s} label={s} variant="gap" />
                  ))}
                </div>
              </div>
            </section>
          </div>

          <aside className="lg:col-span-4">
            <div className="relative overflow-hidden rounded-(--radius-card) border border-track bg-track/20 p-8">
              <div className="pointer-events-none absolute inset-0 backdrop-blur-sm" />
              <div className="relative flex flex-col items-center gap-4 text-center">
                <IconLock size={28} stroke={1.5} className="text-accent" />
                <p className="font-display text-lg font-medium text-base-light">
                  Full recommendations, resume rewrite &amp; cover letter
                </p>
                <p className="text-sm text-muted">
                  Create a free account to unlock section-by-section suggestions and generate a tailored
                  rewrite for this match.
                </p>
                <Link
                  href="/sign-up"
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-(--radius-control) bg-accent py-3.5 text-sm font-bold text-[var(--color-base)] transition-opacity hover:opacity-90"
                >
                  <IconEdit size={16} stroke={1.5} />
                  Create free account
                </Link>
                <Link
                  href="/upload"
                  className="flex w-full items-center justify-center gap-2 rounded-(--radius-control) border border-accent py-3.5 text-sm font-bold text-accent transition-colors hover:bg-accent/5"
                >
                  <IconSparkles size={16} stroke={1.5} />
                  Analyze my own resume
                </Link>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
```

### 3.6 Lien sur la landing page

Ajout dans `app/[locale]/(marketing)/page.tsx`, sous le bloc des deux boutons CTA du hero (après le `</div>` qui ferme `flex flex-col items-center justify-center gap-4 md:flex-row`) :

```tsx
<Link
  href="/demo"
  className="animate-fade-up mt-6 block text-center text-sm text-muted transition-colors hover:text-accent"
  style={{ animationDelay: "350ms" }}
>
  or try an instant demo — no signup →
</Link>
```

### 3.7 Lien dans le footer

Ajout dans `components/layout/public-footer.tsx`, dans le groupe de liens existant (`<div className="flex gap-8 text-xs">`), avant "Privacy" :

```tsx
<Link href="/demo" className="text-muted transition-colors hover:text-accent">
  Live Demo
</Link>
```

---

**Definition of Done :** un visiteur non connecté peut sélectionner un profil sur `/demo`, obtenir un vrai score + skills matching/missing en quelques secondes, sans qu'aucune ligne ne soit écrite en base. Le panneau de droite pousse clairement vers l'inscription. Au-delà de 5 essais/heure/IP, un message clair apparaît au lieu d'une erreur brute. Aucune route de démo ne touche `db.resume`, `db.jobPost`, ni `db.analysis`.
