import { IconChartBar } from "@tabler/icons-react";

export function AnalyzingRing({ percent, size = 220 }: { percent: number; size?: number }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 100 100" className="animate-ring-spin">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--color-track)" strokeWidth="2" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * 0.25}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <IconChartBar size={40} stroke={1.5} className="text-accent" />
        <span className="mt-2 font-display text-2xl font-bold text-accent">{percent}%</span>
      </div>
    </div>
  );
}
