# Résona — Feature: Page `/built-with`

> Document de délégation. Spec, tasks, code complet. Vérifié contre le vrai code au 2026-07-21 — la stack listée ci-dessous est celle réellement utilisée (lue dans `package.json`, `lib/ai/analyze.ts`, `lib/ai/embeddings.ts`, `lib/rate-limit.ts`, `prisma/schema.prisma`), pas une stack générique.

---

## 1. Spec

**Objectif** : une page publique qui explique, techniquement et honnêtement, ce qui fait tourner Résona — destinée à un recruteur ou lead technique qui veut évaluer le niveau de jugement produit/technique, pas juste voir un joli écran. C'est la page qui transforme "encore un projet portfolio avec une todo-list IA" en preuve de compétence d'architecture.

**Ton** : factuel, une ligne de justification par choix technique (pourquoi celui-là et pas un autre), cohérent avec la voix "expert rassurant" du reste du produit.

**Contenu réel** (à ne pas romancer — c'est la vraie stack) :

| Catégorie | Techno | Pourquoi |
|---|---|---|
| Frontend | Next.js 16 (App Router) | Rendu hybride serveur/client, routes imbriquées, déploiement edge-ready |
| Frontend | React 19 + TypeScript | Écosystème mature, typage de bout en bout |
| Style | Tailwind CSS v4 (`@theme` CSS-first) | Système de tokens design en CSS natif, itération rapide |
| IA — analyse | Groq (`llama-3.3-70b-versatile`) | Inférence quasi instantanée sur le pipeline de scoring/rewrite |
| IA — similarité | HuggingFace Inference (`all-MiniLM-L6-v2`) | Embeddings sémantiques dédiés, séparés du LLM de génération |
| Base de données | PostgreSQL (Neon) + extension `pgvector` | Recherche vectorielle native en base, pas une lib externe |
| ORM | Prisma | Migrations typées, requêtes raw ciblées pour les colonnes `vector` |
| Auth | NextAuth v5 (Google OAuth + credentials) | Standard éprouvé, adaptateur Prisma direct |
| Paiement | Stripe (Checkout + Customer Portal + webhooks) | Facturation réelle, pas simulée |
| Rate limiting | Upstash Redis (`@upstash/ratelimit`) | Fonctionne en environnement serverless sans état partagé |
| Upload fichiers | UploadThing | Gestion de fichiers sans backend de stockage à maintenir |
| i18n | next-intl | EN/FR, routing par locale |
| Monitoring | Sentry | Erreurs runtime en production |
| Déploiement | Vercel | CI/CD natif Next.js |

## 2. Tasks

- [ ] Créer `app/[locale]/(marketing)/built-with/page.tsx`
- [ ] Ajouter le lien dans `PublicFooter`
- [ ] (optionnel) Ajouter un lien discret dans `PublicNavbar`

## 3. Code complet

`app/[locale]/(marketing)/built-with/page.tsx`

```tsx
const STACK = [
  {
    category: "Frontend",
    items: [
      { name: "Next.js 16", detail: "App Router, hybrid rendering, edge-ready deploys." },
      { name: "React 19 + TypeScript", detail: "End-to-end typing, mature ecosystem." },
      { name: "Tailwind CSS v4", detail: "CSS-first token system (@theme), fast iteration." },
    ],
  },
  {
    category: "Artificial Intelligence",
    items: [
      { name: "Groq — Llama 3.3 70B", detail: "Near-instant inference for scoring, rewriting, cover letters." },
      { name: "HuggingFace Inference", detail: "all-MiniLM-L6-v2 sentence embeddings, decoupled from the generation model." },
    ],
  },
  {
    category: "Data",
    items: [
      { name: "PostgreSQL on Neon", detail: "Serverless Postgres with the pgvector extension enabled." },
      { name: "pgvector", detail: "Native vector similarity search in the database — no external vector store." },
      { name: "Prisma", detail: "Typed migrations, raw SQL for vector-column operations." },
    ],
  },
  {
    category: "Platform",
    items: [
      { name: "NextAuth v5", detail: "Google OAuth + credentials, Prisma adapter." },
      { name: "Stripe", detail: "Real Checkout, Customer Portal, and webhook-driven plan sync." },
      { name: "Upstash Redis", detail: "Sliding-window rate limiting that works in serverless functions." },
      { name: "UploadThing", detail: "File handling without a self-managed storage backend." },
      { name: "next-intl", detail: "EN/FR locale routing and message catalogs." },
      { name: "Sentry", detail: "Runtime error monitoring in production." },
      { name: "Vercel", detail: "CI/CD native to the Next.js framework." },
    ],
  },
];

export default function BuiltWithPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-24 md:px-16">
      <div className="mb-16 text-center">
        <h1 className="font-display text-3xl font-bold text-base-light">Built with</h1>
        <p className="mx-auto mt-3 max-w-xl text-muted">
          The real stack behind Résona, and why each piece was chosen.
        </p>
      </div>

      <div className="flex flex-col gap-16">
        {STACK.map((group) => (
          <section key={group.category}>
            <h2 className="mb-6 font-display text-lg font-medium text-base-light">{group.category}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {group.items.map((item) => (
                <div
                  key={item.name}
                  className="rounded-(--radius-card) border border-track p-6 transition-colors hover:border-accent/40"
                >
                  <p className="font-display text-base font-medium text-base-light">{item.name}</p>
                  <p className="mt-2 text-sm text-muted">{item.detail}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
```

### 3.1 Lien dans le footer

Ajout dans `components/layout/public-footer.tsx`, dans le groupe de liens existant :

```tsx
<Link href="/built-with" className="text-muted transition-colors hover:text-accent">
  Built With
</Link>
```

---

**Definition of Done :** `/built-with` liste la vraie stack, groupée par catégorie, avec une justification courte par ligne — pas de mention d'une techno non réellement utilisée dans le code. Accessible depuis le footer sur toutes les pages publiques et applicatives.
