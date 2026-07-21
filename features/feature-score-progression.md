# Résona — Feature: Suivi de progression du score

> Document de délégation. Spec, tasks, code complet. Vérifié contre le vrai code au 2026-07-21 — réutilise le pattern SVG déjà en place dans `components/dashboard/trend-chart.tsx` (pas de librairie de charting externe).

---

## 1. Spec

**Constat de départ** : le dashboard (`app/[locale]/(app)/dashboard/page.tsx`) affiche déjà `avgMatchScore` comme statistique ponctuelle, et un `TrendChart` pour le volume de candidatures — mais aucune vue de l'évolution du match score dans le temps. Les données existent déjà (`analyses` est fetché avec `matchScore` et `createdAt`), il manque juste la visualisation.

**Objectif** : une nouvelle section "Score Progression" sur le dashboard, entre "Application Trends" et "Recent Activity", montrant le `matchScore` de chaque analyse dans l'ordre chronologique — donne à l'utilisateur (et au recruteur qui regarde par-dessus son épaule) une preuve visuelle que le produit aide réellement à progresser.

**Échelle fixe** : contrairement à `TrendChart` (échelle dynamique sur le volume), ce graphique utilise une échelle fixe 0–100 puisque le score est borné, avec une ligne de repère à 70 (le seuil déjà utilisé ailleurs dans l'app pour "Matches requirements" — cf. `dashboard/page.tsx` ligne `item.matchScore >= 70`).

**Cas limite** : avec moins de 2 analyses, aucune tendance n'est significative — afficher un message discret plutôt qu'un graphique plat ou vide.

## 2. Tasks

- [ ] Créer `components/dashboard/score-trend-chart.tsx`
- [ ] Insérer la section dans `app/[locale]/(app)/dashboard/page.tsx`
- [ ] Gérer le cas `< 2` analyses

## 3. Code complet

### 3.1 Composant graphique

`components/dashboard/score-trend-chart.tsx`

```tsx
const WIDTH = 1000;
const HEIGHT = 200;
const THRESHOLD = 70;

export function ScoreTrendChart({ data }: { data: { label: string; score: number }[] }) {
  const stepX = data.length > 1 ? WIDTH / (data.length - 1) : WIDTH;
  const yFor = (score: number) => HEIGHT - 10 - (score / 100) * (HEIGHT - 20);

  const points = data.map((d, i) => ({ x: i * stepX, y: yFor(d.score) }));
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1].x},${HEIGHT} L0,${HEIGHT} Z`;
  const thresholdY = yFor(THRESHOLD);

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-64 w-full overflow-visible">
        <defs>
          <linearGradient id="scoreTrendGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
          </linearGradient>
        </defs>

        <line
          x1={0}
          x2={WIDTH}
          y1={thresholdY}
          y2={thresholdY}
          stroke="var(--color-muted)"
          strokeWidth={1}
          strokeDasharray="4 4"
          opacity={0.4}
        />

        <path d={areaPath} fill="url(#scoreTrendGradient)" />
        <path
          d={linePath}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={4} fill="var(--color-accent)" />
        ))}
      </svg>
      <div className="mt-4 flex items-center justify-between text-xs text-muted">
        <span>{data[0]?.label}</span>
        <span className="flex items-center gap-1.5">
          <span className="h-px w-4 border-t border-dashed border-muted opacity-60" />
          70 — target threshold
        </span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
}
```

### 3.2 Insertion dans le dashboard

Modification de `app/[locale]/(app)/dashboard/page.tsx` :

```tsx
import { ScoreTrendChart } from "@/components/dashboard/score-trend-chart";

// ... après le calcul de chartData existant, ajouter :

const scoreChartData = [...analyses]
  .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
  .map((a) => ({
    label: a.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    score: a.matchScore,
  }));
```

Puis, dans le JSX, insérer une nouvelle `<section>` juste après la section "Trend chart" existante (`Application Trends`) et avant "Recent activity" :

```tsx
{scoreChartData.length >= 2 && (
  <section className="mb-16">
    <div className="rounded-(--radius-card) border border-track p-8">
      <div className="mb-12 flex items-end justify-between">
        <div>
          <h2 className="mb-1 font-display text-xl font-medium text-base-light">Score Progression</h2>
          <p className="text-sm text-muted">Match score across every analysis, in order</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="size-3 rounded-full bg-accent" />
          Match score
        </div>
      </div>
      <ScoreTrendChart data={scoreChartData} />
    </div>
  </section>
)}
{scoreChartData.length < 2 && analyses.length > 0 && (
  <section className="mb-16">
    <div className="rounded-(--radius-card) border border-track p-8 text-center">
      <p className="text-sm text-muted">
        Analyze a couple more resumes to see your score progression over time.
      </p>
    </div>
  </section>
)}
```

---

**Definition of Done :** avec 2+ analyses, le dashboard affiche un graphique de progression du score dans l'ordre chronologique, avec une ligne de repère à 70. Avec 0 ou 1 analyse, aucun graphique cassé ou vide n'apparaît — soit rien (0), soit un message discret (1).
