"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { IconSearch, IconFilter, IconChevronDown } from "@tabler/icons-react";

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
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const TIERS: { value: MatchTier; label: string }[] = [
    { value: "", label: t("filterAll") },
    { value: "strong", label: t("matchHintStrong") },
    { value: "partial", label: t("matchHintPartial") },
    { value: "weak", label: t("matchHintWeak") },
  ];

  const current = TIERS.find((option) => option.value === tier) ?? TIERS[0];

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
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex w-full items-center gap-2 rounded-(--radius-control) border border-track bg-transparent py-2.5 pr-4 pl-9 text-sm text-base-light transition-colors hover:border-accent/40 focus:border-accent focus:outline-none sm:w-48"
        >
          <IconFilter size={16} stroke={1.5} className="absolute left-3 text-muted" />
          <span className="flex-1 text-left">{current.label}</span>
          <IconChevronDown size={14} stroke={1.5} className={`transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <div className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-(--radius-control) border border-track bg-base py-1 shadow-lg">
            {TIERS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onTierChange(option.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center px-4 py-2 text-left text-sm transition-colors hover:bg-track ${
                  option.value === tier ? "text-accent" : "text-base-light"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
