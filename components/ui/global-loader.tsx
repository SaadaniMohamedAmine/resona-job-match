export function GlobalLoader() {
  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center">
      <svg
        className="animate-ring-spin mb-8"
        width="48"
        height="48"
        viewBox="0 0 48 48"
        role="status"
        aria-label="Loading"
      >
        <circle cx="24" cy="24" r="21" fill="none" stroke="var(--color-track)" strokeWidth="1.5" />
        <circle
          cx="24"
          cy="24"
          r="21"
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="33 99"
        />
      </svg>
      <span className="font-display text-lg font-bold tracking-tight text-accent">Résona</span>
      <span className="mt-4 text-xs tracking-widest text-muted uppercase opacity-50">
        Calibrating Insights
      </span>
    </div>
  );
}
