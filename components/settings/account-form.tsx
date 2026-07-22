"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import {
  IconUser,
  IconLock,
  IconShieldCheck,
  IconBrandGoogle,
} from "@tabler/icons-react";
import { ChangePasswordDialog } from "@/components/settings/change-password-dialog";
import { notify } from "@/lib/toast";

export function AccountForm({
  initialName,
  email,
  initialBio,
  hasPassword,
}: {
  initialName: string;
  email: string;
  initialBio: string;
  hasPassword: boolean;
}) {
  const t = useTranslations("settings");
  const tNotify = useTranslations("notifications");
  const [name, setName] = useState(initialName);
  const [bio, setBio] = useState(initialBio);
  const [saving, setSaving] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, bio }),
    });
    setSaving(false);
    if (res.ok) {
      notify.success(tNotify("profileUpdated"));
    } else {
      notify.error(tNotify("generic"));
    }
  }

  return (
    <section className="space-y-12 lg:col-span-8">
      {/* Profile Identity */}
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <IconUser size={20} stroke={1.5} className="text-accent" />
          <h2 className="font-display text-xl font-medium text-base-light">{t("profileIdentity")}</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="ml-1 text-xs tracking-widest text-muted uppercase">{t("fullNameLabel")}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-(--radius-control) border border-track bg-transparent px-4 py-3 text-sm text-base-light transition-colors focus:border-accent focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="ml-1 text-xs tracking-widest text-muted uppercase">{t("primaryEmailLabel")}</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full cursor-not-allowed rounded-(--radius-control) border border-track bg-transparent px-4 py-3 text-sm text-muted opacity-60"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="ml-1 text-xs tracking-widest text-muted uppercase">
            {t("bioLabel")}
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            maxLength={500}
            className="w-full resize-none rounded-(--radius-control) border border-track bg-transparent px-4 py-3 text-sm text-base-light transition-colors focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      {/* Security & Access */}
      <div className="space-y-8 border-t border-track pt-12">
        <div className="flex items-center gap-4">
          <IconLock size={20} stroke={1.5} className="text-accent" />
          <h2 className="font-display text-xl font-medium text-base-light">{t("securityAccess")}</h2>
        </div>

        {hasPassword ? (
          <div className="flex flex-col items-start justify-between gap-6 rounded-(--radius-card) border border-track bg-track/20 p-8 md:flex-row md:items-center">
            <div>
              <h3 className="mb-1 font-medium text-base-light">{t("passwordAuthTitle")}</h3>
              <p className="text-sm text-muted">{t("passwordAuthBody")}</p>
            </div>
            <button
              type="button"
              onClick={() => setPasswordDialogOpen(true)}
              className="rounded-(--radius-control) border border-accent px-6 py-2.5 text-sm whitespace-nowrap text-accent transition-colors hover:bg-accent/10"
            >
              {t("changePasswordCta")}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-(--radius-card) border border-track bg-track/20 p-8">
            <IconBrandGoogle size={20} />
            <p className="text-sm text-muted">{t("googleSignInBody")}</p>
          </div>
        )}

        <div className="flex items-start gap-3 rounded-(--radius-control) border border-accent/20 bg-accent/5 p-4">
          <IconShieldCheck size={20} stroke={1.5} className="text-accent" />
          <div className="text-sm text-muted">
            <strong className="font-medium text-accent">
              {hasPassword ? t("passwordEnabledNotice") : t("googleOAuthNotice")}
            </strong>{" "}
            {hasPassword ? t("passwordHashedNotice") : t("googleVerifiedNotice")}
          </div>
        </div>
      </div>

      {/* Session Management */}
      <div className="flex flex-col items-start justify-between gap-8 border-t border-track pt-12 md:flex-row md:items-center">
        <div className="space-y-1">
          <h2 className="font-display text-xl font-medium text-base-light">{t("sessionManagement")}</h2>
          <p className="text-sm text-muted">{t("sessionManagementBody")}</p>
        </div>
        <div className="flex w-full gap-4 md:w-auto">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 rounded-(--radius-control) bg-accent px-8 py-3 text-sm font-bold text-[var(--color-base)] transition-opacity hover:opacity-90 disabled:opacity-40 md:flex-none"
          >
            {saving ? t("savingCta") : t("saveChangesCta")}
          </button>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex-1 rounded-(--radius-control) border border-track px-8 py-3 text-sm text-base-light transition-colors hover:bg-track md:flex-none"
          >
            {t("signOut")}
          </button>
        </div>
      </div>

      <ChangePasswordDialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} />
    </section>
  );
}
