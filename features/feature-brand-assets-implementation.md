# Résona — Feature: Brand Assets Implementation

> Document de délégation. Spec, tasks, code complet. Transforme la planche de référence Stitch (`r_sona_brand_asset_specification/code.html`) en assets et composants réellement fonctionnels dans l'app — la planche elle-même reste seulement de la documentation visuelle, elle n'est jamais servie aux utilisateurs.

---

## 1. Spec

Quatre livrables, calqués exactement sur les specs de la planche de référence :
1. Favicon + app icons réels (fichiers binaires), monogramme "R" Space Grotesk 700 champagne sur graphite
2. Image OG dynamique 1200×630 avec les cercles ScoreRing atténués en fond
3. Composant Global App Loader (anneau fin qui tourne + wordmark + "Calibrating Insights")
4. Composants Skeleton pour Dashboard et Historique, couleur plate `#37342F`, **aucune animation shimmer**

## 2. Tasks

- [ ] Générer les fichiers favicon/icons réels via le script fourni
- [ ] Placer les fichiers dans `public/`
- [ ] Créer/mettre à jour `app/manifest.ts`
- [ ] Créer `app/opengraph-image.tsx` (génération dynamique, pas de fichier statique)
- [ ] Construire `components/ui/global-loader.tsx`
- [ ] Brancher le loader sur `app/[locale]/(app)/loading.tsx` (convention Next.js App Router — s'affiche automatiquement pendant le chargement de n'importe quelle route de ce groupe)
- [ ] Construire `components/ui/skeleton-dashboard.tsx` et `components/ui/skeleton-history.tsx`
- [ ] Les utiliser dans `app/[locale]/(app)/dashboard/loading.tsx` et `app/[locale]/(app)/resumes/loading.tsx`

## 3. Code complet

### 3.1 Génération des fichiers icônes réels

Script Python autonome — à exécuter une fois, produit tous les fichiers nécessaires dans `public/`. Utilise Pillow ; télécharge Space Grotesk Bold automatiquement, avec repli sur une police système si le téléchargement échoue (à ajuster si besoin).

```python
# scripts/generate-icons.py
# Usage: python3 scripts/generate-icons.py
from PIL import Image, ImageDraw, ImageFont
import os
import urllib.request

OUTPUT_DIR = "public"
os.makedirs(OUTPUT_DIR, exist_ok=True)

GRAPHITE = (22, 20, 15)       # #16140F
CHAMPAGNE = (201, 169, 97)    # #C9A961

FONT_PATH = "/tmp/SpaceGrotesk-Bold.ttf"
if not os.path.exists(FONT_PATH):
    try:
        urllib.request.urlretrieve(
            "https://github.com/google/fonts/raw/main/ofl/spacegrotesk/static/SpaceGrotesk-Bold.ttf",
            FONT_PATH,
        )
    except Exception:
        FONT_PATH = None  # falls back to PIL default — replace manually if this happens

def make_icon(size, filename, padding_pct=0):
    img = Image.new("RGB", (size, size), GRAPHITE)
    draw = ImageDraw.Draw(img)
    font_size = int(size * 0.55 * (1 - padding_pct))
    font = ImageFont.truetype(FONT_PATH, font_size) if FONT_PATH else ImageFont.load_default()
    text = "R"
    bbox = draw.textbbox((0, 0), text, font=font)
    w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text(((size - w) / 2 - bbox[0], (size - h) / 2 - bbox[1]), text, font=font, fill=CHAMPAGNE)
    img.save(os.path.join(OUTPUT_DIR, filename))
    print(f"Created {filename} ({size}x{size})")

make_icon(16, "favicon-16.png")
make_icon(32, "favicon-32.png")
make_icon(180, "apple-touch-icon.png")
make_icon(192, "icon-192.png")
make_icon(512, "icon-512.png")
make_icon(512, "icon-maskable-512.png", padding_pct=0.2)  # 20% safe-zone padding, matches reference sheet

# .ico bundle (16 + 32) for legacy browser tabs
icon16 = Image.open(os.path.join(OUTPUT_DIR, "favicon-16.png"))
icon32 = Image.open(os.path.join(OUTPUT_DIR, "favicon-32.png"))
icon16.save(os.path.join(OUTPUT_DIR, "favicon.ico"), sizes=[(16, 16), (32, 32)])
print("Created favicon.ico")
```

```bash
pip install pillow
python3 scripts/generate-icons.py
```

> Si le téléchargement de la police échoue dans l'environnement d'exécution, télécharger manuellement `SpaceGrotesk-Bold.ttf` depuis Google Fonts et le placer à `/tmp/SpaceGrotesk-Bold.ttf`, ou ajuster `FONT_PATH` vers une police locale au même poids visuel.

### 3.2 Manifest

`app/manifest.ts` (déjà écrit en Phase 1 — reproduit ici pour que ce doc soit autonome)

```ts
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Résona",
    short_name: "Résona",
    description: "Your resume, aligned to every opportunity.",
    start_url: "/",
    background_color: "#16140F",
    theme_color: "#16140F",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
```

Ajouter dans `app/[locale]/layout.tsx` `<head>` (ou via `metadata.icons` de Next.js) :

```ts
export const metadata = {
  icons: {
    icon: [{ url: "/favicon-32.png", sizes: "32x32" }, { url: "/favicon-16.png", sizes: "16x16" }],
    apple: "/apple-touch-icon.png",
  },
};
```

### 3.3 Image OG dynamique — fidèle à la planche de référence

`app/opengraph-image.tsx`

```tsx
import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#16140F",
          overflow: "hidden",
        }}
      >
        {/* Cropped ScoreRing background circles, matching the reference sheet */}
        <div
          style={{
            position: "absolute",
            right: -96,
            bottom: -96,
            width: 600,
            height: 600,
            borderRadius: "50%",
            border: "2px solid rgba(201,169,97,0.1)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -48,
            bottom: -48,
            width: 400,
            height: 400,
            borderRadius: "50%",
            border: "1px solid rgba(201,169,97,0.05)",
          }}
        />
        <div style={{ fontSize: 72, fontWeight: 700, color: "#E6C479", letterSpacing: "-0.02em" }}>Résona</div>
        <div style={{ fontSize: 28, color: "#D0C5B4", marginTop: 16 }}>
          Your resume, aligned to every opportunity.
        </div>
      </div>
    ),
    size
  );
}
```

### 3.4 Global App Loader — composant réel

`components/ui/global-loader.tsx`

```tsx
export function GlobalLoader() {
  return (
    <div className="flex h-96 w-full flex-col items-center justify-center rounded-xl bg-background">
      <div
        style={{
          width: 48,
          height: 48,
          border: "1.5px solid rgba(230,196,121,0.2)",
          borderTop: "1.5px solid #E6C479",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
        className="mb-8"
        role="status"
        aria-label="Loading"
      />
      <div className="font-headline-sm text-headline-sm font-bold tracking-tight text-primary">Résona</div>
      <div className="mt-4 font-label-md text-label-md uppercase tracking-widest text-on-surface-variant opacity-50">
        Calibrating Insights
      </div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
```

`app/[locale]/(app)/loading.tsx`

```tsx
import { GlobalLoader } from "@/components/ui/global-loader";

export default function Loading() {
  return <GlobalLoader />;
}
```

> Convention Next.js App Router : un fichier `loading.tsx` dans un dossier de route s'affiche automatiquement pendant que les Server Components de cette route (ou de ses enfants) chargent leurs données — aucun état de chargement manuel à gérer pour la navigation elle-même.

### 3.5 Skeletons — fidèles à la planche de référence

`components/ui/skeleton-dashboard.tsx`

```tsx
export function SkeletonDashboard() {
  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-low p-8">
      <div className="mb-8 grid grid-cols-3 gap-4">
        <div className="h-24 rounded-lg bg-surface-container-highest" />
        <div className="h-24 rounded-lg bg-surface-container-highest" />
        <div className="h-24 rounded-lg bg-surface-container-highest" />
      </div>
      <div className="mb-6 h-48 w-full rounded-lg bg-surface-container-highest" />
      <div className="space-y-4">
        <div className="h-4 w-3/4 rounded bg-surface-container-highest" />
        <div className="h-4 w-1/2 rounded bg-surface-container-highest" />
      </div>
    </div>
  );
}
```

`components/ui/skeleton-history.tsx`

```tsx
export function SkeletonHistory() {
  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-low p-8">
      <div className="space-y-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`flex items-center gap-4 py-3 ${i < 3 ? "border-b border-outline-variant/30" : ""}`}
          >
            <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-surface-container-highest" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/3 rounded bg-surface-container-highest" />
              <div className="h-2 w-1/4 rounded bg-surface-container-highest opacity-50" />
            </div>
            <div className="h-4 w-16 rounded bg-surface-container-highest" />
          </div>
        ))}
      </div>
    </div>
  );
}
```

`app/[locale]/(app)/dashboard/loading.tsx`

```tsx
import { SkeletonDashboard } from "@/components/ui/skeleton-dashboard";

export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl px-margin-mobile py-16 md:px-margin-desktop">
      <SkeletonDashboard />
    </div>
  );
}
```

`app/[locale]/(app)/resumes/loading.tsx`

```tsx
import { SkeletonHistory } from "@/components/ui/skeleton-history";

export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl px-margin-mobile py-16 md:px-margin-desktop">
      <SkeletonHistory />
    </div>
  );
}
```

> **Règle explicite de la planche de référence, à respecter strictement :** couleur plate `#37342F` (`surface-container-highest`) uniquement, **aucune animation shimmer/pulse** — pas de `animate-pulse` Tailwind ici, contrairement à ce que le Phase 1 générique suggérait. C'est une correction par rapport au tout premier brouillon.

---

**Definition of Done :** `public/favicon.ico` et tous les PNG existent et s'affichent dans l'onglet du navigateur et au partage social. L'image OG générée dynamiquement matche visuellement la planche de référence. Le loader global et les skeletons s'affichent automatiquement pendant les transitions de route sans code de gestion d'état manuel, et aucun des deux n'a d'animation shimmer.
