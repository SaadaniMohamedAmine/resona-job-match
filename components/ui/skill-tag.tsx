import { IconCheck, IconAlertCircle } from "@tabler/icons-react";

export function SkillTag({ label, variant }: { label: string; variant: "match" | "gap" }) {
  const Icon = variant === "match" ? IconCheck : IconAlertCircle;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-track)] px-3 py-1 text-sm text-[var(--color-base-light)]">
      <Icon size={14} stroke={1.5} className="text-[var(--color-accent)]" />
      {label}
    </span>
  );
}
