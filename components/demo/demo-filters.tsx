"use client";

import { useTranslations } from "next-intl";
import { IconSearch, IconFilter } from "@tabler/icons-react";

export type MatchTier = "" | "strong" | "partial" | "weak";

export function DemoFilters({
  query,
  onQueryChange,
  tier,
  onTierChange,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  tier: MatchTier;
  onTierChange: (value: MatchTier) => void;
}) {
  const t = useTranslations("demo");

  const TIERS: { value: MatchTier; label: string }[] = [
    { value: "", label: t("filterAll") },
    { value: "strong", label: t("matchHintStrong") },
    { value: "partial", label: t("matchHintPartial") },
    { value: "weak", label: t("matchHintWeak") },
  ];

  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative max-w-md flex-1">
        <IconSearch size={18} stroke={1.5} className="absolute top-1/2 left-3 -translate-y-1/2 text-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="w-full rounded-(--radius-control) border border-track bg-transparent py-2.5 pr-4 pl-10 text-sm text-base-light placeholder:text-muted focus:border-accent focus:outline-none"
        />
      </div>
      <div className="relative">
        <IconFilter size={16} stroke={1.5} className="absolute top-1/2 left-3 -translate-y-1/2 text-muted" />
        <select
          value={tier}
          onChange={(e) => onTierChange(e.target.value as MatchTier)}
          className="appearance-none rounded-(--radius-control) border border-track bg-transparent py-2.5 pr-8 pl-9 text-sm text-base-light focus:border-accent focus:outline-none"
        >
          {TIERS.map((t) => (
            <option key={t.value} value={t.value} className="bg-base">
              {t.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
