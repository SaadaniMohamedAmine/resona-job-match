# Résona — Phase 4 : Billing & Monétisation

> Document de délégation. Spec, tasks, code complet. Dépend des Phases 1-3.
>
> **Rappel important :** le prompt Stitch livré séparément ne couvre pas encore la page Pricing ni l'onglet Settings → Billing (ils étaient hors scope au moment de la génération du design). Générer l'addendum design AVANT d'implémenter cette phase, pour rester cohérent avec le reste du design system plutôt que d'improviser un style ad hoc ici.

---

## 1. Spec

**Objectif :** monétisation réelle via Stripe — deux plans (Free / Pro), Checkout, gestion d'abonnement, quotas appliqués.

**Dépendances :** Phase 1 (modèle `Subscription` déjà dans le schéma Prisma), Phase 2 (rate limiter déjà en place, à rendre plan-aware).

**Plans (à valider avec l'utilisateur avant mise en prod — placeholders raisonnables ci-dessous) :**
- **Free** — 3 analyses/mois, pas de génération de lettre de motivation, historique limité à 5 entrées.
- **Pro** — analyses illimitées, lettres de motivation illimitées, historique illimité, export PDF.

---

## 2. Tasks

- [ ] Créer le compte Stripe (mode test) + produits/prix (Free implicite, Pro mensuel)
- [ ] Installer `stripe`
- [ ] Endpoint `POST /api/stripe/checkout`
- [ ] Endpoint `POST /api/stripe/webhook`
- [ ] Rendre le rate limiter plan-aware (Free vs Pro)
- [ ] Page Pricing
- [ ] Page Settings → Billing
- [ ] Gérer l'annulation (portail client Stripe)
- [ ] Tester le flow complet en mode test Stripe (carte `4242 4242 4242 4242`)

---

## 3. Code complet

### 3.1 Setup

```bash
npm install stripe
```

`.env.example` (ajouts)

```bash
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
STRIPE_PRO_PRICE_ID=""
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=""
```

`lib/stripe.ts`

```ts
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});
```

### 3.2 Checkout

`app/api/stripe/checkout/route.ts`

```ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { withErrorHandling } from "@/lib/api-handler";

export const POST = withErrorHandling(async () => {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { subscription: true },
  });

  let customerId = user?.subscription?.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: user!.email });
    customerId = customer.id;
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID!, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?canceled=true`,
    metadata: { userId: session.user.id },
  });

  return NextResponse.json({ url: checkoutSession.url });
});
```

### 3.3 Webhook

`app/api/stripe/webhook/route.ts`

```ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import * as Sentry from "@sentry/nextjs";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("stripe-signature")!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    Sentry.captureException(err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as any;
      const userId = session.metadata.userId;
      const subscription = await stripe.subscriptions.retrieve(session.subscription);

      await db.subscription.upsert({
        where: { userId },
        create: {
          userId,
          stripeCustomerId: session.customer,
          stripeSubscriptionId: subscription.id,
          stripePriceId: subscription.items.data[0].price.id,
          status: subscription.status,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        },
        update: {
          stripeSubscriptionId: subscription.id,
          stripePriceId: subscription.items.data[0].price.id,
          status: subscription.status,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        },
      });

      await db.user.update({ where: { id: userId }, data: { plan: "PRO" } });
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as any;
      const existing = await db.subscription.findFirst({
        where: { stripeSubscriptionId: subscription.id },
      });
      if (existing) {
        await db.subscription.update({
          where: { id: existing.id },
          data: { status: "canceled" },
        });
        await db.user.update({ where: { id: existing.userId }, data: { plan: "FREE" } });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
```

> Route config requise : ce endpoint doit recevoir le body brut, pas du JSON parsé. En Next.js App Router, `req.text()` fonctionne nativement sans config additionnelle (contrairement au Pages Router qui nécessitait `bodyParser: false`).

### 3.4 Rate limiter plan-aware

Mise à jour de `lib/rate-limit.ts` (Phase 2) :

```ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { db } from "@/lib/db";

const redis = Redis.fromEnv();

const freeLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "30 d"),
  prefix: "resona:analyze:free",
});

const proLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(200, "30 d"),
  prefix: "resona:analyze:pro",
});

export async function checkAnalyzeLimit(userId: string) {
  const user = await db.user.findUnique({ where: { id: userId }, select: { plan: true } });
  const limiter = user?.plan === "PRO" ? proLimiter : freeLimiter;
  return limiter.limit(userId);
}
```

Mettre à jour `app/api/analyze/route.ts` (Phase 2) : remplacer `analyzeLimiter.limit(session.user.id)` par `checkAnalyzeLimit(session.user.id)`.

### 3.5 Page Pricing

`app/[locale]/(marketing)/pricing/page.tsx`

```tsx
"use client";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    features: ["3 analyses per month", "Match score & gap detection", "5 saved analyses"],
  },
  {
    name: "Pro",
    price: "$19/mo",
    features: ["Unlimited analyses", "Section rewriting", "Cover letter generation", "PDF export", "Unlimited history"],
  },
];

export default function PricingPage() {
  async function handleUpgrade() {
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await res.json();
    window.location.href = data.url;
  }

  return (
    <div className="mx-auto grid max-w-3xl grid-cols-1 gap-6 px-4 py-24 sm:grid-cols-2">
      {PLANS.map((plan) => (
        <div key={plan.name} className="rounded-[var(--radius-card)] border border-[var(--color-track)] p-8">
          <h3 className="font-[family-name:var(--font-display)] text-xl text-[var(--color-base-light)]">{plan.name}</h3>
          <p className="mt-2 font-[family-name:var(--font-display)] text-3xl text-[var(--color-accent)]">{plan.price}</p>
          <ul className="mt-6 flex flex-col gap-2 text-sm text-[var(--color-muted)]">
            {plan.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          {plan.name === "Pro" && (
            <button
              onClick={handleUpgrade}
              className="mt-8 w-full rounded-[var(--radius-control)] bg-[var(--color-accent)] py-2.5 text-sm font-medium text-[var(--color-base)]"
            >
              Upgrade to Pro
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
```

### 3.6 Settings — Billing

`app/[locale]/(app)/settings/billing/page.tsx`

```tsx
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function BillingSettingsPage() {
  const session = await auth();
  const user = await db.user.findUnique({
    where: { id: session!.user!.id },
    include: { subscription: true },
  });

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-[var(--radius-card)] border border-[var(--color-track)] p-6">
        <p className="text-xs text-[var(--color-muted)]">Current plan</p>
        <p className="mt-1 font-[family-name:var(--font-display)] text-xl text-[var(--color-accent)]">{user?.plan}</p>
        {user?.subscription?.currentPeriodEnd && (
          <p className="mt-2 text-xs text-[var(--color-muted)]">
            Renews on {user.subscription.currentPeriodEnd.toLocaleDateString()}
          </p>
        )}
      </div>

      {user?.plan === "PRO" && (
        <form action="/api/stripe/portal" method="POST" className="mt-4">
          <button className="rounded-[var(--radius-control)] border border-[var(--color-track)] px-4 py-2 text-sm text-[var(--color-base-light)]">
            Manage subscription
          </button>
        </form>
      )}
    </div>
  );
}
```

`app/api/stripe/portal/route.ts`

```ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { withErrorHandling } from "@/lib/api-handler";

export const POST = withErrorHandling(async () => {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sub = await db.subscription.findUnique({ where: { userId: session.user.id } });
  if (!sub) return NextResponse.json({ error: "No subscription" }, { status: 404 });

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
  });

  return NextResponse.redirect(portalSession.url);
});
```

---

**Definition of Done — Phase 4 :** un utilisateur Free qui dépasse 3 analyses/mois reçoit une erreur 429 claire, le paiement en mode test Stripe (carte `4242 4242 4242 4242`) passe l'utilisateur en `PRO`, le webhook remet l'utilisateur en `FREE` après annulation, la page Billing reflète l'état réel de l'abonnement.
