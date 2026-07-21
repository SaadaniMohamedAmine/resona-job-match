const WIDTH = 1000;
const HEIGHT = 200;
const GRID_LINES = [0, 0.33, 0.66, 1];

export function TrendChart({ data }: { data: { label: string; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const stepX = data.length > 1 ? WIDTH / (data.length - 1) : WIDTH;

  const points = data.map((d, i) => ({
    x: i * stepX,
    y: HEIGHT - 10 - (d.count / max) * (HEIGHT - 20),
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1].x},${HEIGHT} L0,${HEIGHT} Z`;

  const peakIndex = data.reduce((best, d, i) => (d.count > data[best].count ? i : best), 0);
  const dotIndices = Array.from(new Set([0, peakIndex, points.length - 1]));

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-64 w-full overflow-visible">
        <defs>
          <linearGradient id="trendGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {GRID_LINES.map((f) => (
          <line
            key={f}
            x1={0}
            x2={WIDTH}
            y1={HEIGHT * f}
            y2={HEIGHT * f}
            stroke="var(--color-track)"
            strokeWidth={1}
          />
        ))}
        <path d={areaPath} fill="url(#trendGradient)" />
        <path
          d={linePath}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {dotIndices.map((i) => (
          <circle key={i} cx={points[i].x} cy={points[i].y} r={4} fill="var(--color-accent)" />
        ))}
      </svg>
      <div className="mt-4 flex justify-between text-xs text-muted">
        <span>{data[0]?.label}</span>
        <span>{data[Math.floor(data.length / 2)]?.label}</span>
        <span>Today</span>
      </div>
    </div>
  );
}
