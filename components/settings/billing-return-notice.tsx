"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { notify } from "@/lib/toast";

export function BillingReturnNotice() {
  const params = useSearchParams();
  const t = useTranslations("notifications");

  useEffect(() => {
    if (params.get("success") === "true") notify.success(t("upgradeSuccess"));
    if (params.get("canceled") === "true") notify.info(t("upgradeCanceled"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
