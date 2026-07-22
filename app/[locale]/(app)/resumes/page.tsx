import { redirect } from "next/navigation";
import Link from "next/link";
import { Prisma } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { IconPlus, IconUpload } from "@tabler/icons-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { HistoryEmptyState } from "@/components/resumes/history-empty-state";
import { HistoryStats } from "@/components/resumes/history-stats";
import { HistoryFilters } from "@/components/resumes/history-filters";
import { HistoryCard } from "@/components/resumes/history-card";
import { HistoryPagination } from "@/components/resumes/history-pagination";

const PAGE_SIZE = 5;
const DAY_MS = 24 * 60 * 60 * 1000;

const TIER_RANGES: Record<string, Prisma.IntFilter> = {
  high: { gte: 90 },
  good: { gte: 70, lt: 90 },
  low: { lt: 70 },
};

export default async function ResumesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; tier?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = session.user.id;
  const t = await getTranslations("history");

  const { page: pageParam, q, tier: tierParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const search = q?.trim() ?? "";
  const tier = tierParam && TIER_RANGES[tierParam] ? tierParam : "";

  const allAnalyses = await db.analysis.findMany({
    where: { userId },
    select: { matchScore: true, createdAt: true },
  });

  if (allAnalyses.length === 0) {
    return <HistoryEmptyState />;
  }

  const where = {
    userId,
    ...(search ? { jobPost: { title: { contains: search, mode: "insensitive" as const } } } : {}),
    ...(tier ? { matchScore: TIER_RANGES[tier] } : {}),
  };

  const [filteredCount, analyses] = await Promise.all([
    db.analysis.count({ where }),
    db.analysis.findMany({
      where,
      include: { jobPost: { select: { title: true, company: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredCount / PAGE_SIZE));

  // eslint-disable-next-line react-hooks/purity -- async Server Component, renders once per request
  const now = Date.now();
  const ageInDays = (createdAt: Date) => (now - createdAt.getTime()) / DAY_MS;
  const recent = allAnalyses.filter((a) => ageInDays(a.createdAt) < 10).length;
  const mid = allAnalyses.filter((a) => ageInDays(a.createdAt) >= 10 && ageInDays(a.createdAt) < 20).length;
  const old = allAnalyses.filter((a) => ageInDays(a.createdAt) >= 20 && ageInDays(a.createdAt) < 30).length;
  const totalThisMonth = recent + mid + old;
  const avgScore = Math.round(
    allAnalyses.reduce((sum, a) => sum + a.matchScore, 0) / allAnalyses.length,
  );

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 md:px-16">
      <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h1 className="mb-2 font-display text-3xl font-bold text-base-light">{t("pageTitle")}</h1>
          <p className="max-w-xl text-muted">{t("pageSubtitle")}</p>
        </div>
        <Link
          href="/upload"
          className="flex items-center gap-2 rounded-(--radius-control) bg-accent px-6 py-3 text-sm font-medium text-[var(--color-base)] transition-opacity hover:opacity-90"
        >
          <IconPlus size={18} stroke={1.5} />
          {t("newAnalysisCta")}
        </Link>
      </div>

      <HistoryStats totalThisMonth={totalThisMonth} recent={recent} mid={mid} old={old} avgScore={avgScore} />

      <HistoryFilters defaultQuery={search} defaultTier={tier} />

      {analyses.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted">{t("noResults")}</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {analyses.map((analysis) => (
            <HistoryCard key={analysis.id} analysis={analysis} />
          ))}
          <Link
            href="/upload"
            className="flex flex-col items-center justify-center rounded-(--radius-card) border border-dashed border-track p-6 text-center transition-colors hover:border-accent"
          >
            <div className="mb-4 flex size-12 items-center justify-center rounded-full border border-track">
              <IconUpload size={18} stroke={1.5} className="text-accent" />
            </div>
            <h3 className="mb-1 font-display text-lg font-medium text-base-light">
              {t("uploadNewTitle")}
            </h3>
            <p className="text-xs text-muted">{t("uploadNewSubtitle")}</p>
          </Link>
        </div>
      )}

      <HistoryPagination page={page} totalPages={totalPages} search={search} tier={tier} />
    </div>
  );
}
