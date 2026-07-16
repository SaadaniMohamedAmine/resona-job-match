export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={`font-[family-name:var(--font-display)] font-bold text-xl tracking-tight text-[var(--color-accent)] ${className ?? ""}`}
    >
      Résona
    </span>
  );
}
