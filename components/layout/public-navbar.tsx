import Link from "next/link";
import { useTranslations } from "next-intl";
import { Wordmark } from "@/components/ui/wordmark";
import { SectionNavLink } from "@/components/layout/section-nav-link";
import { LanguageDropdown } from "@/components/language-dropdown";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { CommandPaletteTrigger } from "@/components/layout/command-palette-trigger";

export function PublicNavbar({
  locale,
  user,
}: {
  locale?: string;
  user?: { name?: string | null; email?: string | null; image?: string | null } | null;
}) {
  const t = useTranslations("nav");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-track bg-base">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 md:px-16">
        <Link href="/">
          <Wordmark />
        </Link>
        <div className="hidden items-center gap-8 text-sm text-muted md:flex">
          <SectionNavLink sectionId="features" className="transition-colors hover:text-accent">
            {t("functionalities")}
          </SectionNavLink>
          <SectionNavLink sectionId="process" className="transition-colors hover:text-accent">
            {t("process")}
          </SectionNavLink>
          <Link href="/pricing" className="transition-colors hover:text-accent">
            {t("pricing")}
          </Link>
        </div>
        {user ? (
          <div className="flex items-center gap-4">
            <CommandPaletteTrigger label={t("openCommandPalette")} />
            <div className="hidden items-center gap-4 md:flex">
              <LanguageDropdown currentLocale={locale!} />
              <ThemeToggle />
            </div>
            <Link
              href="/dashboard"
              className="rounded-(--radius-control) bg-accent px-6 py-2 text-sm font-bold text-[var(--color-base)] transition-opacity hover:opacity-90"
            >
              {t("dashboardCta")}
            </Link>
            <UserMenu {...user} />
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <CommandPaletteTrigger label={t("openCommandPalette")} />
            <Link href="/login" className="text-sm font-medium text-accent transition-colors hover:opacity-80">
              {t("signIn")}
            </Link>
            <Link
              href="/upload"
              className="rounded-(--radius-control) bg-accent px-6 py-2 text-sm font-bold text-[var(--color-base)] transition-opacity hover:opacity-90"
            >
              {t("analyzeCta")}
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
