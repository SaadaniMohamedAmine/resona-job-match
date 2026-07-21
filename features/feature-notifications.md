# Résona — Feature: Système de notifications (react-toastify)

> Document de délégation. Spec, tasks, code complet. Couvre tous les points de l'UX où l'utilisateur a besoin d'une confirmation, d'une erreur, ou d'un statut asynchrone. Les strings ci-dessous doivent passer par `next-intl` (namespace `notifications`, à ajouter au catalogue de `feature-i18n-complete.md`) — reproduites ici en clair pour la lisibilité du tableau.

---

## 1. Spec

**Principe de répartition (à ne pas confondre) :** un toast confirme une action déjà effectuée en arrière-plan (silencieuse sinon) ou signale une erreur qui n'empêche pas de continuer à utiliser la page. Un état bloquant qui change la mise en page (ex: quota atteint sur Upload, empty states) reste un composant inline, pas un toast — ne jamais dupliquer le même message dans les deux formats à la fois.

**Ton** : cohérent avec la voix "reassuring expert" du reste du produit — factuel, court, jamais d'exclamation, jamais "Oops!" ou "Success! 🎉".

**Position et style** : coin haut-droit, fond `surface-container-low`, bordure `outline-variant`, texte `on-surface`, icône colorée selon le type (succès = `primary`/champagne, erreur = `error`), durée 4s sauf erreurs (6s).

## 2. Tasks

- [ ] Installer `react-toastify`
- [ ] Ajouter `<ToastContainer />` stylé au layout racine
- [ ] Créer le helper `lib/toast.ts`
- [ ] Ajouter le namespace `notifications` aux fichiers de traduction
- [ ] Brancher chaque déclencheur listé dans le catalogue (§3.3)

## 3. Code complet

### 3.1 Setup

```bash
npm install react-toastify
```

`app/[locale]/layout.tsx` (ajout)

```tsx
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// dans le JSX, juste avant la fermeture de </body>
<ToastContainer
  position="top-right"
  autoClose={4000}
  hideProgressBar
  closeOnClick
  theme="dark"
  toastClassName="!bg-surface-container-low !border !border-outline-variant !rounded-lg !font-body-sm"
/>
```

### 3.2 Helper de toast stylé

`lib/toast.ts`

```ts
import { toast } from "react-toastify";

const baseStyle = { color: "#E8E2D9" }; // on-surface

export const notify = {
  success: (message: string) =>
    toast.success(message, { icon: () => <span className="material-symbols-outlined text-primary">check_circle</span>, style: baseStyle }),

  error: (message: string) =>
    toast.error(message, { icon: () => <span className="material-symbols-outlined text-error">error</span>, autoClose: 6000, style: baseStyle }),

  info: (message: string) =>
    toast.info(message, { icon: () => <span className="material-symbols-outlined text-on-surface-variant">info</span>, style: baseStyle }),
};
```

> `toast.success/error/info` acceptent un JSX en premier argument dans react-toastify — l'`icon` custom ci-dessus suffit, pas besoin de composant séparé.

### 3.3 Catalogue complet des notifications

| Déclencheur | Message (EN) | Message (FR) | Type |
|---|---|---|---|
| Inscription réussie | "Account created." | "Compte créé." | success |
| Email déjà utilisé | "This email is already registered." | "Cet email est déjà utilisé." | error |
| Identifiants invalides au login | "Incorrect email or password." | "Email ou mot de passe incorrect." | error |
| Upload : mauvais type de fichier | "Please upload a PDF file." | "Veuillez uploader un fichier PDF." | error |
| Upload : fichier trop lourd | "File must be under 4MB." | "Le fichier doit faire moins de 4 Mo." | error |
| Analyse échouée (erreur serveur/IA) | "We couldn't analyze your resume. Please try again." | "L'analyse a échoué. Veuillez réessayer." | error |
| Réécriture générée | "Rewrite generated." | "Réécriture générée." | success |
| Réécriture appliquée | "Applied to your resume." | "Appliqué à votre CV." | success |
| Réécriture échouée | "Rewrite failed. Please try again." | "La réécriture a échoué. Veuillez réessayer." | error |
| Export PDF du CV réécrit lancé | "Preparing your PDF…" | "Préparation de votre PDF…" | info |
| Export PDF prêt | "Resume downloaded." | "CV téléchargé." | success |
| Lettre de motivation générée | "Cover letter ready." | "Lettre de motivation prête." | success |
| Lettre copiée | "Copied to clipboard." | "Copié dans le presse-papiers." | success |
| Lettre : export PDF prêt | "Cover letter downloaded." | "Lettre de motivation téléchargée." | success |
| Candidature ajoutée | "Application added." | "Candidature ajoutée." | success |
| Statut de candidature changé | "Moved to {status}." | "Déplacée vers {status}." | success |
| Candidature supprimée | "Application removed." | "Candidature supprimée." | info |
| CV supprimé de l'historique | "Resume deleted." | "CV supprimé." | info |
| Profil mis à jour (Settings) | "Profile updated." | "Profil mis à jour." | success |
| Retour de Stripe Checkout réussi | "You're now on Pro. Unlimited analyses unlocked." | "Vous êtes maintenant sur l'offre Pro. Analyses illimitées débloquées." | success |
| Retour de Stripe Checkout annulé | "Upgrade canceled — no charge was made." | "Mise à niveau annulée — aucun paiement effectué." | info |
| Abonnement annulé (retour du portail Stripe) | "Your subscription has been canceled." | "Votre abonnement a été annulé." | info |
| Erreur réseau générique | "Connection issue. Please check your network." | "Problème de connexion. Vérifiez votre réseau." | error |
| Erreur serveur générique (fallback) | "Something went wrong. Please try again." | "Une erreur est survenue. Veuillez réessayer." | error |

### 3.4 Points d'intégration — code

**Sign up** (`app/[locale]/(auth)/sign-up/page.tsx`, Phase 3) :

```ts
const res = await fetch("/api/register", { method: "POST", body: JSON.stringify({ email, password }) });
if (res.status === 409) {
  notify.error(t("notifications.emailInUse"));
  return;
}
if (!res.ok) {
  notify.error(t("notifications.generic"));
  return;
}
notify.success(t("notifications.accountCreated"));
await signIn("credentials", { email, password, callbackUrl: "/upload" });
```

**Upload — erreurs de fichier** (`app/[locale]/(app)/upload/page.tsx`) :

```ts
function handleFileChange(file: File | null) {
  if (file && file.type !== "application/pdf") {
    notify.error(t("notifications.wrongFileType"));
    return;
  }
  if (file && file.size > 4 * 1024 * 1024) {
    notify.error(t("notifications.fileTooLarge"));
    return;
  }
  setFile(file);
}
```

**Rewrite** (`app/[locale]/(app)/results/[analysisId]/rewrite/page.tsx`, Phase 3) :

```ts
async function handleGenerate() {
  setLoading(true);
  const res = await fetch("/api/rewrite", { method: "POST", body: JSON.stringify({ analysisId, section: activeSection, originalText: original }) });
  if (!res.ok) {
    notify.error(t("notifications.rewriteFailed"));
    setLoading(false);
    return;
  }
  const data = await res.json();
  setRewritten(data.rewritten);
  notify.success(t("notifications.rewriteGenerated"));
  setLoading(false);
}

function handleApply() {
  // persist accepted rewrite (see feature-billing-pricing.md context — same pattern)
  notify.success(t("notifications.rewriteApplied"));
}
```

**Cover letter modal** (`components/cover-letter-modal.tsx`, Phase 3) :

```ts
function handleCopy() {
  navigator.clipboard.writeText(letter);
  notify.success(t("notifications.copiedToClipboard"));
}
```

**Tracker** (`components/tracker/tracker-board.tsx` et `use-applications.ts`, feature Application Tracker) :

```ts
async function updateStatus(id: string, status: Application["status"]) {
  setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  const res = await fetch(`/api/applications/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
  if (!res.ok) {
    await refetch();
    notify.error(t("notifications.generic"));
    return;
  }
  notify.success(t("notifications.statusChanged", { status: t(`tracker.column${status}`) }));
}

async function addApplication(input: { company: string; role: string; analysisId?: string }) {
  const res = await fetch("/api/applications", { method: "POST", body: JSON.stringify(input) });
  if (!res.ok) {
    notify.error(t("notifications.generic"));
    return;
  }
  const data = await res.json();
  setApplications((prev) => [{ ...data.application, analysis: null }, ...prev]);
  notify.success(t("notifications.applicationAdded"));
}
```

**Settings — Account** (`app/[locale]/(app)/settings/account/page.tsx`, Phase 3) :

```ts
async function handleSave() {
  const res = await fetch("/api/user/profile", { method: "PATCH", body: JSON.stringify({ name }) });
  if (!res.ok) {
    notify.error(t("notifications.generic"));
    return;
  }
  notify.success(t("notifications.profileUpdated"));
}
```

**Retour Stripe Checkout** (`app/[locale]/(app)/settings/billing/page.tsx`, feature Billing — doit devenir un Client Component ou avoir un petit wrapper client pour lire les query params) :

```tsx
"use client";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { notify } from "@/lib/toast";
import { useTranslations } from "next-intl";

function BillingReturnNotice() {
  const params = useSearchParams();
  const t = useTranslations("notifications");

  useEffect(() => {
    if (params.get("success") === "true") notify.success(t("upgradeSuccess"));
    if (params.get("canceled") === "true") notify.info(t("upgradeCanceled"));
  }, [params]);

  return null;
}
```

Monter `<BillingReturnNotice />` en haut de la page Settings → Billing.

---

**Definition of Done :** chaque ligne du catalogue (§3.3) a un déclencheur réel câblé dans le code, pas seulement documenté. Aucun toast ne duplique un message déjà affiché en inline (vérifier particulièrement Upload/quota). Toutes les strings de notification passent par `next-intl`, aucune en dur.
