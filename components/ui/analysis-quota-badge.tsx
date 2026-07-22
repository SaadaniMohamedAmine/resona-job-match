"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { IconBolt } from "@tabler/icons-react";

export function AnalysisQuotaBadge({
  plan,
  remaining,
  limit,
}: {
  plan: "FREE" | "PRO";
  remaining: number;
  limit: number;
}) {
  const t = useTranslations("settings");

  return (
    <div className="flex flex-col items-center gap-3 rounded-(--radius-control) border border-track px-4 py-3 text-sm sm:flex-row sm:justify-between">
      <div className="flex items-center gap-2 text-muted">
        <IconBolt size={16} stroke={1.5} className="text-accent" />
        <span>
          {t.rich("quotaRemaining", {
            b: (chunks) => <span className="font-medium text-base-light">{chunks}</span>,
            remaining,
            limit,
            plan: plan === "PRO" ? t("planPro") : t("planFree"),
          })}
        </span>
      </div>
      {plan === "FREE" && remaining === 0 && (
        <Link href="/pricing" className="text-xs font-medium text-accent hover:underline">
          {t("upgradeToPro")}
        </Link>
      )}
    </div>
  );
}
