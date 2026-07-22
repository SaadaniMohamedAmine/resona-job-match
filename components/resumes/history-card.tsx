import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { IconChevronRight } from "@tabler/icons-react";
import { ScoreRing } from "@/components/ui/score-ring";
import { DeleteAnalysisButton } from "@/components/resumes/delete-analysis-button";

export function HistoryCard({
  analysis,
}: {
  analysis: {
    id: string;
    resumeId: string;
    matchScore: number;
    createdAt: Date;
    jobPost: { title: string; company: string | null };
  };
}) {
  const t = useTranslations("history");
  const locale = useLocale();
  const isHighMatch = analysis.matchScore >= 90;

  return (
    <div className="flex flex-col justify-between rounded-(--radius-card) border border-track p-6 transition-colors hover:border-accent/40">
      <div>
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="relative size-12">
              <ScoreRing score={analysis.matchScore} size={48} showLabel={false} />
              <span className="absolute inset-0 flex items-center justify-center font-display text-xs font-bold text-accent">
                {analysis.matchScore}
              </span>
            </div>
            {isHighMatch && (
              <span className="rounded-sm border border-accent/20 px-1.5 py-0.5 text-[10px] tracking-tighter text-accent uppercase">
                {t("highMatch")}
              </span>
            )}
          </div>
          <span className="text-xs text-muted">
            {new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", year: "numeric" }).format(
              analysis.createdAt
            )}
          </span>
        </div>
        <h3 className="mb-1 truncate font-display text-lg font-medium text-base-light">
          {analysis.jobPost.title}
        </h3>
        {analysis.jobPost.company && <p className="mb-6 text-sm text-muted">{analysis.jobPost.company}</p>}
      </div>
      <div className="flex items-center justify-between border-t border-track pt-4">
        <Link
          href={`/results/${analysis.id}`}
          className="group flex items-center gap-1 text-xs font-medium tracking-widest text-accent uppercase hover:opacity-80"
        >
          {t("viewAnalysis")}
          <IconChevronRight
            size={14}
            stroke={1.5}
            className="transition-transform group-hover:translate-x-1"
          />
        </Link>
        <DeleteAnalysisButton resumeId={analysis.resumeId} />
      </div>
    </div>
  );
}
