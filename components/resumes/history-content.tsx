"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { IconUpload } from "@tabler/icons-react";
import { HistoryFilters, type ScoreTier } from "@/components/resumes/history-filters";
import { HistoryCard } from "@/components/resumes/history-card";
import { HistoryPagination } from "@/components/resumes/history-pagination";

const PAGE_SIZE = 5;

type Analysis = {
  id: string;
  resumeId: string;
  matchScore: number;
  createdAt: Date;
  jobPost: { title: string; company: string | null };
};

function matchesTier(score: number, tier: ScoreTier) {
  if (tier === "high") return score >= 90;
  if (tier === "good") return score >= 70 && score < 90;
  if (tier === "low") return score < 70;
  return true;
}

export function HistoryContent({ analyses }: { analyses: Analysis[] }) {
  const t = useTranslations("history");
  const [query, setQuery] = useState("");
  const [tier, setTier] = useState<ScoreTier>("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return analyses.filter(
      (a) => (!q || a.jobPost.title.toLowerCase().includes(q)) && matchesTier(a.matchScore, tier),
    );
  }, [analyses, query, tier]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleQueryChange(value: string) {
    setQuery(value);
    setPage(1);
  }

  function handleTierChange(value: ScoreTier) {
    setTier(value);
    setPage(1);
  }

  return (
    <>
      <HistoryFilters query={query} onQueryChange={handleQueryChange} tier={tier} onTierChange={handleTierChange} />

      {pageItems.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted">{t("noResults")}</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pageItems.map((analysis) => (
            <HistoryCard key={analysis.id} analysis={analysis} />
          ))}
          <Link
            href="/upload"
            className="flex flex-col items-center justify-center rounded-(--radius-card) border border-dashed border-track p-6 text-center transition-colors hover:border-accent"
          >
            <div className="mb-4 flex size-12 items-center justify-center rounded-full border border-track">
              <IconUpload size={18} stroke={1.5} className="text-accent" />
            </div>
            <h3 className="mb-1 font-display text-lg font-medium text-base-light">{t("uploadNewTitle")}</h3>
            <p className="text-xs text-muted">{t("uploadNewSubtitle")}</p>
          </Link>
        </div>
      )}

      <HistoryPagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
    </>
  );
}
