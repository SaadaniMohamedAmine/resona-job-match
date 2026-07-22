"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export function ChangePasswordDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations("settings");
  const tErrors = useTranslations("errors");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleClose() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess(false);
    onClose();
  }

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError(t("passwordsDontMatch"));
      return;
    }

    setSubmitting(true);
    const res = await fetch("/api/account/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json();
      setError(typeof data.error === "string" ? data.error : tErrors("generic"));
      return;
    }
    setSuccess(true);
  }

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/85 p-4"
      onClick={handleClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="animate-fade-up w-full max-w-sm rounded-(--radius-card) border border-track bg-base p-6"
      >
        <h2 className="mb-6 font-display text-lg font-medium text-base-light">{t("changePasswordTitle")}</h2>

        {success ? (
          <div>
            <p className="text-sm text-muted">{t("passwordUpdatedBody")}</p>
            <button
              type="button"
              onClick={handleClose}
              className="mt-6 w-full rounded-(--radius-control) bg-accent py-2.5 text-sm font-medium text-[var(--color-base)] transition-opacity hover:opacity-90"
            >
              {t("doneCta")}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="password"
              placeholder={t("currentPasswordPlaceholder")}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="rounded-(--radius-control) border border-track bg-transparent px-4 py-2.5 text-sm text-base-light placeholder:text-muted focus:border-accent focus:outline-none"
              required
            />
            <input
              type="password"
              placeholder={t("newPasswordPlaceholder")}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="rounded-(--radius-control) border border-track bg-transparent px-4 py-2.5 text-sm text-base-light placeholder:text-muted focus:border-accent focus:outline-none"
              required
              minLength={8}
            />
            <input
              type="password"
              placeholder={t("confirmPasswordPlaceholder")}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="rounded-(--radius-control) border border-track bg-transparent px-4 py-2.5 text-sm text-base-light placeholder:text-muted focus:border-accent focus:outline-none"
              required
              minLength={8}
            />

            {error && <p className="text-sm text-accent">{error}</p>}

            <div className="mt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-(--radius-control) border border-track px-4 py-2 text-sm text-base-light transition-colors hover:bg-track"
              >
                {t("cancelCta")}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-(--radius-control) bg-accent px-4 py-2 text-sm font-medium text-[var(--color-base)] transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                {submitting ? "..." : t("updatePasswordCta")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
