export function LoaderRing({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 50 50" className="animate-spin" role="status" aria-label="Loading">
      <circle cx="25" cy="25" r="20" fill="none" stroke="var(--color-track)" strokeWidth="4" />
      <circle
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="90 40"
      />
    </svg>
  );
}
