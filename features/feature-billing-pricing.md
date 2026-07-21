# Résona — Feature: Billing & Pricing (flow réel)

> Document de délégation. Spec, tasks, code complet. Remplace le Phase 4 (`project-04-resona-phase-4-billing.md`) pour tout ce qui est UI — le code Stripe backend de la Phase 4 reste valide et est repris ici. Cette version utilise les **vrais tokens du design system** vérifiés sur les écrans Stitch réellement générés et sur le nav déjà implémenté (`primary-container`, `on-surface-variant`, `surface-container-low`, etc.) — pas les variables CSS simplifiées du tout premier brouillon Phase 1.
>
> **Aucun écran Stitch n'existe pour Pricing/Billing** — le design ci-dessous est construit à la main en respectant strictement les tokens et patterns déjà utilisés ailleurs (mêmes classes de carte, même style de bouton, même nav). Fais-le vérifier visuellement une fois codé pour confirmer la cohérence avant de le considérer "fini".

---

## 1. Spec

**Plans :**

| Plan | Prix | Analyses | Rewrite & cover letter | Historique |
|---|---|---|---|---|
| Free | $0 | 3 / 30 jours | ❌ | 5 dernières |
| Pro | $19/mois | Illimité | ✅ | Illimité |

**Ce qui doit être réellement fonctionnel** (pas une maquette) :
- Upgrade réel via Stripe Checkout (mode test au départ)
- Le plan de l'utilisateur change réellement en base après paiement (webhook)
- Le gating Pro est réellement appliqué côté serveur, pas juste caché côté UI
- Gestion d'abonnement (annulation) via le portail client Stripe

## 2. Tasks

- [ ] Reprendre le code Stripe de la Phase 4 (`lib/stripe.ts`, checkout, webhook, portal) — déjà correct, aucune modif nécessaire
- [ ] Créer les produits/prix réels dans le dashboard Stripe (mode test)
- [ ] Page `/pricing` (design ci-dessous)
- [ ] Page `/settings/billing` (design ci-dessous)
- [ ] **Fermer le gap flaggé dans API Contracts.md** : ajouter le gating Pro-only sur `/api/rewrite` et `/api/cover-letter`
- [ ] Afficher un état "quota atteint" clair sur la page Upload quand un Free user a épuisé ses 3 analyses (pas juste une erreur 429 brute)
- [ ] Tester le cycle complet en mode test Stripe : upgrade → gating levé → annulation → gating réappliqué

## 3. Code complet

### 3.1 Gating Pro — le gap fermé

Mise à jour de `app/api/rewrite/route.ts` et `app/api/cover-letter/route.ts` (Phase 2) — ajouter en tout début de handler, juste après la vérification de session :

```ts
const user = await db.user.findUnique({ where: { id: session.user.id }, select: { plan: true } });
if (user?.plan !== "PRO") {
  return NextResponse.json(
    { error: "Resume rewriting is a Pro feature. Upgrade to unlock it.", code: "UPGRADE_REQUIRED" },
    { status: 403 }
  );
}
```

Le code `"UPGRADE_REQUIRED"` permet au frontend de distinguer cette erreur d'une erreur générique et d'afficher un CTA "Upgrade" plutôt qu'un message d'erreur plat (voir composant `UpgradePrompt` ci-dessous).

### 3.2 Composant réutilisable — invite à l'upgrade

`components/billing/upgrade-prompt.tsx`

```tsx
import Link from "next/link";

export function UpgradePrompt({ feature }: { feature: string }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-outline-variant bg-surface-container-low p-8 text-center">
      <span className="material-symbols-outlined text-[32px] text-primary">workspace_premium</span>
      <div>
        <p className="font-headline-sm text-headline-sm text-on-surface">{feature} is a Pro feature</p>
        <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
          Upgrade to unlock unlimited rewrites, cover letters, and full history.
        </p>
      </div>
      <Link
        href="/pricing"
        className="rounded-lg bg-primary-container px-6 py-2.5 font-label-md text-label-md text-on-primary-container"
      >
        View plans
      </Link>
    </div>
  );
}
```

Utilisation sur la page Rewrite/Cover letter modal (Phase 3) : intercepter la réponse `403` + `code === "UPGRADE_REQUIRED"` et afficher `<UpgradePrompt feature="Resume rewriting" />` à la place du contenu, plutôt qu'un message d'erreur générique.

### 3.3 Page Pricing

`app/[locale]/(marketing)/pricing/page.tsx`

```tsx
"use client";

import { useState } from "react";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Try Résona and see your first match score.",
    features: ["3 analyses per month", "Match score & gap detection", "5 saved analyses"],
    cta: "Current plan",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$19",
    period: "/ month",
    description: "For an active job search, without limits.",
    features: [
      "Unlimited analyses",
      "AI section rewriting",
      "Cover letter generation",
      "Unlimited history",
      "PDF export",
    ],
    cta: "Upgrade to Pro",
    highlighted: true,
  },
];

export default function PricingPage() {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await res.json();
    window.location.href = data.url;
  }

  return (
    <div className="mx-auto max-w-container-max px-margin-mobile py-24 md:px-margin-desktop">
      <div className="mb-16 text-center">
        <h1 className="font-headline-lg text-headline-lg text-on-background">Simple, honest pricing</h1>
        <p className="mt-3 font-body-md text-body-md text-on-surface-variant">
          Start free. Upgrade when your search gets serious.
        </p>
      </div>

      <div className="mx-auto grid max-w-3xl grid-cols-1 gap-8 md:grid-cols-2">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-xl border p-8 ${
              plan.highlighted
                ? "border-primary-container bg-surface-container-low"
                : "border-outline-variant bg-surface-container-lowest"
            }`}
          >
            {plan.highlighted && (
              <span className="mb-4 inline-block rounded bg-primary-container px-3 py-1 font-label-md text-label-md text-on-primary-container">
                Most popular
              </span>
            )}
            <h2 className="font-headline-md text-headline-md text-on-surface">{plan.name}</h2>
            <p className="mt-3 font-body-sm text-body-sm text-on-surface-variant">{plan.description}</p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="font-display-lg text-4xl font-bold text-on-surface">{plan.price}</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">{plan.period}</span>
            </div>
            <ul className="mt-8 flex flex-col gap-3">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 font-body-sm text-body-sm text-on-surface">
                  <span className="material-symbols-outlined text-[16px] text-primary">check</span>
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={plan.id === "pro" ? handleUpgrade : undefined}
              disabled={plan.id === "free" || loading}
              className={`mt-8 w-full rounded-lg py-3 font-label-md text-label-md transition-all ${
                plan.id === "pro"
                  ? "bg-primary-container text-on-primary-container hover:bg-opacity-90"
                  : "border border-outline-variant text-on-surface-variant"
              } disabled:opacity-60`}
            >
              {loading && plan.id === "pro" ? "Redirecting…" : plan.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

> Le bouton "Current plan" sur Free est statique en l'état — si l'utilisateur est déjà Pro, la page doit idéalement détecter son plan (`session.user.plan` via un appel serveur) et inverser l'état des deux cartes (Pro devient "Current plan" désactivé, Free devient "Downgrade" qui renvoie vers `/api/stripe/portal`). Non codé ci-dessus pour rester lisible — à ajouter en convertissant le haut du composant en Server Component qui passe `currentPlan` en prop.

### 3.4 Page Settings → Billing

`app/[locale]/(app)/settings/billing/page.tsx`

```tsx
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";

export default async function BillingSettingsPage() {
  const session = await auth();
  const user = await db.user.findUnique({
    where: { id: session!.user!.id },
    include: { subscription: true },
  });

  return (
    <div className="mx-auto max-w-2xl px-margin-mobile py-16 md:px-margin-desktop">
      <h1 className="mb-8 font-headline-md text-headline-md text-on-surface">Billing</h1>

      <div className="rounded-xl border border-outline-variant bg-surface-container-low p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-label-md text-label-md uppercase text-on-surface-variant">Current plan</p>
            <p className="mt-1 font-headline-sm text-headline-sm text-primary">{user?.plan}</p>
          </div>
          {user?.plan === "FREE" && (
            <Link
              href="/pricing"
              className="rounded-lg bg-primary-container px-5 py-2.5 font-label-md text-label-md text-on-primary-container"
            >
              Upgrade to Pro
            </Link>
          )}
        </div>

        {user?.subscription?.currentPeriodEnd && (
          <p className="mt-4 font-body-sm text-body-sm text-on-surface-variant">
            Renews on{" "}
            {new Date(user.subscription.currentPeriodEnd).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        )}
      </div>

      {user?.plan === "PRO" && (
        <form action="/api/stripe/portal" method="POST" className="mt-6">
          <button className="rounded-lg border border-outline-variant px-5 py-2.5 font-label-md text-label-md text-on-surface">
            Manage subscription
          </button>
        </form>
      )}
    </div>
  );
}
```

### 3.5 État "quota atteint" sur Upload

Ajout à `app/[locale]/(app)/upload/page.tsx` (Phase 3) — intercepter la réponse `429` de `/api/analyze` :

```tsx
// dans handleAnalyze(), après le fetch("/api/analyze", ...)
if (res.status === 429) {
  setQuotaExceeded(true);
  setSubmitting(false);
  return;
}
```

```tsx
{quotaExceeded && (
  <div className="rounded-xl border border-outline-variant bg-surface-container-low p-6 text-center">
    <p className="font-headline-sm text-headline-sm text-on-surface">You've used all 3 free analyses this month</p>
    <p className="mt-2 font-body-sm text-body-sm text-on-surface-variant">
      Upgrade to Pro for unlimited analyses.
    </p>
    <Link
      href="/pricing"
      className="mt-4 inline-block rounded-lg bg-primary-container px-6 py-2.5 font-label-md text-label-md text-on-primary-container"
    >
      View plans
    </Link>
  </div>
)}
```

---

**Definition of Done :** un Free user qui tente `/api/rewrite` reçoit un `403 UPGRADE_REQUIRED` et voit `UpgradePrompt`, pas une erreur brute. Le paiement test Stripe débloque réellement ces fonctionnalités sans refresh manuel nécessaire au prochain appel API. La page Pricing et Settings→Billing reflètent l'état réel du plan. Annuler dans le portail Stripe réapplique le gating côté serveur (pas seulement visuel).
