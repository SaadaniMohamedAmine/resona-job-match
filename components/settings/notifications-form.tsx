"use client";

import { useState } from "react";
import { IconBell } from "@tabler/icons-react";
import { ToggleSwitch } from "@/components/ui/toggle-switch";

type Preferences = {
  notifyAnalysisComplete: boolean;
  notifyWeeklyDigest: boolean;
  notifyApplicationReminders: boolean;
  notifyProductUpdates: boolean;
};

const ROWS: { key: keyof Preferences; label: string; description: string }[] = [
  {
    key: "notifyAnalysisComplete",
    label: "Analysis complete",
    description: "Get notified as soon as a resume analysis finishes processing.",
  },
  {
    key: "notifyWeeklyDigest",
    label: "Weekly digest",
    description: "A weekly summary of your match scores and application activity.",
  },
  {
    key: "notifyApplicationReminders",
    label: "Application reminders",
    description: "Reminders to follow up on applications you've marked as applied.",
  },
  {
    key: "notifyProductUpdates",
    label: "Product updates",
    description: "Occasional news about new Résona features and improvements.",
  },
];

export function NotificationsForm({ initialPreferences }: { initialPreferences: Preferences }) {
  const [preferences, setPreferences] = useState(initialPreferences);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSave() {
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/account/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(preferences),
    });
    setSaving(false);
    setMessage(res.ok ? "Changes saved." : "Something went wrong. Please try again.");
  }

  return (
    <section className="space-y-12 lg:col-span-8">
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <IconBell size={20} stroke={1.5} className="text-accent" />
          <h2 className="font-display text-xl font-medium text-base-light">Email Notifications</h2>
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
          <h2 className="font-display text-xl font-medium text-base-light">Save Preferences</h2>
          <p className="text-sm text-muted">Changes apply to future notifications only.</p>
          {message && <p className="text-sm text-accent">{message}</p>}
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-(--radius-control) bg-accent px-8 py-3 text-sm font-bold text-[var(--color-base)] transition-opacity hover:opacity-90 disabled:opacity-40 md:w-auto"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </section>
  );
}
