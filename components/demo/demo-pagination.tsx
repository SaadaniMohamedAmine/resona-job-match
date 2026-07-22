"use client";

import { useTranslations } from "next-intl";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

export function DemoPagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const t = useTranslations("demo");

  if (totalPages <= 1) return null;

  return (
    <div className="mt-16 flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        aria-label={t("previousPage")}
        className={`flex size-10 items-center justify-center border border-track transition-colors ${
          page === 1 ? "pointer-events-none text-muted/40" : "text-muted hover:border-accent hover:text-accent"
        }`}
      >
        <IconChevronLeft size={18} stroke={1.5} />
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPageChange(p)}
          className={`flex size-10 items-center justify-center border text-sm transition-colors ${
            p === page ? "border-accent font-bold text-accent" : "border-track text-muted hover:border-accent"
          }`}
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        aria-label={t("nextPage")}
        className={`flex size-10 items-center justify-center border border-track transition-colors ${
          page === totalPages
            ? "pointer-events-none text-muted/40"
            : "text-muted hover:border-accent hover:text-accent"
        }`}
      >
        <IconChevronRight size={18} stroke={1.5} />
      </button>
    </div>
  );
}
