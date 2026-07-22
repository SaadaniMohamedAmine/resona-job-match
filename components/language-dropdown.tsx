"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { IconChevronDown } from "@tabler/icons-react";
import { locales } from "@/i18n/request";

const LANGUAGES: Record<string, { label: string; flag: string }> = {
  en: { label: "English", flag: "gb" },
  fr: { label: "Français", flag: "fr" },
};

export function LanguageDropdown({ currentLocale }: { currentLocale: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const current = LANGUAGES[currentLocale] ?? LANGUAGES.en;

  function switchTo(code: string) {
    const newPath = pathname.replace(new RegExp(`^/${currentLocale}(?=/|$)`), `/${code}`);
    router.push(newPath === pathname ? `/${code}${pathname}` : newPath);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Change language"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-(--radius-control) border border-track px-3 py-1.5 text-xs text-muted transition-colors hover:text-accent"
      >
        <span className={`fi fi-${current.flag} rounded-[2px]`} />
        {currentLocale.toUpperCase()}
        <IconChevronDown size={14} stroke={1.5} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-36 overflow-hidden rounded-(--radius-control) border border-track bg-base py-1 shadow-lg">
          {locales.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => switchTo(code)}
              className={`flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors hover:bg-track ${
                code === currentLocale ? "text-accent" : "text-base-light"
              }`}
            >
              <span className={`fi fi-${LANGUAGES[code].flag} rounded-[2px]`} />
              {LANGUAGES[code].label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
