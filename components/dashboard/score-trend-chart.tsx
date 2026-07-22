"use client";

import { useTranslations } from "next-intl";

const WIDTH = 1000;
const HEIGHT = 200;
const THRESHOLD = 70;

export function ScoreTrendChart({ data }: { data: { label: string; score: number }[] }) {
  const t = useTranslations("dashboard");
  const stepX = data.length > 1 ? WIDTH / (data.length - 1) : WIDTH;
  const yFor = (score: number) => HEIGHT - 10 - (score / 100) * (HEIGHT - 20);

  const points = data.map((d, i) => ({ x: i * stepX, y: yFor(d.score) }));
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1].x},${HEIGHT} L0,${HEIGHT} Z`;
  const thresholdY = yFor(THRESHOLD);

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-64 w-full overflow-visible">
        <defs>
          <linearGradient id="scoreTrendGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
          </linearGradient>
        </defs>

        <line
          x1={0}
          x2={WIDTH}
          y1={thresholdY}
          y2={thresholdY}
          stroke="var(--color-muted)"
          strokeWidth={1}
          strokeDasharray="4 4"
          opacity={0.4}
        />

        <path d={areaPath} fill="url(#scoreTrendGradient)" />
        <path
          d={linePath}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={4} fill="var(--color-accent)" />
        ))}
      </svg>
      <div className="mt-4 flex items-center justify-between text-xs text-muted">
        <span>{data[0]?.label}</span>
        <span className="flex items-center gap-1.5">
          <span className="h-px w-4 border-t border-dashed border-muted opacity-60" />
          {t("scoreThresholdLabel", { threshold: THRESHOLD })}
        </span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
}
