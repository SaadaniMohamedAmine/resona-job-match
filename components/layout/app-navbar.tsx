"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconLayoutDashboard,
  IconUpload,
  IconHistory,
  IconLayoutKanban,
  IconSettings,
  IconMenu2,
  IconX,
} from "@tabler/icons-react";
import { Wordmark } from "@/components/ui/wordmark";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: IconLayoutDashboard },
  { href: "/upload", label: "Analyser", icon: IconUpload },
  { href: "/resumes", label: "Historique", icon: IconHistory },
  { href: "/tracker", label: "Suivi candidatures", icon: IconLayoutKanban },
  { href: "/settings/account", label: "Paramètres", icon: IconSettings },
];

export function AppNavbar({
  locale,
  user,
}: {
  locale: string;
  user: { name?: string | null; email?: string | null; image?: string | null };
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-track bg-base">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 md:px-16">
        <div className="flex items-center gap-8">
          <Link href="/dashboard">
            <Wordmark />
          </Link>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`border-b-2 pb-[2px] transition-colors ${
                  isActive(item.href)
                    ? "border-accent text-accent"
                    : "border-transparent text-muted hover:text-accent"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-4 md:flex">
            <LanguageSwitcher currentLocale={locale} />
            <ThemeToggle />
          </div>
          <UserMenu {...user} />
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="text-muted md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <IconX size={22} stroke={1.5} /> : <IconMenu2 size={22} stroke={1.5} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="flex flex-col gap-1 border-t border-track px-5 py-4 md:hidden">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`rounded-(--radius-control) px-3 py-2 text-sm ${
                isActive(item.href) ? "bg-track text-accent" : "text-muted"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-2 flex items-center gap-4 border-t border-track px-3 pt-4">
            <LanguageSwitcher currentLocale={locale} />
            <ThemeToggle />
          </div>
        </nav>
      )}
    </header>
  );
}
