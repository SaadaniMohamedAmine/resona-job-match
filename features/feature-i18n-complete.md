# Résona — Feature: Internationalisation complète (FR/EN)

> Document de délégation. Spec, tasks, code complet. Étend le squelette i18n minimal de la Phase 1 (`next-intl`, quelques clés) à une traduction complète de toutes les pages, plus un sélecteur de langue avec drapeaux.

---

## 1. Spec

Chaque string visible de l'app doit passer par `next-intl` — plus aucun texte en dur. Le sélecteur de langue est un dropdown avec drapeau + code langue (🇫🇷 FR / 🇬🇧 EN), accessible depuis la nav sur toutes les pages, connecté et non connecté.

**Choix technique pour les drapeaux :** utiliser la librairie `flag-icons` (SVG, rendu net et cohérent cross-OS) plutôt que des emoji drapeaux — les emoji rendent différemment selon l'OS/navigateur, ce qui casse la précision visuelle du design system.

## 2. Tasks

- [ ] Installer `flag-icons`
- [ ] Étendre `messages/en.json` et `messages/fr.json` avec l'intégralité des clés ci-dessous (toutes les pages)
- [ ] Construire le composant `LanguageDropdown` avec drapeaux
- [ ] L'intégrer dans la nav publique ET la nav authentifiée
- [ ] Auditer chaque page existante pour remplacer tout texte en dur restant par `useTranslations`
- [ ] Vérifier que `generateMetadata` (title/description SEO) est aussi localisé

## 3. Code complet

### 3.1 Dépendance

```bash
npm install flag-icons
```

`app/globals.css` (ajout)

```css
@import "flag-icons/css/flag-icons.min.css";
```

### 3.2 Sélecteur de langue avec drapeaux

`components/language-dropdown.tsx`

```tsx
"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

const LANGUAGES = [
  { code: "en", label: "English", flag: "gb" },
  { code: "fr", label: "Français", flag: "fr" },
];

export function LanguageDropdown({ currentLocale }: { currentLocale: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const current = LANGUAGES.find((l) => l.code === currentLocale) ?? LANGUAGES[0];

  function switchTo(code: string) {
    const newPath = pathname.replace(`/${currentLocale}`, `/${code}`);
    router.push(newPath);
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg border border-outline-variant px-3 py-1.5 font-label-md text-label-md text-on-surface-variant hover:text-primary"
        aria-label="Change language"
        aria-expanded={open}
      >
        <span className={`fi fi-${current.flag}`} style={{ borderRadius: 2 }} />
        {current.code.toUpperCase()}
        <span className="material-symbols-outlined text-[16px]">expand_more</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 overflow-hidden rounded-lg border border-outline-variant bg-surface-container-low shadow-lg">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => switchTo(lang.code)}
              className={`flex w-full items-center gap-3 px-4 py-2.5 text-left font-body-sm text-body-sm hover:bg-surface-container-high ${
                lang.code === currentLocale ? "text-primary" : "text-on-surface"
              }`}
            >
              <span className={`fi fi-${lang.flag}`} style={{ borderRadius: 2 }} />
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

Intégration dans la nav (publique et authentifiée) : `<LanguageDropdown currentLocale={locale} />` à côté du toggle dark/light et avant le menu utilisateur.

### 3.3 Catalogue de traduction complet

`messages/en.json`

```json
{
  "nav": {
    "dashboard": "Dashboard",
    "tracker": "Tracker",
    "history": "History",
    "analyze": "Analyze",
    "settings": "Settings",
    "signIn": "Sign In",
    "signOut": "Sign Out",
    "analyzeCta": "Analyze your resume"
  },
  "landing": {
    "eyebrow": "Precise Minimalism",
    "tagline": "Your resume, aligned to every opportunity.",
    "subtitle": "75% of resumes are rejected by ATS before a human ever reads them.",
    "ctaPrimary": "Analyze your resume",
    "ctaSecondary": "See how it works",
    "featuresTitle": "Core Intelligence",
    "featureScoreTitle": "AI Match Score",
    "featureScoreBody": "Semantic comparison between your resume and the job description, not just keyword matching.",
    "featureGapTitle": "Gap Detection",
    "featureGapBody": "See exactly which skills are missing before a recruiter does.",
    "featureRewriteTitle": "Section Rewriting",
    "featureRewriteBody": "AI-rewritten resume sections, side by side with your original.",
    "featureCoverTitle": "Cover Letter Generation",
    "featureCoverBody": "A ready-to-send cover letter tailored to the role.",
    "processTitle": "The Process",
    "processSubtitle": "Technical alignment in three phases.",
    "trustTitle": "Designed for Experts by Experts."
  },
  "auth": {
    "signUpTitle": "Create your profile",
    "loginTitle": "Welcome back",
    "continueWithGoogle": "Continue with Google",
    "continueWithLinkedIn": "Continue with LinkedIn",
    "orUseEmail": "or use email",
    "emailLabel": "Email Address",
    "passwordLabel": "Password",
    "createAccount": "Create Account",
    "logIn": "Log in",
    "alreadyHaveAccount": "Already have an account?",
    "noAccount": "Don't have an account?",
    "termsNotice": "By signing up, you agree to our {terms} and {privacy}.",
    "terms": "Terms",
    "privacy": "Privacy Policy"
  },
  "upload": {
    "stepUpload": "Upload",
    "stepAnalyze": "Analyze",
    "stepResults": "Results",
    "dropzoneLabel": "Drop your resume here or click to browse",
    "dropzoneHint": "PDF only, up to 4MB",
    "jobTitleLabel": "Job title",
    "companyLabel": "Company (optional)",
    "jdLabel": "Paste the job description",
    "cta": "Analyze",
    "quotaExceededTitle": "You've used all 3 free analyses this month",
    "quotaExceededBody": "Upgrade to Pro for unlimited analyses.",
    "viewPlans": "View plans"
  },
  "analyzing": {
    "stepExtract": "Extracting your resume",
    "stepCompare": "Comparing with the job description",
    "stepScore": "Calculating your match score",
    "stepSuggestions": "Preparing suggestions"
  },
  "results": {
    "matchingSkills": "Matching skills",
    "missingSkills": "Missing skills",
    "recommendations": "Recommendations",
    "rewriteCta": "Rewrite my resume",
    "coverLetterCta": "Generate cover letter",
    "downloadReport": "Download full report",
    "analyzedJustNow": "Analyzed just now"
  },
  "rewrite": {
    "sectionSummary": "Summary",
    "sectionExperience": "Experience",
    "sectionSkills": "Skills",
    "originalLabel": "Original",
    "rewrittenLabel": "Rewritten",
    "generateCta": "Generate rewrite",
    "regenerateCta": "Regenerate",
    "applyCta": "Apply this rewrite",
    "exportCta": "Export rewritten resume"
  },
  "coverLetter": {
    "generating": "Generating your cover letter…",
    "copy": "Copy to clipboard",
    "exportPdf": "Export as PDF",
    "regenerate": "Regenerate",
    "close": "Close"
  },
  "history": {
    "title": "Resume History",
    "emptyTitle": "Nothing analyzed yet",
    "emptyBody": "Upload your first resume to get your match score.",
    "emptyCta": "Upload your first resume"
  },
  "tracker": {
    "title": "Application Tracker",
    "addApplication": "Add application",
    "columnApplied": "Applied",
    "columnInterview": "Interview",
    "columnOffer": "Offer",
    "columnRejected": "Rejected",
    "emptyTitle": "Nothing tracked yet",
    "emptyBody": "Add your first application to organize your career journey. Résona will provide real-time analysis and optimization insights.",
    "emptyCta": "Add your first application",
    "modalTitle": "Add application",
    "companyLabel": "Company",
    "roleLabel": "Role",
    "linkAnalysisLabel": "Not linked to an analysis",
    "cancel": "Cancel"
  },
  "dashboard": {
    "title": "Dashboard",
    "analyzeCta": "Analyze a new resume",
    "statApplications": "Applications sent",
    "statResponseRate": "Response rate",
    "statAvgScore": "Average match score",
    "recentActivity": "Recent activity"
  },
  "settings": {
    "accountTab": "Account",
    "billingTab": "Billing",
    "nameLabel": "Name",
    "emailLabel": "Email",
    "signOut": "Sign out",
    "currentPlan": "Current plan",
    "renewsOn": "Renews on {date}",
    "upgradeToPro": "Upgrade to Pro",
    "manageSubscription": "Manage subscription"
  },
  "pricing": {
    "title": "Simple, honest pricing",
    "subtitle": "Start free. Upgrade when your search gets serious.",
    "mostPopular": "Most popular",
    "currentPlan": "Current plan",
    "upgradeToPro": "Upgrade to Pro",
    "freeName": "Free",
    "freeDescription": "Try Résona and see your first match score.",
    "proName": "Pro",
    "proDescription": "For an active job search, without limits."
  },
  "legal": {
    "privacyTitle": "Privacy Policy",
    "termsTitle": "Terms of Service",
    "lastUpdated": "Last updated: {date}"
  },
  "errors": {
    "generic": "Something went wrong. Please try again.",
    "unauthorized": "Please sign in to continue.",
    "notFound": "This page doesn't exist.",
    "backToDashboard": "Back to dashboard",
    "upgradeRequired": "{feature} is a Pro feature",
    "upgradeRequiredBody": "Upgrade to unlock unlimited rewrites, cover letters, and full history."
  }
}
```

`messages/fr.json`

```json
{
  "nav": {
    "dashboard": "Tableau de bord",
    "tracker": "Suivi",
    "history": "Historique",
    "analyze": "Analyser",
    "settings": "Paramètres",
    "signIn": "Se connecter",
    "signOut": "Se déconnecter",
    "analyzeCta": "Analyser mon CV"
  },
  "landing": {
    "eyebrow": "Minimalisme Précis",
    "tagline": "Votre CV, aligné à chaque opportunité.",
    "subtitle": "75% des CV sont rejetés par les ATS avant qu'un humain ne les lise.",
    "ctaPrimary": "Analyser mon CV",
    "ctaSecondary": "Voir comment ça marche",
    "featuresTitle": "Intelligence Principale",
    "featureScoreTitle": "Score de matching IA",
    "featureScoreBody": "Comparaison sémantique entre votre CV et l'offre d'emploi, pas juste des mots-clés.",
    "featureGapTitle": "Détection des écarts",
    "featureGapBody": "Voyez exactement quelles compétences manquent avant un recruteur.",
    "featureRewriteTitle": "Réécriture des sections",
    "featureRewriteBody": "Sections de CV réécrites par l'IA, comparées à l'original.",
    "featureCoverTitle": "Génération de lettre de motivation",
    "featureCoverBody": "Une lettre de motivation prête à envoyer, adaptée au poste.",
    "processTitle": "Le Processus",
    "processSubtitle": "Alignement technique en trois phases.",
    "trustTitle": "Conçu par des experts, pour des experts."
  },
  "auth": {
    "signUpTitle": "Créez votre profil",
    "loginTitle": "Bon retour",
    "continueWithGoogle": "Continuer avec Google",
    "continueWithLinkedIn": "Continuer avec LinkedIn",
    "orUseEmail": "ou utilisez votre email",
    "emailLabel": "Adresse email",
    "passwordLabel": "Mot de passe",
    "createAccount": "Créer un compte",
    "logIn": "Se connecter",
    "alreadyHaveAccount": "Vous avez déjà un compte ?",
    "noAccount": "Pas encore de compte ?",
    "termsNotice": "En vous inscrivant, vous acceptez nos {terms} et notre {privacy}.",
    "terms": "Conditions d'utilisation",
    "privacy": "Politique de confidentialité"
  },
  "upload": {
    "stepUpload": "Upload",
    "stepAnalyze": "Analyse",
    "stepResults": "Résultats",
    "dropzoneLabel": "Déposez votre CV ici ou cliquez pour parcourir",
    "dropzoneHint": "PDF uniquement, jusqu'à 4 Mo",
    "jobTitleLabel": "Intitulé du poste",
    "companyLabel": "Entreprise (optionnel)",
    "jdLabel": "Collez l'offre d'emploi",
    "cta": "Analyser",
    "quotaExceededTitle": "Vous avez utilisé vos 3 analyses gratuites de ce mois",
    "quotaExceededBody": "Passez à Pro pour des analyses illimitées.",
    "viewPlans": "Voir les offres"
  },
  "analyzing": {
    "stepExtract": "Extraction de votre CV",
    "stepCompare": "Comparaison avec l'offre d'emploi",
    "stepScore": "Calcul de votre score de matching",
    "stepSuggestions": "Préparation des suggestions"
  },
  "results": {
    "matchingSkills": "Compétences correspondantes",
    "missingSkills": "Compétences manquantes",
    "recommendations": "Recommandations",
    "rewriteCta": "Réécrire mon CV",
    "coverLetterCta": "Générer une lettre de motivation",
    "downloadReport": "Télécharger le rapport complet",
    "analyzedJustNow": "Analysé à l'instant"
  },
  "rewrite": {
    "sectionSummary": "Résumé",
    "sectionExperience": "Expérience",
    "sectionSkills": "Compétences",
    "originalLabel": "Original",
    "rewrittenLabel": "Réécrit",
    "generateCta": "Générer la réécriture",
    "regenerateCta": "Régénérer",
    "applyCta": "Appliquer cette réécriture",
    "exportCta": "Exporter le CV réécrit"
  },
  "coverLetter": {
    "generating": "Génération de votre lettre de motivation…",
    "copy": "Copier",
    "exportPdf": "Exporter en PDF",
    "regenerate": "Régénérer",
    "close": "Fermer"
  },
  "history": {
    "title": "Historique des CV",
    "emptyTitle": "Rien d'analysé pour le moment",
    "emptyBody": "Uploadez votre premier CV pour obtenir votre score.",
    "emptyCta": "Uploader mon premier CV"
  },
  "tracker": {
    "title": "Suivi des candidatures",
    "addApplication": "Ajouter une candidature",
    "columnApplied": "Candidature envoyée",
    "columnInterview": "Entretien",
    "columnOffer": "Offre",
    "columnRejected": "Refusée",
    "emptyTitle": "Rien de suivi pour le moment",
    "emptyBody": "Ajoutez votre première candidature pour organiser votre recherche. Résona vous fournira des analyses et suggestions en temps réel.",
    "emptyCta": "Ajouter ma première candidature",
    "modalTitle": "Ajouter une candidature",
    "companyLabel": "Entreprise",
    "roleLabel": "Poste",
    "linkAnalysisLabel": "Non liée à une analyse",
    "cancel": "Annuler"
  },
  "dashboard": {
    "title": "Tableau de bord",
    "analyzeCta": "Analyser un nouveau CV",
    "statApplications": "Candidatures envoyées",
    "statResponseRate": "Taux de réponse",
    "statAvgScore": "Score de matching moyen",
    "recentActivity": "Activité récente"
  },
  "settings": {
    "accountTab": "Compte",
    "billingTab": "Facturation",
    "nameLabel": "Nom",
    "emailLabel": "Email",
    "signOut": "Se déconnecter",
    "currentPlan": "Offre actuelle",
    "renewsOn": "Renouvellement le {date}",
    "upgradeToPro": "Passer à Pro",
    "manageSubscription": "Gérer mon abonnement"
  },
  "pricing": {
    "title": "Une tarification simple et honnête",
    "subtitle": "Commencez gratuitement. Passez à l'offre supérieure quand votre recherche s'intensifie.",
    "mostPopular": "Le plus populaire",
    "currentPlan": "Offre actuelle",
    "upgradeToPro": "Passer à Pro",
    "freeName": "Gratuit",
    "freeDescription": "Essayez Résona et découvrez votre premier score de matching.",
    "proName": "Pro",
    "proDescription": "Pour une recherche d'emploi active, sans limites."
  },
  "legal": {
    "privacyTitle": "Politique de confidentialité",
    "termsTitle": "Conditions d'utilisation",
    "lastUpdated": "Dernière mise à jour : {date}"
  },
  "errors": {
    "generic": "Une erreur est survenue. Veuillez réessayer.",
    "unauthorized": "Veuillez vous connecter pour continuer.",
    "notFound": "Cette page n'existe pas.",
    "backToDashboard": "Retour au tableau de bord",
    "upgradeRequired": "{feature} est une fonctionnalité Pro",
    "upgradeRequiredBody": "Passez à Pro pour débloquer les réécritures illimitées, les lettres de motivation et l'historique complet."
  }
}
```

### 3.4 Utilisation dans les composants

Rappel du pattern déjà utilisé en Phase 3 — chaque page doit importer `useTranslations` avec le bon namespace :

```tsx
import { useTranslations } from "next-intl";

export default function UploadPage() {
  const t = useTranslations("upload");
  // ...
  return <label>{t("dropzoneLabel")}</label>;
}
```

Pour les strings avec variables (ex: `renewsOn`) :

```tsx
const t = useTranslations("settings");
t("renewsOn", { date: new Date(currentPeriodEnd).toLocaleDateString() });
```

---

**Definition of Done :** aucune string visible en dur dans le code (grep `"[A-Z][a-z]+ [a-z]+"` dans les fichiers `.tsx` hors fichiers de traduction pour repérer les oublis). Basculer FR ↔ EN via le dropdown traduit instantanément toute la page visible, y compris les meta tags SEO. Le dropdown affiche des drapeaux nets (SVG), pas d'emoji.
