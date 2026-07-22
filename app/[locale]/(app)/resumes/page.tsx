import { redirect } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { IconPlus } from "@tabler/icons-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { HistoryEmptyState } from "@/components/resumes/history-empty-state";
import { HistoryStats } from "@/components/resumes/history-stats";
import { HistoryContent } from "@/components/resumes/history-content";

const DAY_MS = 24 * 60 * 60 * 1000;

export default async function ResumesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = session.user.id;
  const t = await getTranslations("history");

  const analyses = await db.analysis.findMany({
    where: { userId },
    include: { jobPost: { select: { title: true, company: true } } },
    orderBy: { createdAt: "desc" },
  });

  if (analyses.length === 0) {
    return <HistoryEmptyState />;
  }

  // eslint-disable-next-line react-hooks/purity -- async Server Component, renders once per request
  const now = Date.now();
  const ageInDays = (createdAt: Date) => (now - createdAt.getTime()) / DAY_MS;
  const recent = analyses.filter((a) => ageInDays(a.createdAt) < 10).length;
  const mid = analyses.filter((a) => ageInDays(a.createdAt) >= 10 && ageInDays(a.createdAt) < 20).length;
  const old = analyses.filter((a) => ageInDays(a.createdAt) >= 20 && ageInDays(a.createdAt) < 30).length;
  const totalThisMonth = recent + mid + old;
  const avgScore = Math.round(analyses.reduce((sum, a) => sum + a.matchScore, 0) / analyses.length);

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

      <HistoryContent analyses={analyses} />
    </div>
  );
}
