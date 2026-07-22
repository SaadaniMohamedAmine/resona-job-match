# Résona — Update: statut réel des features déjà déléguées

> Document de contrôle, pas une nouvelle feature. Écrit après vérification directe du code réel du repo au 2026-07-21 (pages, composants, `package.json`, `schema.prisma`, routes API). Corrige les écarts trouvés entre les 5 docs de délégation précédents et ce qui est vraiment construit ou vraiment manquant.

---

## 1. Référence — le vrai système de design

Les docs `feature-billing-pricing.md`, `feature-brand-assets-implementation.md`, `feature-i18n-complete.md` et `feature-notifications.md` ont été écrits en utilisant des tokens Material Design 3 (`surface-container-low`, `on-primary-container`, etc.) et des icônes Material Symbols — trouvés dans les écrans de référence Stitch, mais **jamais utilisés dans le vrai code implémenté**. Le vrai code (vérifié dans `app/globals.css`, `dashboard/page.tsx`, `app-navbar.tsx`, `upload-form.tsx`, `confirm-dialog.tsx`, `stepper.tsx`, etc.) utilise systématiquement :

| Élément | Valeur réelle |
|---|---|
| `--color-base` | `#16140f` (fond graphite) |
| `--color-base-light` | `#f7f5f2` (texte clair) |
| `--color-accent` | `#c9a961` (champagne) |
| `--color-muted` | `#b8ad98` (texte atténué) |
| `--color-track` | `#2a2620` (bordures, fonds subtils) |
| `--radius-card` | `16px` |
| `--radius-control` | `8px` |
| Police headings | `font-display` (Space Grotesk) |
| Icônes | `@tabler/icons-react` (`IconXxx`, `stroke={1.5}`) — **pas** Material Symbols |

Classes utilitaires réelles récurrentes : `text-base-light`, `text-muted`, `text-accent`, `border-track`, `bg-track`, `bg-track/20`, `bg-accent`, `text-[var(--color-base)]` (texte sur fond accent), `rounded-(--radius-control)`, `rounded-(--radius-card)`.

**Les 6 nouveaux docs de cette session** (`feature-demo-anonymous.md`, `feature-command-palette.md`, `feature-built-with.md`, `feature-embeddings-visualization.md`, `feature-score-progression.md`, `feature-mini-onboarding.md`) utilisent déjà ce vrai système — aucune action requise dessus.

## 2. Statut réel par feature déjà déléguée

| Doc | Statut réel constaté | Action |
|---|---|---|
| `feature-application-tracker.md` | Confirmé implémenté par toi. Composants réels (`tracker-board.tsx`, `tracker-column.tsx`, `application-card.tsx`, `add-application-modal.tsx`) présents et utilisent bien le vrai système de tokens/Tabler. | Aucune — cohérent. |
| `feature-billing-pricing.md` | **Déjà construit, différemment.** `/pricing`, `/settings/billing`, le gating Pro sur `/api/rewrite` ET `/api/cover-letter` (403 si `plan !== "PRO"`), `AnalysisQuotaBadge`, et l'état "quota atteint" sur `upload-form.tsx` existent tous déjà en code réel, fonctionnels. | Ne pas rebuild. Voir §3 pour les vrais gaps restants. |
| `feature-brand-assets-implementation.md` | **Pas encore construit.** `public/favicon*` n'existe pas. Un loader existe déjà (`SiteLoader`) mais visuellement différent de ce qui était spécifié (progress bar + "RE" monogram, pas l'anneau tournant décrit). Un `skeleton.tsx` de base existe. | Le contenu (icônes, manifest, OG image) reste à faire — **mais le doc original utilise les mauvais tokens/icônes**. Voir §4. |
| `feature-i18n-complete.md` | **Infrastructure déjà construite, catalogue partiel.** `LanguageSwitcher` (simple `<select>`, pas de flags) et le routing par locale (`i18n/request.ts`) fonctionnent déjà. `messages/en.json`/`fr.json` existent mais ne couvrent que 6 namespaces (`landing`, `upload`, `results`, `empty`, `nav`, `userMenu`) — pricing, billing, settings, tracker, auth, erreurs ne sont pas traduits. | Ne pas reconstruire le routing. Compléter le catalogue. Voir §5. |
| `feature-notifications.md` | **Pas encore construit.** Aucune occurrence de `react-toastify` dans le code (hors le doc lui-même). | Le doc reste valide dans son ensemble, **mais utilise les mauvais tokens/icônes**. Voir §4. |

## 3. Gaps réels restants — Billing & Pricing

Ce qui manque vraiment, une fois qu'on retire tout ce qui existe déjà :

- La page `/pricing` réelle (`app/[locale]/(marketing)/pricing/page.tsx`) affiche toujours "Upgrade to Pro" même pour un utilisateur déjà Pro — elle ne lit pas `session.user.plan`. Correction :

```tsx
// pricing/page.tsx devient un composant serveur qui lit le plan, puis passe currentPlan à un sous-composant client
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { PricingCards } from "./pricing-cards"; // extrait la logique client existante

export default async function PricingPage() {
  const session = await auth();
  const user = session?.user?.id
    ? await db.user.findUnique({ where: { id: session.user.id }, select: { plan: true } })
    : null;
  return <PricingCards currentPlan={user?.plan ?? null} />;
}
```

Dans `PricingCards` (le composant client actuel, renommé), le bouton Pro devient désactivé + "Current plan" si `currentPlan === "PRO"`, et un bouton "Manage subscription" (vers `/api/stripe/portal`) apparaît à la place.

- Les pages `/pricing` et `/settings/billing` ont leurs strings en dur (anglais), pas branchées sur `next-intl` — ça rejoint le gap i18n du §5, à traiter ensemble.

## 4. Correction transversale — tokens & icônes

Pour `feature-brand-assets-implementation.md` et `feature-notifications.md` (ni l'un ni l'autre n'est encore construit, donc aucun code à défaire — juste à corriger avant que le code soit écrit) :

- Remplacer toute classe `surface-container-*`, `on-surface`, `on-primary-container`, etc. par les classes réelles listées en §1.
- Remplacer `<span className="material-symbols-outlined">nom_icone</span>` par l'import `@tabler/icons-react` équivalent, ex. `check_circle` → `IconCircleCheck`, `error` → `IconAlertCircle`, `info` → `IconInfoCircle`, `workspace_premium` → `IconCrown` ou `IconBolt` (déjà utilisé pour le quota).
- Dans `feature-notifications.md` §3.2, le helper `lib/toast.ts` doit utiliser ces icônes Tabler dans le rendu custom du toast, avec les mêmes couleurs (`text-accent` pour succès, une couleur d'erreur à définir — le repo n'a pas encore de token d'erreur dédié, `text-accent` peut servir de repli ou en ajouter un `--color-error` dans `globals.css`).
- Le loader global spécifié dans `feature-brand-assets-implementation.md` §3.4 (`GlobalLoader`, anneau fin qui tourne) peut être conservé tel quel comme loader **de section** (`app/[locale]/(app)/loading.tsx`), en le distinguant du `SiteLoader` existant qui gère le tout premier chargement de page. Les deux ne sont pas redondants : `SiteLoader` = premier chargement global, `GlobalLoader` = transitions de route internes.
- Les skeletons (§3.5 du même doc) restent valides tels quels — vérifier juste que `#37342F` correspond bien à une valeur proche de `--color-track` (`#2a2620`) du vrai thème, sinon ajuster à `bg-track` directement plutôt qu'une couleur en dur.

## 5. Gaps réels restants — i18n

Le routing et le switcher existent — le vrai travail restant est de compléter le catalogue de traductions. Namespaces à ajouter dans `messages/en.json` et `messages/fr.json` (en plus des 6 déjà présents) :

- `auth` (sign-up, login, erreurs de formulaire)
- `pricing` (plans, features, CTA)
- `billing` (plan actuel, renouvellement, gestion d'abonnement)
- `settings` (account, notifications, billing tabs)
- `tracker` (colonnes kanban, modales)
- `notifications` (catalogue de `feature-notifications.md` §3.3 — déjà écrit, prêt à être inséré une fois le namespace créé)
- `errors` (messages génériques 401/403/429/500)

Une fois ces namespaces ajoutés, brancher `pricing/page.tsx`, `settings/billing/page.tsx` et `sign-up/page.tsx` sur `useTranslations()` au lieu des strings en dur actuelles — ferme le gap du §3 en même temps.

**Optionnel, pas un gap fonctionnel** : remplacer le `<select>` texte du `LanguageSwitcher` actuel par un dropdown avec drapeaux (`flag-icons`), comme prévu dans le doc original — pure amélioration visuelle, l'i18n fonctionne déjà sans ça.

---

**Definition of Done :** aucun nouveau code n'est écrit deux fois pour billing/pricing ou pour le routing i18n. Le catalogue de traductions couvre toutes les pages utilisateur. Les docs `brand-assets-implementation` et `notifications`, une fois implémentés, utilisent les mêmes tokens/icônes que le reste de l'app — zéro classe CSS qui n'existe pas dans `globals.css`.
