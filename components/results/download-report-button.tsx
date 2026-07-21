"use client";

import { IconDownload } from "@tabler/icons-react";

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
  function handleDownload() {
    const lines = [
      `Résona Analysis Report`,
      `Resume: ${fileName}`,
      `Target role: ${jobTitle}${company ? ` — ${company}` : ""}`,
      ``,
      `Match score: ${matchScore}%`,
      ``,
      `Matching skills:`,
      ...(matchingSkills.length ? matchingSkills.map((s) => `  - ${s}`) : ["  None identified"]),
      ``,
      `Missing skills:`,
      ...(missingSkills.length ? missingSkills.map((s) => `  - ${s}`) : ["  None identified"]),
      ``,
      `Recommendations:`,
      ...(suggestions.length
        ? suggestions.flatMap((s) => [
            `  [${s.section}] ${s.issue}`,
            `    → ${s.recommendation}`,
          ])
        : ["  None"]),
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resona-report-${fileName.replace(/\.pdf$/i, "")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      className="inline-flex items-center gap-1 text-left text-xs font-medium text-accent hover:underline"
    >
      Download full report
      <IconDownload size={14} stroke={1.5} />
    </button>
  );
}
