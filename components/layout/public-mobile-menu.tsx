"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { IconMenu2 } from "@tabler/icons-react";
import { LanguageDropdown } from "@/components/language-dropdown";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { SectionNavLink } from "@/components/layout/section-nav-link";
import { MobileDrawer } from "@/components/layout/mobile-drawer";

export function PublicMobileMenu({
  locale,
  user,
}: {
  locale: string;
  user?: { name?: string | null; email?: string | null; image?: string | null } | null;
}) {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-muted md:hidden"
        aria-label={t("toggleMenu")}
      >
        <IconMenu2 size={22} stroke={1.5} />
      </button>

      <MobileDrawer open={open} onClose={close} closeLabel={t("closeMenu")}>
        <nav className="flex flex-col gap-1">
          <SectionNavLink
            sectionId="features"
            onClick={close}
            className="rounded-(--radius-control) px-3 py-2.5 text-sm text-muted transition-colors hover:text-accent"
          >
            {t("functionalities")}
          </SectionNavLink>
          <SectionNavLink
            sectionId="process"
            onClick={close}
            className="rounded-(--radius-control) px-3 py-2.5 text-sm text-muted transition-colors hover:text-accent"
          >
            {t("process")}
          </SectionNavLink>
          <Link
            href="/pricing"
            onClick={close}
            className="rounded-(--radius-control) px-3 py-2.5 text-sm text-muted transition-colors hover:text-accent"
          >
            {t("pricing")}
          </Link>
        </nav>

        <div className="mt-4 flex items-center gap-4 border-t border-track pt-4">
          <LanguageDropdown currentLocale={locale} />
          <ThemeToggle />
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-track pt-4">
          {user ? (
            <Link
              href="/dashboard"
              onClick={close}
              className="rounded-(--radius-control) bg-accent px-4 py-2.5 text-center text-sm font-bold text-[var(--color-base)] transition-opacity hover:opacity-90"
            >
              {t("dashboardCta")}
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                onClick={close}
                className="rounded-(--radius-control) border border-track px-4 py-2.5 text-center text-sm font-medium text-accent transition-colors hover:bg-track"
              >
                {t("signIn")}
              </Link>
              <Link
                href="/upload"
                onClick={close}
                className="rounded-(--radius-control) bg-accent px-4 py-2.5 text-center text-sm font-bold text-[var(--color-base)] transition-opacity hover:opacity-90"
              >
                {t("analyzeCta")}
              </Link>
            </>
          )}
        </div>
      </MobileDrawer>
    </>
  );
}
