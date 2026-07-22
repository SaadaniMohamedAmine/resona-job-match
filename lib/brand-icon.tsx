import { readFileSync } from "fs";
import { join } from "path";

export const GRAPHITE = "#16140F";
export const CHAMPAGNE = "#C9A961";

let cachedFont: Buffer | null = null;

export function getSpaceGroteskBold() {
  if (!cachedFont) {
    cachedFont = readFileSync(join(process.cwd(), "assets/fonts/SpaceGrotesk-Bold.ttf"));
  }
  return {
    name: "Space Grotesk",
    data: cachedFont,
    weight: 700 as const,
    style: "normal" as const,
  };
}

export function Monogram({ size, paddingPct = 0 }: { size: number; paddingPct?: number }) {
  const fontSize = Math.round(size * 0.55 * (1 - paddingPct));
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: GRAPHITE,
      }}
    >
      <span style={{ fontSize, fontWeight: 700, color: CHAMPAGNE, fontFamily: "Space Grotesk" }}>R</span>
    </div>
  );
}
