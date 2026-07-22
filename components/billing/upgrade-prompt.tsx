"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { IconCrown } from "@tabler/icons-react";

export function UpgradePrompt({
  feature,
  description,
}: {
  feature: string;
  description?: string;
}) {
  const t = useTranslations("errors");
  const tUpload = useTranslations("upload");

  return (
    <div className="flex flex-col items-center gap-4 rounded-(--radius-card) border border-accent/20 bg-accent/5 p-8 text-center">
      <div className="flex size-12 items-center justify-center rounded-full border border-accent/30 bg-accent/10 text-accent">
        <IconCrown size={22} stroke={1.5} />
      </div>
      <div>
        <p className="font-display text-lg font-medium text-base-light">
          {t("upgradeRequired", { feature })}
        </p>
        <p className="mt-1 text-sm text-muted">{description ?? t("upgradeRequiredBody")}</p>
      </div>
      <Link
        href="/pricing"
        className="rounded-(--radius-control) bg-accent px-6 py-2.5 text-sm font-medium text-[var(--color-base)] transition-opacity hover:opacity-90"
      >
        {tUpload("viewPlans")}
      </Link>
    </div>
  );
}
