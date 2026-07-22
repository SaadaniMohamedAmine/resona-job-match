"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { notify } from "@/lib/toast";

export function BillingReturnNotice({ subscriptionJustCanceled }: { subscriptionJustCanceled?: boolean }) {
  const params = useSearchParams();
  const t = useTranslations("notifications");

  useEffect(() => {
    if (params.get("success") === "true") notify.success(t("upgradeSuccess"));
    if (params.get("canceled") === "true") notify.info(t("upgradeCanceled"));
    if (subscriptionJustCanceled) notify.info(t("subscriptionCanceled"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
