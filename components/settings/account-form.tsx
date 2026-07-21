"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import {
  IconUser,
  IconLock,
  IconShieldCheck,
  IconBrandGoogle,
} from "@tabler/icons-react";
import { ChangePasswordDialog } from "@/components/settings/change-password-dialog";

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
  const [name, setName] = useState(initialName);
  const [bio, setBio] = useState(initialBio);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  async function handleSave() {
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, bio }),
    });
    setSaving(false);
    setMessage(res.ok ? "Changes saved." : "Something went wrong. Please try again.");
  }

  return (
    <section className="space-y-12 lg:col-span-8">
      {/* Profile Identity */}
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <IconUser size={20} stroke={1.5} className="text-accent" />
          <h2 className="font-display text-xl font-medium text-base-light">Profile Identity</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="ml-1 text-xs tracking-widest text-muted uppercase">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-(--radius-control) border border-track bg-transparent px-4 py-3 text-sm text-base-light transition-colors focus:border-accent focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="ml-1 text-xs tracking-widest text-muted uppercase">Primary Email</label>
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
            Bio / Professional Summary
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
          <h2 className="font-display text-xl font-medium text-base-light">Security &amp; Access</h2>
        </div>

        {hasPassword ? (
          <div className="flex flex-col items-start justify-between gap-6 rounded-(--radius-card) border border-track bg-track/20 p-8 md:flex-row md:items-center">
            <div>
              <h3 className="mb-1 font-medium text-base-light">Password Authentication</h3>
              <p className="text-sm text-muted">Sign in with your email and password.</p>
            </div>
            <button
              type="button"
              onClick={() => setPasswordDialogOpen(true)}
              className="rounded-(--radius-control) border border-accent px-6 py-2.5 text-sm whitespace-nowrap text-accent transition-colors hover:bg-accent/10"
            >
              Change Password
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-(--radius-card) border border-track bg-track/20 p-8">
            <IconBrandGoogle size={20} />
            <p className="text-sm text-muted">
              You sign in with Google. There&apos;s no password to manage for this account.
            </p>
          </div>
        )}

        <div className="flex items-start gap-3 rounded-(--radius-control) border border-accent/20 bg-accent/5 p-4">
          <IconShieldCheck size={20} stroke={1.5} className="text-accent" />
          <div className="text-sm text-muted">
            <strong className="font-medium text-accent">
              {hasPassword ? "Password authentication enabled." : "Signed in via Google OAuth."}
            </strong>{" "}
            {hasPassword
              ? "Your password is securely hashed and never stored in plain text."
              : "Your identity is verified by Google — no password is stored on our servers."}
          </div>
        </div>
      </div>

      {/* Session Management */}
      <div className="flex flex-col items-start justify-between gap-8 border-t border-track pt-12 md:flex-row md:items-center">
        <div className="space-y-1">
          <h2 className="font-display text-xl font-medium text-base-light">Session Management</h2>
          <p className="text-sm text-muted">
            Save your profile changes, or log out of this device.
          </p>
          {message && <p className="text-sm text-accent">{message}</p>}
        </div>
        <div className="flex w-full gap-4 md:w-auto">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 rounded-(--radius-control) bg-accent px-8 py-3 text-sm font-bold text-[var(--color-base)] transition-opacity hover:opacity-90 disabled:opacity-40 md:flex-none"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex-1 rounded-(--radius-control) border border-track px-8 py-3 text-sm text-base-light transition-colors hover:bg-track md:flex-none"
          >
            Sign Out
          </button>
        </div>
      </div>

      <ChangePasswordDialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} />
    </section>
  );
}
