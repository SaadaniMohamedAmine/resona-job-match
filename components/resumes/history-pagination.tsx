import Link from "next/link";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

function buildHref(page: number, search: string, tier: string) {
  const params = new URLSearchParams();
  if (search) params.set("q", search);
  if (tier) params.set("tier", tier);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return `/resumes${qs ? `?${qs}` : ""}`;
}

export function HistoryPagination({
  page,
  totalPages,
  search,
  tier,
}: {
  page: number;
  totalPages: number;
  search: string;
  tier: string;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-16 flex items-center justify-center gap-2">
      <Link
        href={buildHref(Math.max(1, page - 1), search, tier)}
        aria-disabled={page === 1}
        className={`flex size-10 items-center justify-center border border-track transition-colors ${
          page === 1 ? "pointer-events-none text-muted/40" : "text-muted hover:border-accent hover:text-accent"
        }`}
      >
        <IconChevronLeft size={18} stroke={1.5} />
      </Link>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <Link
          key={p}
          href={buildHref(p, search, tier)}
          className={`flex size-10 items-center justify-center border text-sm transition-colors ${
            p === page ? "border-accent font-bold text-accent" : "border-track text-muted hover:border-accent"
          }`}
        >
          {p}
        </Link>
      ))}

      <Link
        href={buildHref(Math.min(totalPages, page + 1), search, tier)}
        aria-disabled={page === totalPages}
        className={`flex size-10 items-center justify-center border border-track transition-colors ${
          page === totalPages
            ? "pointer-events-none text-muted/40"
            : "text-muted hover:border-accent hover:text-accent"
        }`}
      >
        <IconChevronRight size={18} stroke={1.5} />
      </Link>
    </div>
  );
}
