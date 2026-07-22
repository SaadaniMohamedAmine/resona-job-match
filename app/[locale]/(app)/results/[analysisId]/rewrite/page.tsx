"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  IconHistory,
  IconSparkles,
  IconCheck,
  IconDeviceFloppy,
  IconRefresh,
  IconCopy,
} from "@tabler/icons-react";
import { LoaderRing } from "@/components/ui/loader-ring";
import { UpgradePrompt } from "@/components/billing/upgrade-prompt";
import { notify } from "@/lib/toast";

const SECTIONS = ["summary", "experience", "skills"] as const;
type Section = (typeof SECTIONS)[number];

type SectionState = { original: string; rewritten: string };

const EMPTY_STATE: SectionState = { original: "", rewritten: "" };

export default function RewritePage() {
  const t = useTranslations("rewrite");
  const tNotify = useTranslations("notifications");
  const { analysisId } = useParams<{ analysisId: string }>();

  const SECTION_LABELS: Record<Section, string> = {
    summary: t("sectionSummary"),
    experience: t("sectionExperience"),
    skills: t("sectionSkills"),
  };
  const [activeSection, setActiveSection] = useState<Section>("summary");
  const [sections, setSections] = useState<Record<Section, SectionState>>({
    summary: { ...EMPTY_STATE },
    experience: { ...EMPTY_STATE },
    skills: { ...EMPTY_STATE },
  });
  const [applied, setApplied] = useState<Record<Section, boolean>>({
    summary: false,
    experience: false,
    skills: false,
  });
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [proRequired, setProRequired] = useState(false);

  const current = sections[activeSection];

  function setOriginal(value: string) {
    setSections((prev) => ({ ...prev, [activeSection]: { ...prev[activeSection], original: value } }));
    setApplied((prev) => ({ ...prev, [activeSection]: false }));
  }

  function switchTab(section: Section) {
    setActiveSection(section);
    setProRequired(false);
    setCopied(false);
  }

  async function handleGenerate() {
    if (!current.original.trim()) return;
    setLoading(true);
    setProRequired(false);
    try {
      const res = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysisId, section: activeSection, originalText: current.original }),
      });
      const data = await res.json();
      if (res.status === 403) {
        setProRequired(true);
      } else if (!res.ok) {
        notify.error(data.error || tNotify("rewriteFailed"));
      } else {
        setSections((prev) => ({
          ...prev,
          [activeSection]: { ...prev[activeSection], rewritten: data.rewritten },
        }));
        setApplied((prev) => ({ ...prev, [activeSection]: false }));
        notify.success(tNotify("rewriteGenerated"));
      }
    } catch {
      notify.error(tNotify("generic"));
    }
    setLoading(false);
  }

  function handleApply() {
    setSections((prev) => ({
      ...prev,
      [activeSection]: { original: prev[activeSection].rewritten, rewritten: prev[activeSection].rewritten },
    }));
    setApplied((prev) => ({ ...prev, [activeSection]: true }));
    notify.success(tNotify("rewriteApplied"));
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(current.rewritten);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 md:px-16">
      <div className="mb-12">
        <h1 className="font-display text-3xl font-bold text-base-light md:text-4xl">
          {t("pageTitle")}
        </h1>
        <p className="mt-3 max-w-2xl text-muted">{t("pageSubtitle")}</p>
      </div>

      <nav className="mb-8 flex gap-1 border-b border-track">
        {SECTIONS.map((section) => (
          <button
            key={section}
            type="button"
            onClick={() => switchTab(section)}
            className={`border-b-2 px-6 py-3 text-sm transition-colors ${
              activeSection === section
                ? "border-accent font-bold text-accent"
                : "border-transparent text-muted hover:text-accent"
            }`}
          >
            {SECTION_LABELS[section]}
          </button>
        ))}
      </nav>

      <div className="grid grid-cols-1 overflow-hidden rounded-(--radius-card) border border-track bg-track/10 lg:grid-cols-2">
        <div className="border-b border-track p-8 md:p-10 lg:border-r lg:border-b-0">
          <div className="mb-6 flex items-center justify-between">
            <span className="rounded-(--radius-control) bg-track px-3 py-1 text-xs tracking-widest text-muted uppercase">
              {t("sourceOriginal")}
            </span>
            <IconHistory size={18} stroke={1.5} className="text-muted" />
          </div>
          <textarea
            value={current.original}
            onChange={(e) => setOriginal(e.target.value)}
            rows={14}
            placeholder={t("placeholderPrefix", { section: SECTION_LABELS[activeSection].toLowerCase() })}
            className="w-full resize-none bg-transparent text-sm leading-relaxed text-base-light placeholder:text-muted focus:outline-none"
          />
        </div>

        <div className="p-8 md:p-10">
          <div className="mb-6 flex items-center justify-between">
            <span className="rounded-(--radius-control) border border-accent/20 bg-accent/10 px-3 py-1 text-xs tracking-widest text-accent uppercase">
              {t("analysisOptimized")}
            </span>
            <IconSparkles size={18} stroke={1.5} className="text-accent" />
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <LoaderRing size={28} />
            </div>
          ) : proRequired ? (
            <UpgradePrompt feature={t("featureName")} />
          ) : current.rewritten ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-base-light">
              {current.rewritten}
            </p>
          ) : (
            <p className="text-sm text-muted">{t("placeholderResult")}</p>
          )}

          {applied[activeSection] && (
            <div className="mt-8 flex items-center gap-3 rounded-(--radius-control) border border-accent/20 bg-accent/5 p-4">
              <IconCheck size={18} stroke={1.5} className="text-accent" />
              <p className="text-xs text-muted">{t("appliedNotice")}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-10 flex flex-col items-center justify-center gap-4 md:flex-row">
        {current.rewritten && !proRequired ? (
          <>
            <button
              type="button"
              onClick={handleApply}
              className="flex w-full items-center justify-center gap-3 rounded-(--radius-control) bg-accent px-12 py-4 text-sm font-bold text-[var(--color-base)] transition-opacity hover:opacity-90 md:w-auto"
            >
              <IconDeviceFloppy size={18} stroke={1.5} />
              {t("applyCta")}
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              className="flex w-full items-center justify-center gap-3 rounded-(--radius-control) border border-track px-12 py-4 text-sm text-base-light transition-colors hover:bg-track md:w-auto"
            >
              <IconRefresh size={18} stroke={1.5} />
              {t("regenerateCta")}
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="flex w-full items-center justify-center gap-3 rounded-(--radius-control) border border-track px-12 py-4 text-sm text-base-light transition-colors hover:bg-track md:w-auto"
            >
              <IconCopy size={18} stroke={1.5} />
              {copied ? t("copiedCta") : t("copyCta")}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!current.original.trim() || loading}
            className="flex w-full items-center justify-center gap-3 rounded-(--radius-control) bg-accent px-12 py-4 text-sm font-bold text-[var(--color-base)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30 md:w-auto"
          >
            <IconSparkles size={18} stroke={1.5} />
            {loading ? t("generatingCta") : t("generateCta")}
          </button>
        )}
      </div>
    </div>
  );
}
