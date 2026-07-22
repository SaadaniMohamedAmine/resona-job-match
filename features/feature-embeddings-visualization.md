# Résona — Feature: Embeddings pgvector visibles

> Document de délégation. Spec, tasks, code complet. Vérifié contre le vrai code au 2026-07-21.

---

## 1. Spec

**Constat de départ** : `lib/ai/embeddings.ts` calcule déjà de vrais embeddings (HuggingFace `all-MiniLM-L6-v2`) et les sauvegarde en colonnes `vector(384)` sur `Resume` et `JobPost` à chaque analyse (`app/api/analyze/route.ts`, lignes `generateEmbedding` + `saveResumeEmbedding`/`saveJobPostEmbedding`). La fonction `cosineSimilarity(resumeId, jobPostId)` existe déjà et fonctionne (requête SQL brute utilisant l'opérateur `<=>` de pgvector) — **mais elle n'est jamais appelée après l'analyse**. Le travail d'infrastructure vectorielle est invisible à l'utilisateur.

**Objectif** : afficher cette similarité vectorielle comme une métrique distincte du `matchScore` (qui vient du LLM Groq) sur la page de résultats — un vrai différenciateur technique à montrer à un recruteur : "cette plateforme ne fait pas que demander à un LLM de deviner un score, elle calcule une vraie distance vectorielle en base."

**Distinction à bien clarifier dans l'UI** : `matchScore` = évaluation du LLM (contexte, nuance, formulation). `semanticSimilarity` = distance cosinus pure entre les deux embeddings (structure sémantique globale). Les deux peuvent diverger légèrement — c'est normal et c'est justement ce qui rend la métrique intéressante à montrer.

## 2. Tasks

- [ ] Migration Prisma : ajouter `semanticSimilarity Float?` au modèle `Analysis`
- [ ] Modifier `app/api/analyze/route.ts` pour calculer et stocker la similarité après la sauvegarde des embeddings
- [ ] Créer `components/results/semantic-similarity-bar.tsx`
- [ ] Insérer le composant sur la page de résultats, à côté du `ScoreRing`

## 3. Code complet

### 3.1 Migration Prisma

`prisma/schema.prisma` — modification du modèle `Analysis` :

```prisma
model Analysis {
  id                String   @id @default(cuid())
  userId            String
  resumeId          String
  jobPostId         String
  matchScore        Int
  semanticSimilarity Float?
  matchingSkills    String[]
  missingSkills     String[]
  suggestions       Json
  coverLetter       String? @db.Text
  createdAt         DateTime @default(now())

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  resume  Resume  @relation(fields: [resumeId], references: [id], onDelete: Cascade)
  jobPost JobPost @relation(fields: [jobPostId], references: [id], onDelete: Cascade)

  application Application?
}
```

```bash
npx prisma migrate dev --name add_semantic_similarity
```

### 3.2 Calcul et stockage

Modification de `app/api/analyze/route.ts` — après le bloc qui sauvegarde les embeddings et avant `analyzeResume` (ou en parallèle, peu importe l'ordre tant que les embeddings sont déjà en base) :

```ts
import { generateEmbedding, saveResumeEmbedding, saveJobPostEmbedding, cosineSimilarity } from "@/lib/ai/embeddings";

// ... code existant inchangé jusqu'à :

await Promise.all([
  saveResumeEmbedding(resume.id, resumeEmbedding),
  saveJobPostEmbedding(jobPost.id, jobEmbedding),
]);

const semanticSimilarity = await cosineSimilarity(resume.id, jobPost.id);

const result = await analyzeResume(extractedText, jobDescription);

const analysis = await db.analysis.create({
  data: {
    userId: session.user.id,
    resumeId: resume.id,
    jobPostId: jobPost.id,
    matchScore: result.matchScore,
    semanticSimilarity,
    matchingSkills: result.matchingSkills,
    missingSkills: result.missingSkills,
    suggestions: result.suggestions,
  },
});
```

### 3.3 Composant d'affichage

`components/results/semantic-similarity-bar.tsx`

```tsx
"use client";

import { useState } from "react";
import { IconInfoCircle } from "@tabler/icons-react";

export function SemanticSimilarityBar({ similarity }: { similarity: number | null }) {
  const [showInfo, setShowInfo] = useState(false);
  if (similarity === null) return null;
  const pct = Math.round(similarity * 100);

  return (
    <div className="mt-6 w-full max-w-xs">
      <div className="mb-2 flex items-center justify-center gap-1.5 text-xs tracking-widest text-muted uppercase">
        <span>Semantic similarity</span>
        <button
          type="button"
          onMouseEnter={() => setShowInfo(true)}
          onMouseLeave={() => setShowInfo(false)}
          onClick={() => setShowInfo((v) => !v)}
          className="relative text-muted hover:text-accent"
          aria-label="What is semantic similarity?"
        >
          <IconInfoCircle size={13} stroke={1.5} />
          {showInfo && (
            <span className="absolute bottom-full left-1/2 mb-2 w-56 -translate-x-1/2 rounded-(--radius-control) border border-track bg-base p-3 text-left text-[11px] leading-relaxed normal-case text-muted shadow-lg">
              Computed from vector embeddings stored in Postgres (pgvector), independent of the AI&apos;s
              language-based match score above.
            </span>
          )}
        </button>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-track">
        <div className="h-full rounded-full bg-accent transition-[width]" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1.5 text-center text-xs text-muted">{pct}%</p>
    </div>
  );
}
```

### 3.4 Insertion sur la page de résultats

Modification de `app/[locale]/(app)/results/[analysisId]/page.tsx` — dans la section du `ScoreRing` (la première `<section>` du `<div className="flex flex-col gap-8 lg:col-span-8">`) :

```tsx
import { SemanticSimilarityBar } from "@/components/results/semantic-similarity-bar";

// ...

<section className="flex flex-col items-center rounded-(--radius-card) border border-track bg-track/20 p-10 text-center">
  <ScoreRing score={analysis.matchScore} size={160} />
  <h1 className="mt-6 font-display text-2xl font-bold text-base-light">{headline}</h1>
  <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">{description}</p>
  <SemanticSimilarityBar similarity={analysis.semanticSimilarity} />
</section>
```

> Les analyses créées avant cette migration auront `semanticSimilarity: null` — le composant retourne `null` proprement dans ce cas, pas de crash ni de barre vide affichée.

---

**Definition of Done :** chaque nouvelle analyse stocke une vraie similarité cosinus calculée via pgvector. La page de résultats affiche cette métrique distinctement du match score, avec une info-bulle qui explique la différence. Les analyses historiques (sans la donnée) n'affichent simplement pas la barre, sans erreur.
