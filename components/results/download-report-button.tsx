"use client";

import { useTranslations } from "next-intl";
import { IconDownload } from "@tabler/icons-react";
import { notify } from "@/lib/toast";

type Suggestion = { section: string; issue: string; recommendation: string };

export function DownloadReportButton({
  fileName,
  jobTitle,
  company,
  matchScore,
  matchingSkills,
  missingSkills,
  suggestions,
}: {
  fileName: string;
  jobTitle: string;
  company: string | null;
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  suggestions: Suggestion[];
}) {
  const t = useTranslations("results");
  const tNotify = useTranslations("notifications");

  function handleDownload() {
    const noneIdentified = `  ${t("noneIdentified")}`;
    const lines = [
      t("reportTitle"),
      t("reportResume", { fileName }),
      t("reportTargetRole", { jobTitle: company ? `${jobTitle} — ${company}` : jobTitle }),
      ``,
      t("reportMatchScore", { score: matchScore }),
      ``,
      t("reportMatchingSkills"),
      ...(matchingSkills.length ? matchingSkills.map((s) => `  - ${s}`) : [noneIdentified]),
      ``,
      t("reportMissingSkills"),
      ...(missingSkills.length ? missingSkills.map((s) => `  - ${s}`) : [noneIdentified]),
      ``,
      t("reportRecommendations"),
      ...(suggestions.length
        ? suggestions.flatMap((s) => [
            `  [${s.section}] ${s.issue}`,
            `    → ${s.recommendation}`,
          ])
        : [`  ${t("reportNone")}`]),
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resona-report-${fileName.replace(/\.pdf$/i, "")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    notify.success(tNotify("resumeDownloaded"));
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      className="inline-flex items-center gap-1 text-left text-xs font-medium text-accent hover:underline"
    >
      {t("downloadReport")}
      <IconDownload size={14} stroke={1.5} />
    </button>
  );
}
