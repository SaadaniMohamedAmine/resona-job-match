"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { IconSearch, IconFilter } from "@tabler/icons-react";

const TIERS = [
  { value: "", label: "All scores" },
  { value: "high", label: "High match (90+)" },
  { value: "good", label: "Good match (70-89)" },
  { value: "low", label: "Needs improvement (<70)" },
];

export function HistoryFilters({
  defaultQuery,
  defaultTier,
}: {
  defaultQuery: string;
  defaultTier: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(defaultQuery);
  const [, startTransition] = useTransition();

  function pushParams(next: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.delete("page");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query !== defaultQuery) pushParams({ q: query });
    }, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative max-w-md flex-1">
        <IconSearch size={18} stroke={1.5} className="absolute top-1/2 left-3 -translate-y-1/2 text-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by job title..."
          className="w-full rounded-(--radius-control) border border-track bg-transparent py-2.5 pr-4 pl-10 text-sm text-base-light placeholder:text-muted focus:border-accent focus:outline-none"
        />
      </div>
      <div className="relative">
        <IconFilter size={16} stroke={1.5} className="absolute top-1/2 left-3 -translate-y-1/2 text-muted" />
        <select
          defaultValue={defaultTier}
          onChange={(e) => pushParams({ tier: e.target.value })}
          className="appearance-none rounded-(--radius-control) border border-track bg-transparent py-2.5 pr-8 pl-9 text-sm text-base-light focus:border-accent focus:outline-none"
        >
          {TIERS.map((tier) => (
            <option key={tier.value} value={tier.value} className="bg-base">
              {tier.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
