# Résona — Feature: Application Tracker

> Document de délégation. Spec, tasks, code complet. Remplace/complète la version générique du Phase 3 (`project-04-resona-phase-3-frontend-parcours.md` §3.9) — celle-ci est calquée exactement sur le HTML réellement généré par Stitch (`resona_premium_career_design/r_sona_application_tracker/code.html` et `..._empty/code.html`), pas une reconstruction approximative.

---

## 1. Spec (rappel)

Kanban à 4 colonnes fixes — **Applied → Interview → Offer → Rejected**. Chaque carte : entreprise, poste, date, badge de score de matching (si liée à une analyse). Ajout manuel via un formulaire, changement de statut par glisser-déposer. Alimente les stats du Dashboard (candidatures envoyées, taux de réponse).

**⚠️ Incohérence détectée à corriger avant d'implémenter :** le HTML généré par Stitch pour cet écran utilise la police d'icônes **Material Symbols Outlined** (`<span class="material-symbols-outlined">`), pas Tabler comme spécifié dans le Phase 1 (`@tabler/icons-react`). Décision à prendre : soit remplacer Material Symbols par l'équivalent Tabler ici pour rester cohérent avec le reste du design system tel que spécifié, soit basculer TOUT le projet sur Material Symbols pour rester fidèle à ce que Stitch a réellement produit. Le code ci-dessous utilise Material Symbols (fidèle à l'écran généré) — à toi de trancher si un remplacement global est nécessaire.

## 2. Tasks

- [ ] Installer `@dnd-kit/core` + `@dnd-kit/utilities`
- [ ] Endpoint `GET/POST/PATCH/DELETE /api/applications` (déjà écrit en Phase 2 — vérifier qu'il est bien implémenté)
- [ ] Hook `useApplications` (fetch + mutation optimiste)
- [ ] Composant `TrackerBoard` (4 colonnes, drag-and-drop)
- [ ] Composant `ApplicationCard` (fidèle au HTML généré)
- [ ] Composant `AddApplicationModal` (n'existe pas encore dans le design Stitch — à construire, spec ci-dessous)
- [ ] Composant `TrackerEmptyState` (fidèle au HTML généré)
- [ ] Brancher le changement de statut par drag-and-drop sur `PATCH /api/applications/{id}`
- [ ] Vérifier que les stats Dashboard se recalculent après un changement de statut

## 3. Code complet

### 3.1 Dépendances

```bash
npm install @dnd-kit/core @dnd-kit/utilities
```

### 3.2 Hook de données

`lib/hooks/use-applications.ts`

```ts
"use client";

import { useEffect, useState, useCallback } from "react";

export type Application = {
  id: string;
  company: string;
  role: string;
  status: "APPLIED" | "INTERVIEW" | "OFFER" | "REJECTED";
  appliedAt: string;
  analysis: { id: string; matchScore: number } | null;
};

export function useApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    const res = await fetch("/api/applications");
    const data = await res.json();
    setApplications(data.applications);
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  async function updateStatus(id: string, status: Application["status"]) {
    // Optimistic update — the board must feel instant, not wait on the network
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));

    const res = await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      // Roll back on failure
      await refetch();
    }
  }

  async function addApplication(input: { company: string; role: string; analysisId?: string }) {
    const res = await fetch("/api/applications", { method: "POST", body: JSON.stringify(input) });
    const data = await res.json();
    setApplications((prev) => [{ ...data.application, analysis: null }, ...prev]);
  }

  return { applications, loading, updateStatus, addApplication, refetch };
}
```

### 3.3 Carte — fidèle au HTML généré

`components/tracker/application-card.tsx`

```tsx
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { Application } from "@/lib/hooks/use-applications";

export function ApplicationCard({ application }: { application: Application }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: application.id,
  });

  const style = transform
    ? { transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.5 : 1 }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="application-card bg-surface-container-low border border-outline-variant rounded-xl p-5 flex flex-col gap-4 group cursor-grab active:cursor-grabbing"
    >
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">{application.company}</h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant">{application.role}</p>
        </div>
        <div className="flex items-center justify-center h-8 w-8 rounded-full border border-outline-variant text-primary-container">
          <span className="material-symbols-outlined text-[16px]">business</span>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <span className="font-label-md text-label-md text-on-surface-variant">
          {new Date(application.appliedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
        {application.analysis && (
          <div className="flex items-center gap-1 bg-surface-container-highest border border-outline-variant rounded-lg px-2 py-1">
            <span className="material-symbols-outlined text-[14px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              bolt
            </span>
            <span className="font-label-md text-label-md text-primary">{application.analysis.matchScore}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
```

> Note sur l'icône `business` dans le cercle : le HTML généré utilise des icônes différentes et apparemment arbitraires par carte (`monitoring`, `developer_mode`...) — probablement une décoration générée sans vraie signification. Ici, l'icône est fixée à `business` (neutre, cohérente) plutôt que randomisée, pour éviter un signal visuel qui ne veut rien dire. À remplacer par le vrai logo de l'entreprise si on ajoute cette donnée plus tard.

### 3.4 Colonne — droppable

`components/tracker/tracker-column.tsx`

```tsx
import { useDroppable } from "@dnd-kit/core";
import { ApplicationCard } from "./application-card";
import type { Application } from "@/lib/hooks/use-applications";

const COLUMN_LABELS: Record<Application["status"], string> = {
  APPLIED: "Applied",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  REJECTED: "Rejected",
};

export function TrackerColumn({
  status,
  applications,
}: {
  status: Application["status"];
  applications: Application[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="flex flex-col gap-4 kanban-column" ref={setNodeRef}>
      <div className="flex items-center justify-between px-2 pb-2 border-b border-outline-variant">
        <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">
          {COLUMN_LABELS[status]}
        </span>
        <span className="bg-surface-container text-on-surface-variant px-2 py-0.5 rounded text-[10px] border border-outline-variant">
          {applications.length}
        </span>
      </div>
      <div
        className={`flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-1 min-h-[80px] rounded-lg transition-colors ${
          isOver ? "bg-surface-container-low/50" : ""
        }`}
      >
        {applications.map((app) => (
          <ApplicationCard key={app.id} application={app} />
        ))}
      </div>
    </div>
  );
}
```

### 3.5 Board — orchestration du drag-and-drop

`components/tracker/tracker-board.tsx`

```tsx
"use client";

import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { useState } from "react";
import { useApplications, type Application } from "@/lib/hooks/use-applications";
import { TrackerColumn } from "./tracker-column";
import { TrackerEmptyState } from "./tracker-empty-state";
import { AddApplicationModal } from "./add-application-modal";

const STATUSES: Application["status"][] = ["APPLIED", "INTERVIEW", "OFFER", "REJECTED"];

export function TrackerBoard() {
  const { applications, loading, updateStatus, addApplication } = useApplications();
  const [modalOpen, setModalOpen] = useState(false);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const newStatus = over.id as Application["status"];
    const application = applications.find((a) => a.id === active.id);
    if (application && application.status !== newStatus) {
      updateStatus(application.id, newStatus);
    }
  }

  if (loading) return null; // Skeleton handled by the page's Suspense boundary

  if (applications.length === 0) {
    return <TrackerEmptyState onAdd={() => setModalOpen(true)} onSubmit={addApplication} open={modalOpen} setOpen={setModalOpen} />;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="mb-8 flex justify-end">
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-primary-container text-on-primary-container px-6 py-3 rounded-lg font-label-md text-label-md hover:bg-opacity-90 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add application
        </button>
      </div>

      <DndContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 gap-6 items-start md:grid-cols-4">
          {STATUSES.map((status) => (
            <TrackerColumn
              key={status}
              status={status}
              applications={applications.filter((a) => a.status === status)}
            />
          ))}
        </div>
      </DndContext>

      <AddApplicationModal open={modalOpen} setOpen={setModalOpen} onSubmit={addApplication} />
    </div>
  );
}
```

### 3.6 État vide — fidèle au HTML généré

`components/tracker/tracker-empty-state.tsx`

```tsx
import { AddApplicationModal } from "./add-application-modal";
import type { Application } from "@/lib/hooks/use-applications";

export function TrackerEmptyState({
  onAdd,
  onSubmit,
  open,
  setOpen,
}: {
  onAdd: () => void;
  onSubmit: (input: { company: string; role: string; analysisId?: string }) => Promise<void>;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  return (
    <main className="flex flex-grow items-center justify-center px-4 py-24 md:px-16">
      <div className="w-full max-w-xl space-y-8 text-center">
        <div className="mb-12 flex justify-center">
          <svg className="opacity-80" height="120" viewBox="0 0 120 120" width="120">
            <path className="thin-outline" d="M60 10 L103.3 35 L103.3 85 L60 110 L16.7 85 L16.7 35 Z" />
            <path className="thin-outline" d="M60 10 L60 110" />
            <path className="thin-outline" d="M16.7 35 L103.3 85" />
            <path className="thin-outline" d="M103.3 35 L16.7 85" />
            <circle className="animate-pulse" cx="60" cy="60" fill="var(--champagne-gold)" r="4" />
          </svg>
        </div>
        <div className="space-y-4">
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Nothing tracked yet</h1>
          <p className="mx-auto max-w-sm font-body-md text-body-md text-on-surface-variant">
            Add your first application to organize your career journey. Résona will provide real-time analysis and
            optimization insights.
          </p>
        </div>
        <div className="pt-8">
          <button
            onClick={onAdd}
            className="btn-primary-overlay relative rounded-none border border-primary-container bg-primary-container px-12 py-4 font-label-md text-label-md uppercase tracking-widest text-on-primary-container transition-all duration-300 hover:bg-transparent hover:text-primary"
          >
            Add your first application
          </button>
        </div>
      </div>
      <AddApplicationModal open={open} setOpen={setOpen} onSubmit={onSubmit} />
    </main>
  );
}
```

> `--champagne-gold` doit être déclaré comme variable CSS globale (`#C9A961`) si ce n'est pas déjà fait — vérifier `app/globals.css` du Phase 1.

### 3.7 Modale "Add application" — n'existe pas dans le design Stitch, spec + code ci-dessous

Aucun des 17 écrans générés ne couvre ce formulaire. Design cohérent avec le reste (modale sombre, mêmes tokens) :

`components/tracker/add-application-modal.tsx`

```tsx
"use client";

import { useEffect, useState } from "react";

type AnalysisOption = { id: string; jobTitle: string; matchScore: number };

export function AddApplicationModal({
  open,
  setOpen,
  onSubmit,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSubmit: (input: { company: string; role: string; analysisId?: string }) => Promise<void>;
}) {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [analysisId, setAnalysisId] = useState("");
  const [analyses, setAnalyses] = useState<AnalysisOption[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    fetch("/api/resumes")
      .then((res) => res.json())
      .then((data) =>
        setAnalyses(data.analyses.map((a: any) => ({ id: a.id, jobTitle: a.jobPost.title, matchScore: a.matchScore })))
      );
  }, [open]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit({ company, role, analysisId: analysisId || undefined });
    setSubmitting(false);
    setCompany("");
    setRole("");
    setAnalysisId("");
    setOpen(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-xl border border-outline-variant bg-surface-container-low p-8">
        <h2 className="mb-6 font-headline-sm text-headline-sm text-on-surface">Add application</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            placeholder="Company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
            className="rounded-lg border border-outline-variant bg-transparent px-4 py-2.5 text-sm text-on-surface"
          />
          <input
            placeholder="Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
            className="rounded-lg border border-outline-variant bg-transparent px-4 py-2.5 text-sm text-on-surface"
          />
          {analyses.length > 0 && (
            <select
              value={analysisId}
              onChange={(e) => setAnalysisId(e.target.value)}
              className="rounded-lg border border-outline-variant bg-transparent px-4 py-2.5 text-sm text-on-surface"
            >
              <option value="">Not linked to an analysis</option>
              {analyses.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.jobTitle} — {a.matchScore}%
                </option>
              ))}
            </select>
          )}
          <div className="mt-2 flex justify-end gap-3">
            <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-on-surface-variant">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-primary-container px-6 py-2.5 text-sm font-medium text-on-primary-container disabled:opacity-40"
            >
              {submitting ? "Adding…" : "Add application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

### 3.8 Page

`app/[locale]/(app)/tracker/page.tsx`

```tsx
import { TrackerBoard } from "@/components/tracker/tracker-board";

export default function TrackerPage() {
  return <TrackerBoard />;
}
```

---

**Definition of Done :** glisser une carte d'une colonne à l'autre met à jour son statut immédiatement (optimiste) et persiste après un refresh. "Add application" fonctionne avec et sans analyse liée. L'état vide s'affiche uniquement à zéro candidature, jamais après. Les stats du Dashboard reflètent le nouveau statut sans action supplémentaire de l'utilisateur.
