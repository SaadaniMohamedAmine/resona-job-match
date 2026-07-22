"use client";

import { useEffect } from "react";
import { IconX } from "@tabler/icons-react";
import { Wordmark } from "@/components/ui/wordmark";

export function MobileDrawer({
  open,
  onClose,
  closeLabel,
  children,
}: {
  open: boolean;
  onClose: () => void;
  closeLabel: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <div
      className={`fixed inset-0 z-100 md:hidden ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`absolute top-0 right-0 flex h-full w-full max-w-xs flex-col border-l border-track bg-base transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-track px-5 py-4">
          <Wordmark />
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="rounded-full p-1.5 text-muted transition-colors hover:bg-track hover:text-base-light"
          >
            <IconX size={20} stroke={1.5} />
          </button>
        </div>
        <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-5 py-6">{children}</div>
      </div>
    </div>
  );
}
