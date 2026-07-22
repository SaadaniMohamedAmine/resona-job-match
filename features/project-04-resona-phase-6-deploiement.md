# Résona — Phase 6 : Déploiement

> Document de délégation. Spec, tasks, configuration complète. Dépend des Phases 1-5 (tout doit passer les tests avant déploiement).
>
> **Rafraîchi le 2026-07-21** contre le vrai `.env.example` : la vraie stack IA est Groq (analyse) + HuggingFace (embeddings), pas OpenAI. Toutes les occurrences `OPENAI_API_KEY` ci-dessous ont été corrigées.

---

## 1. Spec

**Objectif :** Résona en ligne, accessible publiquement, stable, avec des données de démo réalistes pour que n'importe qui (recruteur inclus) puisse tester sans friction.

**Dépendances :** Phases 1-5 complètes et vertes en CI.

---

## 2. Tasks

- [ ] Créer le projet Vercel, connecter le repo GitHub
- [ ] Provisionner Neon en production (branche séparée de la branche de dev)
- [ ] Configurer toutes les variables d'environnement de production sur Vercel
- [ ] Configurer le domaine custom (si applicable)
- [ ] Exécuter `prisma db push` / migrations sur la base de production
- [ ] Créer et exécuter le script de seed (compte démo)
- [ ] Test de bout en bout en production (flow complet)
- [ ] **Rotation des clés API avant mise en ligne publique** (Groq, HuggingFace, Stripe, UploadThing — ne jamais réutiliser des clés qui ont transité en clair pendant le développement)
- [ ] Vérifier que Sentry reçoit bien les erreurs de l'environnement de production (DSN distinct de dev si possible)

---

## 3. Configuration complète

### 3.1 `vercel.json`

```json
{
  "buildCommand": "prisma generate && next build",
  "framework": "nextjs",
  "regions": ["cdg1"]
}
```

> `regions: ["cdg1"]` (Paris) rapproche les fonctions serverless de la base Neon si celle-ci est en région EU — à ajuster selon la région Neon réellement choisie.

### 3.2 Variables d'environnement de production (Vercel)

Reprendre toutes les clés des `.env.example` des phases précédentes, avec des valeurs de **production distinctes** de celles utilisées en dev/test :

```
DATABASE_URL
AUTH_SECRET
AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET
AUTH_LINKEDIN_ID / AUTH_LINKEDIN_SECRET
GROQ_API_KEY
HUGGINGFACE_TOKEN
UPLOADTHING_TOKEN
UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
STRIPE_SECRET_KEY (clé live, pas test, une fois prêt à facturer réellement)
STRIPE_WEBHOOK_SECRET (généré depuis le dashboard Stripe pour l'endpoint de prod)
STRIPE_PRO_PRICE_ID / NEXT_PUBLIC_STRIPE_PRO_PRICE_ID
NEXT_PUBLIC_SENTRY_DSN / SENTRY_AUTH_TOKEN
NEXT_PUBLIC_APP_URL (URL de production réelle)
```

Callback URLs à mettre à jour dans les consoles Google/LinkedIn OAuth et dans Stripe (webhook endpoint) pour pointer vers le domaine de production, pas `localhost`.

### 3.3 Script de seed — compte démo

`prisma/seed.ts`

```ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("demo-password-2026", 10);

  const demoUser = await db.user.upsert({
    where: { email: "demo@resona.dev" },
    update: {},
    create: { email: "demo@resona.dev", name: "Demo User", password, plan: "PRO" },
  });

  const resume = await db.resume.create({
    data: {
      userId: demoUser.id,
      fileUrl: "https://placeholder.resona.dev/demo-resume.pdf",
      fileName: "demo-resume.pdf",
      extractedText: "Senior Frontend Engineer with 6 years of experience in React, TypeScript, and Next.js...",
    },
  });

  const jobPost = await db.jobPost.create({
    data: {
      title: "Senior Frontend Engineer",
      company: "Acme Corp",
      description: "We are looking for a Senior Frontend Engineer with strong React, TypeScript, and Next.js experience...",
    },
  });

  const analysis = await db.analysis.create({
    data: {
      userId: demoUser.id,
      resumeId: resume.id,
      jobPostId: jobPost.id,
      matchScore: 87,
      // semanticSimilarity: 0.82, // décommenter si la migration de feature-embeddings-visualization.md est appliquée
      matchingSkills: ["React", "TypeScript", "Next.js", "REST APIs"],
      missingSkills: ["GraphQL", "Kubernetes"],
      suggestions: [
        { section: "summary", issue: "Too generic", recommendation: "Lead with your React/TS specialization" },
      ],
    },
  });

  await db.application.createMany({
    data: [
      { userId: demoUser.id, company: "Acme Corp", role: "Senior Frontend Engineer", status: "INTERVIEW", analysisId: analysis.id },
      { userId: demoUser.id, company: "Globex", role: "Frontend Lead", status: "APPLIED" },
      { userId: demoUser.id, company: "Initech", role: "Staff Engineer", status: "REJECTED" },
      { userId: demoUser.id, company: "Umbrella Inc", role: "Principal Engineer", status: "OFFER" },
    ],
  });

  console.log("Seed complete. Demo login: demo@resona.dev / demo-password-2026");
}

main().finally(() => db.$disconnect());
```

`package.json` (ajout)

```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  },
  "scripts": {
    "db:seed": "prisma db seed"
  }
}
```

### 3.4 Rotation des clés — checklist avant mise en ligne

> Leçon tirée d'un incident précédent sur PulseAI (Project 01) : des clés API ont été exposées pendant le développement et ont dû être rotées avant toute nouvelle mise en ligne. Appliquer la même discipline ici dès le départ.

- [ ] Régénérer `GROQ_API_KEY` et `HUGGINGFACE_TOKEN` juste avant le déploiement final (ne pas réutiliser les clés de dev)
- [ ] Régénérer les secrets OAuth Google/LinkedIn si le repo a été partagé publiquement à un moment
- [ ] Vérifier qu'aucune clé n'est présente dans l'historique Git (`git log -p | grep -i "sk-"` ou équivalent)
- [ ] Confirmer que `.env` est bien dans `.gitignore` depuis le premier commit
- [ ] Utiliser des clés Stripe **test** tant que le produit n'est pas prêt à facturer réellement, basculer en clés **live** seulement au moment du vrai lancement

### 3.5 Vérification post-déploiement

```bash
curl -X POST https://your-domain.com/api/resumes -H "Cookie: <session>"
```

- [ ] Login Google/LinkedIn fonctionne avec les vraies callback URLs de prod
- [ ] Un upload + analyse réel se termine en production sans erreur
- [ ] Le webhook Stripe reçoit bien les événements (vérifier dans le dashboard Stripe → Developers → Webhooks → logs)
- [ ] Sentry affiche un événement de test envoyé depuis la prod

---

**Definition of Done — Phase 6 :** Résona est accessible sur une URL publique, le compte démo (`demo@resona.dev`) permet de parcourir tout le produit sans friction, aucune clé de dev n'est réutilisée en production, le webhook Stripe et Sentry sont confirmés fonctionnels en conditions réelles.
