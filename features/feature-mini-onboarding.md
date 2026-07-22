# Résona — Feature: Mini-onboarding (remplace le stepper décoratif)

> Document de délégation. Spec, tasks, code complet. Vérifié contre le vrai code au 2026-07-21. **Corrige un problème identifié précédemment** : le stepper "Identity / Experience" affiché sur `sign-up/page.tsx` est actuellement purement décoratif — commenté `{/* Decorative step indicator */}` dans le code, il n'y a jamais eu de véritable étape 2. Ce doc lui donne un vrai contenu, en réutilisant le composant `Stepper` déjà présent dans le repo (`components/ui/stepper.tsx`) mais jusqu'ici seulement utilisé sur la page de résultats.

---

## 1. Spec

**Objectif** : après la création du compte (étape "Identity"), une étape "Experience" légère et **skippable** demande 2 informations pour personnaliser l'expérience — le rôle ciblé et le stade de recherche actuel. Aucune friction forcée : un lien "Skip for now" mène directement à `/upload`, comme aujourd'hui.

**Pourquoi rester minimal** : sur-demander à l'inscription tue la conversion, surtout pour un produit portfolio où un recruteur veut tester vite. Deux champs, un skip visible, c'est le plafond raisonnable.

**Usage des données** : `targetRole` et `searchStage` sont stockés sur `User` mais ne sont pas exploités dans ce doc au-delà du stockage — un point d'extension naturel plus tard (personnaliser le message d'accueil du dashboard, l'"Expert Insight" des pages settings, etc.), volontairement hors scope ici pour rester livrable.

## 2. Tasks

- [ ] Migration Prisma : `targetRole String?`, `searchStage String?` sur `User`
- [ ] Créer `app/api/user/onboarding/route.ts`
- [ ] Réécrire `app/[locale]/(auth)/sign-up/page.tsx` en flow à 2 étapes avec `Stepper`
- [ ] Vérifier que "Skip for now" et la complétion normale mènent toutes les deux à `/upload`

## 3. Code complet

### 3.1 Migration Prisma

`prisma/schema.prisma` — modification du modèle `User` :

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String?
  bio           String?
  plan          Plan      @default(FREE)
  targetRole    String?
  searchStage   String?

  notifyAnalysisComplete     Boolean @default(true)
  notifyWeeklyDigest         Boolean @default(true)
  notifyApplicationReminders Boolean @default(true)
  notifyProductUpdates       Boolean @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts     Account[]
  sessions     Session[]
  resumes      Resume[]
  analyses     Analysis[]
  applications Application[]
  subscription Subscription?
}
```

```bash
npx prisma migrate dev --name add_onboarding_fields
```

### 3.2 API route

`app/api/user/onboarding/route.ts`

```ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/api-handler";

const bodySchema = z.object({
  targetRole: z.string().min(1).max(100),
  searchStage: z.enum(["starting", "applying", "interviewing"]),
});

export const PATCH = withErrorHandling(async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await db.user.update({
    where: { id: session.user.id },
    data: parsed.data,
  });

  return NextResponse.json({ ok: true });
});
```

### 3.3 Sign-up en 2 étapes

`app/[locale]/(auth)/sign-up/page.tsx` (remplace entièrement le fichier existant) :

```tsx
"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { GoogleIcon, LinkedInIcon } from "@/components/ui/brand-icons";
import { Stepper } from "@/components/ui/stepper";

const SEARCH_STAGES = [
  { value: "starting", label: "Just starting to look" },
  { value: "applying", label: "Actively applying" },
  { value: "interviewing", label: "In interviews" },
];

export default function SignUpPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [searchStage, setSearchStage] = useState("starting");
  const [saving, setSaving] = useState(false);

  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    const res = await fetch("/api/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json();
      setMessage(typeof data.error === "string" ? data.error : "Something went wrong");
      return;
    }
    await signIn("credentials", { email, password, redirect: false });
    setStep(1);
  }

  async function handleFinishOnboarding() {
    setSaving(true);
    if (targetRole.trim()) {
      await fetch("/api/user/onboarding", {
        method: "PATCH",
        body: JSON.stringify({ targetRole: targetRole.trim(), searchStage }),
      });
    }
    router.push("/upload");
  }

  function handleSkip() {
    router.push("/upload");
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-6">
      <div className="w-full max-w-110">
        <div className="overflow-hidden rounded-(--radius-control) border border-track bg-track/20">
          <div className="p-6 md:p-8">
            <div className="mb-6">
              <Stepper steps={["Identity", "Experience"]} currentStep={step} />
            </div>

            {step === 0 && (
              <>
                <h2 className="mb-6 font-display text-xl font-medium text-base-light">
                  Create your profile
                </h2>

                {message && <p className="mb-4 text-center text-sm text-accent">{message}</p>}

                <div className="mb-6 flex flex-col gap-3">
                  <button
                    onClick={() => signIn("google", { callbackUrl: "/upload" })}
                    className="flex items-center justify-center gap-3 rounded-(--radius-control) border border-track py-2.5 text-sm text-base-light transition-all hover:bg-track active:scale-[0.98]"
                  >
                    <GoogleIcon />
                    Continue with Google
                  </button>
                  <button
                    onClick={() => alert("Fonctionnalité disponible dans les prochains mois")}
                    className="flex items-center justify-center gap-3 rounded-(--radius-control) border border-track py-2.5 text-sm text-muted opacity-60 transition-all hover:bg-track active:scale-[0.98]"
                  >
                    <LinkedInIcon />
                    Continue with LinkedIn
                  </button>
                </div>

                <div className="mb-6 flex items-center gap-4">
                  <div className="h-px flex-1 bg-track" />
                  <span className="text-xs tracking-widest text-muted uppercase">or use email</span>
                  <div className="h-px flex-1 bg-track" />
                </div>

                <form onSubmit={handleCreateAccount} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="email" className="text-xs tracking-widest text-muted uppercase">
                      Email address
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="rounded-(--radius-control) border border-track bg-transparent px-4 py-3 text-sm text-base-light placeholder:text-muted focus:border-accent focus:outline-none"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="password" className="text-xs tracking-widest text-muted uppercase">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-(--radius-control) border border-track bg-transparent px-4 py-3 pr-11 text-sm text-base-light placeholder:text-muted focus:border-accent focus:outline-none"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute top-1/2 right-3 -translate-y-1/2 text-muted transition-colors hover:text-base-light"
                      >
                        {showPassword ? <IconEyeOff size={20} stroke={1.5} /> : <IconEye size={20} stroke={1.5} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="mt-4 rounded-(--radius-control) bg-accent py-3.5 text-sm font-bold text-[var(--color-base)] transition-all hover:opacity-90 active:scale-[0.98]"
                  >
                    Create Account
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-muted">
                  By signing up, you agree to our{" "}
                  <Link href="/terms" className="text-accent hover:underline">Terms</Link> and{" "}
                  <Link href="/privacy" className="text-accent hover:underline">Privacy Policy</Link>.
                </p>
              </>
            )}

            {step === 1 && (
              <>
                <h2 className="mb-2 font-display text-xl font-medium text-base-light">
                  One quick thing
                </h2>
                <p className="mb-6 text-sm text-muted">
                  Helps us tailor your dashboard. Takes 10 seconds — or skip it entirely.
                </p>

                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="targetRole" className="text-xs tracking-widest text-muted uppercase">
                      What role are you targeting?
                    </label>
                    <input
                      id="targetRole"
                      placeholder="e.g. Senior Frontend Engineer"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      className="rounded-(--radius-control) border border-track bg-transparent px-4 py-3 text-sm text-base-light placeholder:text-muted focus:border-accent focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs tracking-widest text-muted uppercase">
                      Where are you in your search?
                    </label>
                    <div className="flex flex-col gap-2">
                      {SEARCH_STAGES.map((s) => (
                        <button
                          key={s.value}
                          type="button"
                          onClick={() => setSearchStage(s.value)}
                          className={`rounded-(--radius-control) border px-4 py-2.5 text-left text-sm transition-colors ${
                            searchStage === s.value
                              ? "border-accent text-accent"
                              : "border-track text-muted hover:border-accent/40"
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleFinishOnboarding}
                    disabled={saving}
                    className="mt-2 rounded-(--radius-control) bg-accent py-3.5 text-sm font-bold text-[var(--color-base)] transition-all hover:opacity-90 disabled:opacity-60"
                  >
                    Continue
                  </button>
                  <button
                    onClick={handleSkip}
                    className="text-center text-sm text-muted transition-colors hover:text-accent"
                  >
                    Skip for now
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {step === 0 && (
          <p className="mt-6 text-center text-sm text-muted">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-accent hover:underline">Log in</Link>
          </p>
        )}
      </div>
    </div>
  );
}
```

> Changement de comportement notable : `signIn("credentials", ...)` passe désormais `redirect: false` à l'étape 1 (au lieu de rediriger immédiatement vers `/upload`), pour rester sur la page et afficher l'étape 2. La session est déjà active à ce stade — `handleFinishOnboarding`/`handleSkip` font la navigation finale.

---

**Definition of Done :** après création de compte, l'étape "Experience" du stepper affiche un vrai formulaire (pas un décor). "Continue" sauvegarde `targetRole`/`searchStage` puis redirige vers `/upload`. "Skip for now" redirige immédiatement sans bloquer. Aucun champ de cette étape n'est obligatoire pour accéder au produit.
