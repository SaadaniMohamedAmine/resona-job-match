import { IconCheck, IconAlertCircle } from "@tabler/icons-react";

export function SkillTag({ label, variant }: { label: string; variant: "match" | "gap" }) {
  const Icon = variant === "match" ? IconCheck : IconAlertCircle;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-(--radius-control) border border-track bg-track/40 px-3 py-1.5 text-sm text-base-light">
      <Icon size={14} stroke={1.5} className="text-accent" />
      {label}
    </span>
  );
}
