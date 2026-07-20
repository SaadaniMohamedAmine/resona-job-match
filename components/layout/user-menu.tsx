"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { IconChevronDown } from "@tabler/icons-react";

export function UserMenu({
  name,
  email,
  image,
}: {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const initial = (name ?? email ?? "?").charAt(0).toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open user menu"
        className="flex items-center gap-2"
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element -- external OAuth avatar URL, no remote-image config needed for a plain img
          <img src={image} alt="" className="size-9 rounded-full border border-track object-cover" />
        ) : (
          <span className="flex size-9 items-center justify-center rounded-full border border-track bg-track/40 text-sm font-medium text-accent">
            {initial}
          </span>
        )}
        <IconChevronDown
          size={16}
          stroke={1.5}
          className={`text-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-48 rounded-(--radius-control) border border-track bg-base py-1">
          <Link
            href="/settings/account"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-base-light hover:bg-track"
          >
            Paramètres
          </Link>
          <Link
            href="/settings/billing"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-base-light hover:bg-track"
          >
            Facturation
          </Link>
          <div className="my-1 h-px bg-track" />
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="block w-full px-4 py-2 text-left text-sm text-muted hover:bg-track"
          >
            Déconnexion
          </button>
        </div>
      )}
    </div>
  );
}
