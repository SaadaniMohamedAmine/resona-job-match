"use client";

import { useSession, signOut } from "next-auth/react";
import { Wordmark } from "@/components/ui/wordmark";

export default function AccountSettingsPage() {
  const { data: session } = useSession();

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="mb-8 flex justify-center">
        <Wordmark />
      </div>
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-xs text-[var(--color-muted)]">Name</label>
          <input
            defaultValue={session?.user?.name ?? ""}
            className="mt-1 w-full rounded-[var(--radius-control)] border border-[var(--color-track)] bg-transparent px-4 py-2.5 text-sm text-[var(--color-base-light)]"
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="text-xs text-[var(--color-muted)]">Email</label>
          <input
            defaultValue={session?.user?.email ?? ""}
            disabled
            className="mt-1 w-full rounded-[var(--radius-control)] border border-[var(--color-track)] bg-transparent px-4 py-2.5 text-sm text-[var(--color-base-light)] opacity-60"
          />
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="mt-4 self-start rounded-[var(--radius-control)] border border-[var(--color-track)] px-4 py-2 text-sm text-[var(--color-base-light)] transition-opacity hover:opacity-90"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
