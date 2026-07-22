"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { IconLock, IconEdit, IconSparkles, IconCircleCheck, IconAlertCircle } from "@tabler/icons-react";
import { ScoreRing } from "@/components/ui/score-ring";
import { SkillTag } from "@/components/ui/skill-tag";
import { LoaderRing } from "@/components/ui/loader-ring";
import { DEMO_SAMPLES } from "@/lib/ai/demo-samples";
import { DemoFilters, type MatchTier } from "@/components/demo/demo-filters";
import { DemoPagination } from "@/components/demo/demo-pagination";

const PAGE_SIZE = 6;

type Result = {
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  semanticSimilarity: number;
  sample: { jobTitle: string; company?: string };
};

const MATCH_HINT_KEY = {
  strong: "matchHintStrong",
  partial: "matchHintPartial",
  weak: "matchHintWeak",
} as const;

export default function DemoPage() {
  const t = useTranslations("demo");
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  const [query, setQuery] = useState("");
  const [tier, setTier] = useState<MatchTier>("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DEMO_SAMPLES.filter((sample) => {
      const matchesQuery =
        !q ||
        sample.label.toLowerCase().includes(q) ||
        sample.jobTitle.toLowerCase().includes(q) ||
        sample.company.toLowerCase().includes(q);
      const matchesTier = !tier || sample.matchHint === tier;
      return matchesQuery && matchesTier;
    });
  }, [query, tier]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleQueryChange(value: string) {
    setQuery(value);
    setPage(1);
  }

  function handleTierChange(value: MatchTier) {
    setTier(value);
    setPage(1);
  }

  async function runDemo(sampleId: string) {
    setSelected(sampleId);
    setLoading(true);
    setError("");
    setResult(null);
    const res = await fetch("/api/demo-analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sampleId }),
    });
    if (!res.ok) {
      setError(res.status === 429 ? t("limitReached") : t("demoUnavailable"));
      setLoading(false);
      return;
    }
    setResult(await res.json());
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-24 md:px-16">
      <div className="mb-16 text-center">
        <h1 className="font-display text-3xl font-bold text-base-light">{t("title")}</h1>
        <p className="mx-auto mt-3 max-w-xl text-muted">{t("subtitle")}</p>
      </div>

      <DemoFilters query={query} onQueryChange={handleQueryChange} tier={tier} onTierChange={handleTierChange} />

      {pageItems.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted">{t("noResults")}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pageItems.map((sample) => (
            <button
              key={sample.id}
              onClick={() => runDemo(sample.id)}
              disabled={loading}
              className={`rounded-(--radius-card) border p-6 text-left transition-colors disabled:opacity-50 ${
                selected === sample.id ? "border-accent bg-track/30" : "border-track hover:border-accent/40"
              }`}
            >
              <p className="font-display text-lg font-medium text-base-light">{sample.label}</p>
              <p className="mt-1 text-sm text-muted">
                {t("vsPrefix", { jobTitle: sample.jobTitle, company: sample.company })}
              </p>
              <span className="mt-3 inline-block text-xs tracking-widest text-accent uppercase">
                {t(MATCH_HINT_KEY[sample.matchHint])}
              </span>
            </button>
          ))}
        </div>
      )}

      <DemoPagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />

      {loading && (
        <div className="flex flex-col items-center gap-4 py-16">
          <LoaderRing size={32} />
          <p className="text-sm text-muted">{t("runningAnalysis")}</p>
        </div>
      )}

      {error && <p className="text-center text-sm text-accent">{error}</p>}

      {result && !loading && (
        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="flex flex-col gap-8 lg:col-span-8">
            <section className="flex flex-col items-center rounded-(--radius-card) border border-track bg-track/20 p-10 text-center">
              <ScoreRing score={result.matchScore} size={140} />
              <p className="mt-4 text-xs tracking-widest text-muted uppercase">
                {t("semanticSimilarityPrefix", { pct: Math.round(result.semanticSimilarity * 100) })}
              </p>
            </section>

            <section className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              <div className="rounded-(--radius-card) border border-track bg-track/20 p-6">
                <div className="mb-4 flex items-center gap-2">
                  <IconCircleCheck size={18} stroke={1.5} className="text-accent" />
                  <h3 className="font-display text-base font-medium text-base-light">
                    {t("matchingSkillsTitle")}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.matchingSkills.map((s) => (
                    <SkillTag key={s} label={s} variant="match" />
                  ))}
                </div>
              </div>
              <div className="rounded-(--radius-card) border border-track bg-track/20 p-6">
                <div className="mb-4 flex items-center gap-2">
                  <IconAlertCircle size={18} stroke={1.5} className="text-accent" />
                  <h3 className="font-display text-base font-medium text-base-light">
                    {t("missingSkillsTitle")}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.missingSkills.map((s) => (
                    <SkillTag key={s} label={s} variant="gap" />
                  ))}
                </div>
              </div>
            </section>
          </div>

          <aside className="lg:col-span-4">
            <div className="relative overflow-hidden rounded-(--radius-card) border border-track bg-track/20 p-8">
              <div className="pointer-events-none absolute inset-0 backdrop-blur-sm" />
              <div className="relative flex flex-col items-center gap-4 text-center">
                <IconLock size={28} stroke={1.5} className="text-accent" />
                <p className="font-display text-lg font-medium text-base-light">{t("unlockTitle")}</p>
                <p className="text-sm text-muted">{t("unlockBody")}</p>
                <Link
                  href="/sign-up"
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-(--radius-control) bg-accent py-3.5 text-sm font-bold text-[var(--color-base)] transition-opacity hover:opacity-90"
                >
                  <IconEdit size={16} stroke={1.5} />
                  {t("createAccountCta")}
                </Link>
                <Link
                  href="/upload"
                  className="flex w-full items-center justify-center gap-2 rounded-(--radius-control) border border-accent py-3.5 text-sm font-bold text-accent transition-colors hover:bg-accent/5"
                >
                  <IconSparkles size={16} stroke={1.5} />
                  {t("analyzeOwnCta")}
                </Link>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
