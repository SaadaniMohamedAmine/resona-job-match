# Résona — Phase 3 : Frontend & Parcours produit

> Document de délégation. Spec, tasks, code complet de toutes les pages. Dépend des Phases 1 (composants, auth, i18n) et 2 (endpoints API).

---

## 1. Spec

**Objectif :** toutes les pages utilisateur, connectées aux endpoints réels, avec le design system de la Phase 1 appliqué partout (aucune page hors marque). Toutes les pages existent en `[locale]` (en/fr).

**Dépendances :** Phase 1 + Phase 2 complètes.

**Règles transverses à respecter sur chaque page :**
- Dark mode par défaut, densité généreuse
- Aucune couleur de statut — icônes trait fin uniquement
- États de chargement (`LoaderRing`/`Skeleton`) et d'erreur systématiques sur toute donnée async
- Toutes les strings visibles passent par `next-intl` (`useTranslations`), pas de texte en dur

---

## 2. Tasks

- [ ] Landing page
- [ ] Sign-up / Login
- [ ] Upload & JD page (step 1/3)
- [ ] État Analyzing (step 2/3)
- [ ] Résultats — Overview (step 3/3)
- [ ] Résultats — Rewrite (côte à côte)
- [ ] Modal Lettre de motivation
- [ ] Historique des analyses
- [ ] Application Tracker (kanban)
- [ ] Dashboard
- [ ] Settings — Account
- [ ] Pages Privacy Policy / Terms of Service
- [ ] Empty states (resumes, tracker)
- [ ] Page 404
- [ ] Sélecteur de langue
- [ ] Responsive mobile (upload + résultats overview)

---

## 3. Code complet

### 3.1 Landing page

`app/[locale]/(marketing)/page.tsx`

```tsx
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Wordmark } from "@/components/ui/wordmark";

export default function LandingPage() {
  const t = useTranslations("landing");

  const features = [
    { title: "AI match score", body: "Semantic comparison between your resume and the job description, not just keyword matching." },
    { title: "Gap detection", body: "See exactly which skills are missing before a recruiter does." },
    { title: "Section rewriting", body: "AI-rewritten resume sections, side by side with your original." },
    { title: "Cover letter generation", body: "A ready-to-send cover letter tailored to the role." },
  ];

  return (
    <div className="min-h-screen">
      <nav className="flex items-center justify-between px-8 py-6">
        <Wordmark />
        <div className="flex gap-4 text-sm text-[var(--color-muted)]">
          <Link href="/login">Log in</Link>
          <Link href="/sign-up" className="text-[var(--color-accent)]">Sign up</Link>
        </div>
      </nav>

      <section className="mx-auto max-w-3xl px-8 py-32 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-5xl font-medium text-[var(--color-base-light)]">
          {t("tagline")}
        </h1>
        <p className="mt-6 text-[var(--color-muted)]">
          75% of resumes are rejected by ATS before a human ever reads them.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Link
            href="/upload"
            className="rounded-[var(--radius-control)] bg-[var(--color-accent)] px-6 py-3 text-sm font-medium text-[var(--color-base)]"
          >
            {t("cta_primary")}
          </Link>
          <Link
            href="#how-it-works"
            className="rounded-[var(--radius-control)] border border-[var(--color-track)] px-6 py-3 text-sm text-[var(--color-base-light)]"
          >
            {t("cta_secondary")}
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-8 pb-32 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <div key={f.title} className="rounded-[var(--radius-card)] border border-[var(--color-track)] p-6">
            <h3 className="font-[family-name:var(--font-display)] text-lg font-medium text-[var(--color-base-light)]">
              {f.title}
            </h3>
            <p className="mt-2 text-sm text-[var(--color-muted)]">{f.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
```

### 3.2 Auth — Sign-up / Login

`app/[locale]/(auth)/sign-up/page.tsx`

```tsx
"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Wordmark } from "@/components/ui/wordmark";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    await signIn("credentials", { email, password, callbackUrl: "/upload" });
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-[var(--radius-card)] border border-[var(--color-track)] p-8">
        <div className="mb-8 flex justify-center">
          <Wordmark />
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-[var(--radius-control)] border border-[var(--color-track)] bg-transparent px-4 py-2.5 text-sm text-[var(--color-base-light)]"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-[var(--radius-control)] border border-[var(--color-track)] bg-transparent px-4 py-2.5 text-sm text-[var(--color-base-light)]"
            required
            minLength={8}
          />
          <button
            type="submit"
            className="rounded-[var(--radius-control)] bg-[var(--color-accent)] py-2.5 text-sm font-medium text-[var(--color-base)]"
          >
            Create account
          </button>
        </form>
        <div className="mt-4 flex flex-col gap-2">
          <button
            onClick={() => signIn("google", { callbackUrl: "/upload" })}
            className="rounded-[var(--radius-control)] border border-[var(--color-track)] py-2.5 text-sm text-[var(--color-base-light)]"
          >
            Continue with Google
          </button>
          <button
            onClick={() => signIn("linkedin", { callbackUrl: "/upload" })}
            className="rounded-[var(--radius-control)] border border-[var(--color-track)] py-2.5 text-sm text-[var(--color-base-light)]"
          >
            Continue with LinkedIn
          </button>
        </div>
      </div>
    </div>
  );
}
```

`app/[locale]/(auth)/login/page.tsx` — même structure, `signIn("credentials", …)` sans étape de création de compte, lien "Forgot password?" en plus. Réutiliser exactement le même JSX que `sign-up/page.tsx` en retirant le champ de confirmation (il n'y en a pas ici) et en changeant le libellé du bouton en "Log in" et le titre implicite de la carte.

`app/api/register/route.ts`

```ts
import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/api-handler";

const schema = z.object({ email: z.string().email(), password: z.string().min(8) });

export const POST = withErrorHandling(async (req: Request) => {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const existing = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return NextResponse.json({ error: "Email already in use" }, { status: 409 });

  const hashed = await bcrypt.hash(parsed.data.password, 10);
  const user = await db.user.create({ data: { email: parsed.data.email, password: hashed } });

  return NextResponse.json({ id: user.id });
});
```

### 3.3 Upload & JD page (step 1/3)

`app/[locale]/(app)/upload/page.tsx`

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUploadThing } from "@/lib/uploadthing-client";
import { useTranslations } from "next-intl";
import { Stepper } from "@/components/ui/stepper";
import { LoaderRing } from "@/components/ui/loader-ring";

export default function UploadPage() {
  const t = useTranslations("upload");
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { startUpload } = useUploadThing("resumeUploader");

  async function handleAnalyze() {
    if (!file || !jobDescription) return;
    setSubmitting(true);

    const uploaded = await startUpload([file]);
    const fileUrl = uploaded?.[0]?.url;
    if (!fileUrl) {
      setSubmitting(false);
      return;
    }

    const res = await fetch("/api/analyze", {
      method: "POST",
      body: JSON.stringify({ fileUrl, fileName: file.name, jobTitle, company, jobDescription }),
    });
    const data = await res.json();
    router.push(`/results/${data.analysisId}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <Stepper steps={["Upload", "Analyze", "Results"]} currentStep={0} />

      <div className="mt-12 flex flex-col gap-8">
        <label
          htmlFor="resume-upload"
          className="flex cursor-pointer flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-[var(--color-track)] px-6 py-12 text-center text-sm text-[var(--color-muted)]"
        >
          {file ? file.name : t("dropzone_label")}
          <input
            id="resume-upload"
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>

        <input
          placeholder="Job title"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          className="rounded-[var(--radius-control)] border border-[var(--color-track)] bg-transparent px-4 py-2.5 text-sm"
        />
        <input
          placeholder="Company (optional)"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="rounded-[var(--radius-control)] border border-[var(--color-track)] bg-transparent px-4 py-2.5 text-sm"
        />
        <textarea
          placeholder={t("jd_label")}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          rows={10}
          className="rounded-[var(--radius-control)] border border-[var(--color-track)] bg-transparent px-4 py-2.5 text-sm"
        />

        <button
          disabled={!file || !jobDescription || submitting}
          onClick={handleAnalyze}
          className="flex items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-accent)] py-3 text-sm font-medium text-[var(--color-base)] disabled:opacity-40"
        >
          {submitting ? <LoaderRing size={16} /> : t("cta")}
        </button>
      </div>
    </div>
  );
}
```

`lib/uploadthing-client.ts`

```ts
import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "@/lib/uploadthing";

export const { useUploadThing } = generateReactHelpers<OurFileRouter>();
```

> Note d'implémentation : la version ci-dessus lance `/api/analyze` immédiatement après l'upload, ce qui inclut le temps GPT-4o dans le clic utilisateur. Pour un vrai state "Analyzing" (step 2/3) séparé visuellement, `router.push("/analyzing?...")` immédiatement après l'upload, lancer l'appel `/api/analyze` depuis la page `/analyzing` (voir 3.4), puis rediriger vers `/results/[id]` une fois la réponse reçue. C'est ce comportement qui est décrit ci-dessous.

### 3.4 État Analyzing (step 2/3)

`app/[locale]/(app)/analyzing/page.tsx`

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Stepper } from "@/components/ui/stepper";
import { LoaderRing } from "@/components/ui/loader-ring";

const STEPS = [
  "Extracting your resume",
  "Comparing with the job description",
  "Calculating your match score",
  "Preparing suggestions",
];

export default function AnalyzingPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((s) => Math.min(s + 1, STEPS.length - 1));
    }, 1200);

    async function run() {
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(params.entries())),
      });
      const data = await res.json();
      clearInterval(interval);
      router.replace(`/results/${data.analysisId}`);
    }
    run();

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <Stepper steps={["Upload", "Analyze", "Results"]} currentStep={1} />
      <div className="mt-16">
        <LoaderRing size={64} />
      </div>
      <ul className="mt-10 flex flex-col gap-3 text-left">
        {STEPS.map((step, i) => (
          <li
            key={step}
            className={`text-sm ${i <= activeStep ? "text-[var(--color-base-light)]" : "text-[var(--color-muted)]"}`}
          >
            {i < activeStep ? "✓ " : ""}
            {step}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 3.5 Résultats — Overview (step 3/3)

`app/[locale]/(app)/results/[analysisId]/page.tsx`

```tsx
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { ScoreRing } from "@/components/ui/score-ring";
import { SkillTag } from "@/components/ui/skill-tag";
import { Stepper } from "@/components/ui/stepper";
import Link from "next/link";

export default async function ResultsPage({ params }: { params: { analysisId: string } }) {
  const session = await auth();
  const analysis = await db.analysis.findUnique({ where: { id: params.analysisId } });
  if (!analysis || analysis.userId !== session?.user?.id) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <Stepper steps={["Upload", "Analyze", "Results"]} currentStep={2} />

      <div className="mt-16 flex flex-col items-center">
        <ScoreRing score={analysis.matchScore} size={160} />

        <div className="mt-12 grid w-full grid-cols-1 gap-8 sm:grid-cols-2">
          <div>
            <h3 className="mb-3 text-sm font-medium text-[var(--color-muted)]">Matching skills</h3>
            <div className="flex flex-wrap gap-2">
              {analysis.matchingSkills.map((skill) => (
                <SkillTag key={skill} label={skill} variant="match" />
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-medium text-[var(--color-muted)]">Missing skills</h3>
            <div className="flex flex-wrap gap-2">
              {analysis.missingSkills.map((skill) => (
                <SkillTag key={skill} label={skill} variant="gap" />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex gap-4">
          <Link
            href={`/results/${analysis.id}/rewrite`}
            className="rounded-[var(--radius-control)] bg-[var(--color-accent)] px-6 py-3 text-sm font-medium text-[var(--color-base)]"
          >
            Rewrite my resume
          </Link>
          <Link
            href={`/results/${analysis.id}/cover-letter`}
            className="rounded-[var(--radius-control)] border border-[var(--color-track)] px-6 py-3 text-sm text-[var(--color-base-light)]"
          >
            Generate cover letter
          </Link>
        </div>
      </div>
    </div>
  );
}
```

### 3.6 Résultats — Rewrite (côte à côte)

`app/[locale]/(app)/results/[analysisId]/rewrite/page.tsx`

```tsx
"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

const SECTIONS = ["summary", "experience", "skills"] as const;
type Section = (typeof SECTIONS)[number];

export default function RewritePage() {
  const { analysisId } = useParams<{ analysisId: string }>();
  const [activeSection, setActiveSection] = useState<Section>("summary");
  const [original, setOriginal] = useState("");
  const [rewritten, setRewritten] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    const res = await fetch("/api/rewrite", {
      method: "POST",
      body: JSON.stringify({ analysisId, section: activeSection, originalText: original }),
    });
    const data = await res.json();
    setRewritten(data.rewritten);
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <div className="mb-8 flex gap-2">
        {SECTIONS.map((section) => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={`rounded-[var(--radius-control)] px-4 py-2 text-sm capitalize ${
              activeSection === section
                ? "bg-[var(--color-accent)] text-[var(--color-base)]"
                : "border border-[var(--color-track)] text-[var(--color-muted)]"
            }`}
          >
            {section}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <h3 className="mb-2 text-sm text-[var(--color-muted)]">Original</h3>
          <textarea
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            rows={12}
            className="w-full rounded-[var(--radius-control)] border border-[var(--color-track)] bg-transparent px-4 py-3 text-sm text-[var(--color-muted)]"
          />
        </div>
        <div>
          <h3 className="mb-2 text-sm text-[var(--color-accent)]">Rewritten</h3>
          <div className="min-h-[288px] rounded-[var(--radius-control)] border border-[var(--color-track)] px-4 py-3 text-sm text-[var(--color-base-light)]">
            {rewritten || "—"}
          </div>
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={!original || loading}
        className="mt-6 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-6 py-3 text-sm font-medium text-[var(--color-base)] disabled:opacity-40"
      >
        {loading ? "Rewriting…" : "Apply this rewrite"}
      </button>
    </div>
  );
}
```

### 3.7 Modal Lettre de motivation

`components/cover-letter-modal.tsx`

```tsx
"use client";

import { useState } from "react";

export function CoverLetterModal({ analysisId, onClose }: { analysisId: string; onClose: () => void }) {
  const [letter, setLetter] = useState("");
  const [loading, setLoading] = useState(true);

  useState(() => {
    fetch("/api/cover-letter", { method: "POST", body: JSON.stringify({ analysisId }) })
      .then((res) => res.json())
      .then((data) => {
        setLetter(data.coverLetter);
        setLoading(false);
      });
  });

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-xl rounded-[var(--radius-card)] border border-[var(--color-track)] bg-[var(--color-base)] p-8">
        <textarea
          value={letter}
          onChange={(e) => setLetter(e.target.value)}
          rows={16}
          className="w-full bg-transparent text-sm leading-relaxed text-[var(--color-base-light)]"
          placeholder={loading ? "Generating…" : ""}
        />
        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={() => navigator.clipboard.writeText(letter)}
            className="rounded-[var(--radius-control)] border border-[var(--color-track)] px-4 py-2 text-sm"
          >
            Copy to clipboard
          </button>
          <button onClick={onClose} className="rounded-[var(--radius-control)] px-4 py-2 text-sm text-[var(--color-muted)]">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 3.8 Historique des analyses

`app/[locale]/(app)/resumes/page.tsx`

```tsx
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { useTranslations } from "next-intl";
import Link from "next/link";

export default async function ResumesPage() {
  const session = await auth();
  const analyses = await db.analysis.findMany({
    where: { userId: session!.user!.id },
    include: { jobPost: true },
    orderBy: { createdAt: "desc" },
  });

  if (analyses.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--color-base-light)]">
          Nothing analyzed yet
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">Upload your first resume to get your match score.</p>
        <Link
          href="/upload"
          className="mt-6 inline-block rounded-[var(--radius-control)] bg-[var(--color-accent)] px-6 py-3 text-sm font-medium text-[var(--color-base)]"
        >
          Upload your first resume
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <div className="flex flex-col gap-3">
        {analyses.map((a) => (
          <Link
            key={a.id}
            href={`/results/${a.id}`}
            className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--color-track)] px-5 py-4"
          >
            <div>
              <p className="text-sm text-[var(--color-base-light)]">{a.jobPost.title}</p>
              <p className="text-xs text-[var(--color-muted)]">{a.createdAt.toLocaleDateString()}</p>
            </div>
            <span className="font-[family-name:var(--font-display)] text-[var(--color-accent)]">{a.matchScore}%</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

### 3.9 Application Tracker (kanban)

`app/[locale]/(app)/tracker/page.tsx`

```tsx
"use client";

import { useEffect, useState } from "react";

type Application = {
  id: string;
  company: string;
  role: string;
  status: "APPLIED" | "INTERVIEW" | "OFFER" | "REJECTED";
};

const COLUMNS: { key: Application["status"]; label: string }[] = [
  { key: "APPLIED", label: "Applied" },
  { key: "INTERVIEW", label: "Interview" },
  { key: "OFFER", label: "Offer" },
  { key: "REJECTED", label: "Rejected" },
];

export default function TrackerPage() {
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    fetch("/api/applications")
      .then((res) => res.json())
      .then((data) => setApplications(data.applications));
  }, []);

  if (applications.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--color-base-light)]">
          Nothing tracked yet
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">Add your first application to start tracking.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="grid grid-cols-4 gap-4">
        {COLUMNS.map((col) => (
          <div key={col.key}>
            <h3 className="mb-3 text-sm font-medium text-[var(--color-muted)]">{col.label}</h3>
            <div className="flex flex-col gap-3">
              {applications
                .filter((a) => a.status === col.key)
                .map((a) => (
                  <div key={a.id} className="rounded-[var(--radius-card)] border border-[var(--color-track)] p-4">
                    <p className="text-sm text-[var(--color-base-light)]">{a.role}</p>
                    <p className="text-xs text-[var(--color-muted)]">{a.company}</p>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

> Drag-and-drop entre colonnes : ajouter `@dnd-kit/core` et brancher `PATCH /api/applications/[id]` (déjà prêt côté backend, Phase 2) sur l'événement `onDragEnd` pour persister le changement de statut.

### 3.10 Dashboard

`app/[locale]/(app)/dashboard/page.tsx`

```tsx
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id;

  const [applicationsCount, analyses, respondedCount] = await Promise.all([
    db.application.count({ where: { userId } }),
    db.analysis.findMany({ where: { userId }, select: { matchScore: true } }),
    db.application.count({ where: { userId, status: { in: ["INTERVIEW", "OFFER"] } } }),
  ]);

  const avgScore = analyses.length
    ? Math.round(analyses.reduce((sum, a) => sum + a.matchScore, 0) / analyses.length)
    : 0;
  const responseRate = applicationsCount ? Math.round((respondedCount / applicationsCount) * 100) : 0;

  const stats = [
    { label: "Applications sent", value: applicationsCount },
    { label: "Response rate", value: `${responseRate}%` },
    { label: "Average match score", value: `${avgScore}%` },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-[var(--radius-card)] border border-[var(--color-track)] p-6">
            <p className="text-xs text-[var(--color-muted)]">{s.label}</p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-2xl text-[var(--color-accent)]">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 3.11 Settings — Account

`app/[locale]/(app)/settings/account/page.tsx`

```tsx
"use client";

import { useSession, signOut } from "next-auth/react";

export default function AccountSettingsPage() {
  const { data: session } = useSession();

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-xs text-[var(--color-muted)]">Name</label>
          <input
            defaultValue={session?.user?.name ?? ""}
            className="mt-1 w-full rounded-[var(--radius-control)] border border-[var(--color-track)] bg-transparent px-4 py-2.5 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-[var(--color-muted)]">Email</label>
          <input
            defaultValue={session?.user?.email ?? ""}
            disabled
            className="mt-1 w-full rounded-[var(--radius-control)] border border-[var(--color-track)] bg-transparent px-4 py-2.5 text-sm opacity-60"
          />
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="mt-4 self-start rounded-[var(--radius-control)] border border-[var(--color-track)] px-4 py-2 text-sm text-[var(--color-base-light)]"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
```

### 3.12 Privacy / Terms

`app/[locale]/(marketing)/privacy/page.tsx` et `app/[locale]/(marketing)/terms/page.tsx` — même structure, contenu à adapter juridiquement avant mise en ligne réelle (placeholder structurel ici, pas un avis juridique) :

```tsx
export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-sm leading-relaxed text-[var(--color-muted)]">
      <h1 className="mb-6 font-[family-name:var(--font-display)] text-2xl text-[var(--color-base-light)]">
        Privacy Policy
      </h1>
      <p>Last updated: [date]. Résona collects your resume content and job description text solely to generate your match analysis. [Complete with data retention, third-party processors (OpenAI, Stripe, UploadThing), and user rights before going live — this is a structural placeholder, not legal advice.]</p>
    </div>
  );
}
```

### 3.13 Page 404

`app/[locale]/not-found.tsx`

```tsx
import Link from "next/link";
import { Wordmark } from "@/components/ui/wordmark";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <Wordmark />
      <p className="text-sm text-[var(--color-muted)]">This page doesn't exist.</p>
      <Link href="/dashboard" className="text-sm text-[var(--color-accent)]">
        Back to dashboard
      </Link>
    </div>
  );
}
```

### 3.14 Sélecteur de langue

`components/language-switcher.tsx`

```tsx
"use client";

import { usePathname, useRouter } from "next/navigation";
import { locales } from "@/i18n";

export function LanguageSwitcher({ currentLocale }: { currentLocale: string }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <select
      value={currentLocale}
      onChange={(e) => {
        const newPath = pathname.replace(`/${currentLocale}`, `/${e.target.value}`);
        router.push(newPath);
      }}
      className="bg-transparent text-xs text-[var(--color-muted)]"
    >
      {locales.map((l) => (
        <option key={l} value={l}>
          {l.toUpperCase()}
        </option>
      ))}
    </select>
  );
}
```

---

**Definition of Done — Phase 3 :** parcours complet cliquable de la landing jusqu'au dashboard sans erreur console, chaque page existe en `/en` et `/fr`, aucune string en dur hors composants de démonstration, responsive vérifié sur upload et results overview à 390px.
