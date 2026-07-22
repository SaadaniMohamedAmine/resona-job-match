"use client";

export function CommandPaletteTrigger({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
      className="hidden items-center gap-1.5 rounded-(--radius-control) border border-track px-2.5 py-1 text-xs text-muted transition-colors hover:border-accent/40 md:flex"
      aria-label={label}
    >
      <span>⌘</span>
      <span>K</span>
    </button>
  );
}
