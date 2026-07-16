export function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={`Match score: ${score}%`}>
      <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--color-track)" strokeWidth="10" />
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 50 50)"
        style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
      />
      <text
        x="50"
        y="55"
        textAnchor="middle"
        fontSize="18"
        fontWeight="500"
        fill="var(--color-accent)"
        className="font-[family-name:var(--font-display)]"
      >
        {score}%
      </text>
    </svg>
  );
}
