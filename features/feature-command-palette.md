# Résona — Feature: Command Palette (⌘K)

> Document de délégation. Spec, tasks, code complet. Vérifié contre le vrai code au 2026-07-21 — tokens `--color-*`, icônes `@tabler/icons-react`, style modal calqué sur `components/ui/confirm-dialog.tsx` existant.

---

## 1. Spec

**Objectif** : un raccourci `⌘K` / `Ctrl+K` ouvre une palette de commandes centrée, permettant de naviguer instantanément et de déclencher des actions rapides (changer de langue, changer de thème, se déconnecter, lancer une nouvelle analyse). C'est un signal "produit premium / power-user" immédiatement reconnaissable pour un recruteur technique.

**Bibliothèque** : [`cmdk`](https://cmdk.paco.me/) — légère, non stylée par défaut (on applique nos propres classes), standard de facto pour ce pattern (utilisé par Linear, Vercel, Raycast).

**Portée** : disponible partout — pages publiques (marketing) ET pages authentifiées (app) — avec deux jeux de commandes différents selon l'état de session.

## 2. Tasks

- [ ] `npm install cmdk`
- [ ] Créer `components/command-palette.tsx`
- [ ] Monter `<CommandPalette />` dans `app/[locale]/layout.tsx` (racine, englobe les deux groupes de routes)
- [ ] Ajouter un déclencheur visuel "⌘K" dans `AppNavbar` et `PublicNavbar`
- [ ] Vérifier qu'aucun conflit de raccourci n'existe avec le navigateur (⌘K est déjà intercepté par certains navigateurs pour la barre d'adresse — `preventDefault()` obligatoire)

## 3. Code complet

### 3.1 Composant

`components/command-palette.tsx`

```tsx
"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  IconLayoutDashboard,
  IconUpload,
  IconHistory,
  IconLayoutKanban,
  IconSettings,
  IconHome,
  IconCreditCard,
  IconCode,
  IconLogin,
  IconLogout,
  IconUserPlus,
  IconFlask,
} from "@tabler/icons-react";

const AUTH_COMMANDS = [
  { icon: IconLayoutDashboard, label: "Go to Dashboard", href: "/dashboard" },
  { icon: IconUpload, label: "New analysis", href: "/upload" },
  { icon: IconHistory, label: "Go to History", href: "/resumes" },
  { icon: IconLayoutKanban, label: "Go to Applications", href: "/tracker" },
  { icon: IconSettings, label: "Go to Settings", href: "/settings/account" },
  { icon: IconCreditCard, label: "Go to Billing", href: "/settings/billing" },
];

const PUBLIC_COMMANDS = [
  { icon: IconHome, label: "Go to Home", href: "/" },
  { icon: IconFlask, label: "Try live demo", href: "/demo" },
  { icon: IconCreditCard, label: "Go to Pricing", href: "/pricing" },
  { icon: IconCode, label: "Built with", href: "/built-with" },
  { icon: IconLogin, label: "Sign in", href: "/login" },
  { icon: IconUserPlus, label: "Create account", href: "/sign-up" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  const commands = session?.user ? AUTH_COMMANDS : PUBLIC_COMMANDS;

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-100 flex items-start justify-center bg-black/85 px-4 pt-[15vh]"
      onClick={() => setOpen(false)}
    >
      <Command
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg overflow-hidden rounded-(--radius-card) border border-track bg-base"
        label="Command palette"
      >
        <Command.Input
          autoFocus
          placeholder="Type a command or search…"
          className="w-full border-b border-track bg-transparent px-5 py-4 text-sm text-base-light placeholder:text-muted focus:outline-none"
        />
        <Command.List className="max-h-80 overflow-y-auto p-2">
          <Command.Empty className="px-3 py-6 text-center text-sm text-muted">
            No results found.
          </Command.Empty>
          <Command.Group heading="Navigation" className="px-2 py-2 text-xs tracking-widest text-muted uppercase [&_[cmdk-group-heading]]:mb-2 [&_[cmdk-group-heading]]:px-1">
            {commands.map((cmd) => (
              <Command.Item
                key={cmd.href}
                onSelect={() => go(cmd.href)}
                className="flex cursor-pointer items-center gap-3 rounded-(--radius-control) px-3 py-2.5 text-sm text-base-light data-[selected=true]:bg-track"
              >
                <cmd.icon size={16} stroke={1.5} className="text-accent" />
                {cmd.label}
              </Command.Item>
            ))}
          </Command.Group>
          {session?.user && (
            <Command.Group heading="Account" className="px-2 py-2 text-xs tracking-widest text-muted uppercase [&_[cmdk-group-heading]]:mb-2 [&_[cmdk-group-heading]]:px-1">
              <Command.Item
                onSelect={() => {
                  setOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
                className="flex cursor-pointer items-center gap-3 rounded-(--radius-control) px-3 py-2.5 text-sm text-base-light data-[selected=true]:bg-track"
              >
                <IconLogout size={16} stroke={1.5} className="text-accent" />
                Sign out
              </Command.Item>
            </Command.Group>
          )}
        </Command.List>
      </Command>
    </div>
  );
}
```

### 3.2 Montage racine

`app/[locale]/layout.tsx` (ajout — le composant est un client component autonome, aucune prop requise) :

```tsx
import { CommandPalette } from "@/components/command-palette";

// dans le JSX, juste avant la fermeture de </body>, aux côtés du <ToastContainer /> (feature-notifications.md)
<CommandPalette />
```

### 3.3 Déclencheur visuel dans les navbars

Ajout dans `components/layout/app-navbar.tsx`, à côté de `<UserMenu {...user} />` :

```tsx
<button
  type="button"
  onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
  className="hidden items-center gap-1.5 rounded-(--radius-control) border border-track px-2.5 py-1 text-xs text-muted transition-colors hover:border-accent/40 md:flex"
  aria-label="Open command palette"
>
  <span>⌘</span>
  <span>K</span>
</button>
```

Même bloc dans `components/layout/public-navbar.tsx`, avant `<Link href="/login">`.

> Simuler un `KeyboardEvent` pour rouvrir la palette au clic est un raccourci pragmatique qui réutilise le même listener — alternative plus propre : extraire `open`/`setOpen` dans un petit store partagé (`zustand` ou `useSyncExternalStore`) si le pattern est réutilisé ailleurs. Non nécessaire pour ce scope.

---

**Definition of Done :** `⌘K`/`Ctrl+K` ouvre la palette depuis n'importe quelle page, publique ou authentifiée, sans intercepter la recherche native du navigateur ailleurs. La liste de commandes change selon l'état de session. `Escape` et un clic hors de la palette la ferment. Le bouton visuel "⌘K" dans la navbar l'ouvre aussi.
