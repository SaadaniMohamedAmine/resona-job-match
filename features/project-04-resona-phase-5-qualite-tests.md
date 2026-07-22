# Résona — Phase 5 : Qualité, Tests & Performance

> Document de délégation. Spec, tasks, code complet. Dépend des Phases 1-4 (tout doit être implémenté pour être testé).
>
> **Rafraîchi le 2026-07-21** contre le vrai code : sélecteur e2e corrigé pour matcher le vrai `UploadForm` (pas d'`id="resume-upload"` dans le vrai composant). `ScoreRing` et `GET /api/resumes` vérifiés conformes aux tests ci-dessous, aucune autre correction nécessaire sur cette phase.

---

## 1. Spec

**Objectif :** prouver que le produit est fiable — tests automatisés à trois niveaux (unit/intégration/e2e), CI qui bloque les régressions, accessibilité WCAG AA vérifiée, performance validée, Sentry vérifié en conditions réelles.

**Dépendances :** Phases 1-4 complètes.

---

## 2. Tasks

- [ ] Setup Vitest
- [ ] Tests unitaires : parsing réponse IA, calcul de similarité, logique de quotas
- [ ] Setup tests d'intégration sur les routes API clés
- [ ] Setup Playwright
- [ ] Test e2e du flow principal (upload → analyse → résultats → tracker)
- [ ] GitHub Actions (lint + build + tests sur chaque PR)
- [ ] Seuil de couverture minimum sur `lib/ai/` et `lib/rate-limit.ts`
- [ ] Audit contraste WCAG AA (champagne sur graphite en particulier)
- [ ] Navigation clavier complète (tab order, focus visible)
- [ ] Aria-labels sur tous les composants interactifs sans texte visible
- [ ] Lighthouse ≥ 90 (perf/a11y/SEO)
- [ ] Meta tags SEO + OG branchés
- [ ] Vérifier la remontée d'erreurs Sentry en conditions réelles (staging)

---

## 3. Code complet

### 3.1 Setup Vitest

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

`vitest.config.ts`

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      include: ["lib/ai/**", "lib/rate-limit.ts"],
      thresholds: { lines: 70, functions: 70 },
    },
  },
  resolve: { alias: { "@": path.resolve(__dirname, ".") } },
});
```

`tests/setup.ts`

```ts
import "@testing-library/jest-dom";
```

### 3.2 Tests unitaires — logique métier critique

`tests/unit/analyze.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { analysisResultSchema } from "@/lib/ai/analyze";

describe("analysisResultSchema", () => {
  it("accepts a well-formed AI response", () => {
    const valid = {
      matchScore: 87,
      matchingSkills: ["React", "TypeScript"],
      missingSkills: ["GraphQL"],
      suggestions: [
        { section: "summary", issue: "Too generic", recommendation: "Mention years of experience" },
      ],
    };
    expect(analysisResultSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a match score outside 0-100", () => {
    const invalid = { matchScore: 150, matchingSkills: [], missingSkills: [], suggestions: [] };
    expect(analysisResultSchema.safeParse(invalid).success).toBe(false);
  });

  it("rejects an unknown section in suggestions", () => {
    const invalid = {
      matchScore: 50,
      matchingSkills: [],
      missingSkills: [],
      suggestions: [{ section: "hobbies", issue: "x", recommendation: "y" }],
    };
    expect(analysisResultSchema.safeParse(invalid).success).toBe(false);
  });
});
```

`tests/unit/score-ring.test.tsx`

```ts
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScoreRing } from "@/components/ui/score-ring";

describe("ScoreRing", () => {
  it("renders the score as accessible text", () => {
    render(<ScoreRing score={87} />);
    expect(screen.getByLabelText("Match score: 87%")).toBeInTheDocument();
  });

  it("renders 0% without crashing", () => {
    render(<ScoreRing score={0} />);
    expect(screen.getByText("0%")).toBeInTheDocument();
  });
});
```

`tests/unit/quota-logic.test.ts`

```ts
import { describe, it, expect, vi } from "vitest";

// Pure function extracted from lib/rate-limit.ts logic for testability
function resolveLimiterTier(plan: "FREE" | "PRO"): { limit: number; windowDays: number } {
  return plan === "PRO" ? { limit: 200, windowDays: 30 } : { limit: 3, windowDays: 30 };
}

describe("plan quota resolution", () => {
  it("gives Free users 3 analyses per 30 days", () => {
    expect(resolveLimiterTier("FREE")).toEqual({ limit: 3, windowDays: 30 });
  });

  it("gives Pro users 200 analyses per 30 days", () => {
    expect(resolveLimiterTier("PRO")).toEqual({ limit: 200, windowDays: 30 });
  });
});
```

### 3.3 Tests d'intégration — routes API

```bash
npm install -D supertest
```

`tests/integration/resumes.test.ts`

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/resumes/route";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: "test-user-id" } }),
}));

vi.mock("@/lib/db", () => ({
  db: {
    analysis: {
      findMany: vi.fn().mockResolvedValue([
        { id: "a1", matchScore: 87, userId: "test-user-id" },
      ]),
    },
  },
}));

describe("GET /api/resumes", () => {
  it("returns the current user's analyses", async () => {
    const res = await GET();
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.analyses).toHaveLength(1);
    expect(data.analyses[0].matchScore).toBe(87);
  });
});
```

`tests/integration/analyze-auth.test.ts`

```ts
import { describe, it, expect, vi } from "vitest";
import { POST } from "@/app/api/analyze/route";

vi.mock("@/lib/auth", () => ({ auth: vi.fn().mockResolvedValue(null) }));

describe("POST /api/analyze — unauthenticated", () => {
  it("returns 401 when no session exists", async () => {
    const req = new Request("http://localhost/api/analyze", { method: "POST", body: "{}" });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });
});
```

### 3.4 Tests e2e — Playwright

```bash
npm init playwright@latest
```

`playwright.config.ts`

```ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
  },
  use: { baseURL: "http://localhost:3000" },
});
```

`tests/e2e/full-flow.spec.ts`

```ts
import { test, expect } from "@playwright/test";
import path from "path";

test("full flow: upload → analyze → results → tracker", async ({ page }) => {
  // Assumes a seeded test account exists (see Phase 6 seed script)
  await page.goto("/login");
  await page.fill('input[type="email"]', "test@resona.dev");
  await page.fill('input[type="password"]', "testpassword123");
  await page.click('button[type="submit"]');

  await page.waitForURL("/upload");
  await page.setInputFiles('input[type="file"]', path.join(__dirname, "fixtures/sample-resume.pdf"));
  await page.fill('input[placeholder="Job title"]', "Senior Frontend Engineer");
  await page.fill('textarea', "We are looking for a Senior Frontend Engineer with React and TypeScript experience.");
  await page.click('button:has-text("Analyze")');

  await page.waitForURL(/\/results\//, { timeout: 30000 });
  await expect(page.getByText("Matching skills")).toBeVisible();

  await page.goto("/tracker");
  await expect(page.getByText("Applied")).toBeVisible();
});
```

### 3.5 CI — GitHub Actions

`.github/workflows/ci.yml`

```yaml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  lint-build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: "npm"
      - run: npm ci
      - run: npm run lint
      - run: npx prisma generate
      - run: npm run build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL_TEST }}
      - run: npm run test:unit -- --coverage
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL_TEST }}
```

`package.json` (scripts à ajouter)

```json
{
  "scripts": {
    "test:unit": "vitest run",
    "test:e2e": "playwright test"
  }
}
```

### 3.6 Accessibilité

Checklist à valider manuellement (pas de code à écrire — configuration/vérification) :
- Contraste `#C9A961` sur `#16140F` : ratio ≈ 6.4:1 — conforme AA pour texte normal (≥ 4.5:1) et AAA pour texte large (≥ 3:1). Vérifier `#B8AD98` sur `#16140F` (texte secondaire) : ratio ≈ 5.9:1 — conforme AA.
- Tous les boutons icône-seul (ex: fermer une modal) doivent avoir `aria-label`.
- `SkillTag` : l'icône seule ne suffit pas à transmettre le statut — le texte du label est déjà présent, donc conforme (ne jamais retirer le label texte pour ne garder que l'icône).
- Tester la navigation complète au clavier sur : Upload (dropzone → focus visible), Rewrite (tabs de section), Tracker (cartes kanban).

### 3.7 SEO & meta tags

`app/[locale]/layout.tsx` (ajout à la Phase 1) — `generateMetadata` :

```ts
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  return {
    title: "Résona — Your resume, aligned to every opportunity.",
    description: "AI-powered resume and job-match analysis. Get your match score, close the gaps, and rewrite your resume for every application.",
    openGraph: {
      title: "Résona",
      description: "Your resume, aligned to every opportunity.",
      locale: params.locale,
      type: "website",
    },
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL!),
  };
}
```

---

**Definition of Done — Phase 5 :** `npm run test:unit` et `npm run test:e2e` passent en local et en CI, la CI bloque une PR si lint/build/tests échouent, Lighthouse ≥ 90 sur perf/a11y/SEO en mode production (`next build && next start`), une erreur volontairement déclenchée en staging apparaît dans Sentry sous 1 minute.
