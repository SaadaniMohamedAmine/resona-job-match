"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
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
import { LanguageDropdown } from "@/components/language-dropdown";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";

export function AppNavbar({
  locale,
  user,
}: {
  locale: string;
  user: { name?: string | null; email?: string | null; image?: string | null };
}) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NAV_ITEMS = [
    { href: "/dashboard", label: t("dashboard"), icon: IconLayoutDashboard },
    { href: "/upload", label: t("analyze"), icon: IconUpload },
    { href: "/resumes", label: t("history"), icon: IconHistory },
    { href: "/tracker", label: t("tracker"), icon: IconLayoutKanban },
    { href: "/settings/account", label: t("settings"), icon: IconSettings },
  ];

  function isActive(href: string) {
    const localePath = pathname.replace(new RegExp(`^/${locale}(?=/|$)`), "") || "/";
    if (href.startsWith("/settings")) return localePath.startsWith("/settings");
    return localePath === href || localePath.startsWith(`${href}/`);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-track bg-base print:hidden">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 md:px-16">
        <div className="flex items-center gap-8">
          <Link href="/">
            <Wordmark />
          </Link>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`border-b-2 pb-0.5 transition-colors ${
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
            <LanguageDropdown currentLocale={locale} />
            <ThemeToggle />
          </div>
          <UserMenu {...user} />
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="text-muted md:hidden"
            aria-label={t("toggleMenu")}
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
            <LanguageDropdown currentLocale={locale} />
            <ThemeToggle />
          </div>
        </nav>
      )}
    </header>
  );
}
