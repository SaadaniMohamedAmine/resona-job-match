"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { IconBell } from "@tabler/icons-react";
import { ToggleSwitch } from "@/components/ui/toggle-switch";

type Preferences = {
  notifyAnalysisComplete: boolean;
  notifyWeeklyDigest: boolean;
  notifyApplicationReminders: boolean;
  notifyProductUpdates: boolean;
};

export function NotificationsForm({ initialPreferences }: { initialPreferences: Preferences }) {
  const t = useTranslations("settings");
  const tErrors = useTranslations("errors");
  const [preferences, setPreferences] = useState(initialPreferences);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const ROWS: { key: keyof Preferences; label: string; description: string }[] = [
    {
      key: "notifyAnalysisComplete",
      label: t("notifAnalysisCompleteLabel"),
      description: t("notifAnalysisCompleteDesc"),
    },
    {
      key: "notifyWeeklyDigest",
      label: t("notifWeeklyDigestLabel"),
      description: t("notifWeeklyDigestDesc"),
    },
    {
      key: "notifyApplicationReminders",
      label: t("notifApplicationRemindersLabel"),
      description: t("notifApplicationRemindersDesc"),
    },
    {
      key: "notifyProductUpdates",
      label: t("notifProductUpdatesLabel"),
      description: t("notifProductUpdatesDesc"),
    },
  ];

  async function handleSave() {
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/account/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(preferences),
    });
    setSaving(false);
    setMessage(res.ok ? t("changesSaved") : tErrors("generic"));
  }

  return (
    <section className="space-y-12 lg:col-span-8">
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <IconBell size={20} stroke={1.5} className="text-accent" />
          <h2 className="font-display text-xl font-medium text-base-light">{t("emailNotifications")}</h2>
        </div>

        <div className="divide-y divide-track rounded-(--radius-card) border border-track bg-track/20">
          {ROWS.map((row) => (
            <div key={row.key} className="flex items-center justify-between gap-6 p-6">
              <div>
                <h3 className="mb-1 font-medium text-base-light">{row.label}</h3>
                <p className="text-sm text-muted">{row.description}</p>
              </div>
              <ToggleSwitch
                checked={preferences[row.key]}
                onChange={(checked) => setPreferences((prev) => ({ ...prev, [row.key]: checked }))}
                label={row.label}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-start justify-between gap-8 border-t border-track pt-12 md:flex-row md:items-center">
        <div className="space-y-1">
          <h2 className="font-display text-xl font-medium text-base-light">{t("savePreferences")}</h2>
          <p className="text-sm text-muted">{t("savePreferencesBody")}</p>
          {message && <p className="text-sm text-accent">{message}</p>}
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-(--radius-control) bg-accent px-8 py-3 text-sm font-bold text-[var(--color-base)] transition-opacity hover:opacity-90 disabled:opacity-40 md:w-auto"
        >
          {saving ? t("savingCta") : t("saveChangesCta")}
        </button>
      </div>
    </section>
  );
}
