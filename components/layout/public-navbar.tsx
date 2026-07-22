import Link from "next/link";
import { Wordmark } from "@/components/ui/wordmark";
import { SectionNavLink } from "@/components/layout/section-nav-link";
import { LanguageDropdown } from "@/components/language-dropdown";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";

export function PublicNavbar({
  locale,
  user,
}: {
  locale?: string;
  user?: { name?: string | null; email?: string | null; image?: string | null } | null;
}) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-track bg-base">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 md:px-16">
        <Link href="/">
          <Wordmark />
        </Link>
        <div className="hidden items-center gap-8 text-sm text-muted md:flex">
          <SectionNavLink sectionId="features" className="transition-colors hover:text-accent">
            Functionalities
          </SectionNavLink>
          <SectionNavLink sectionId="process" className="transition-colors hover:text-accent">
            Process
          </SectionNavLink>
          <Link href="/pricing" className="transition-colors hover:text-accent">
            Pricing
          </Link>
        </div>
        {user ? (
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-4 md:flex">
              <LanguageDropdown currentLocale={locale!} />
              <ThemeToggle />
            </div>
            <Link
              href="/dashboard"
              className="rounded-(--radius-control) bg-accent px-6 py-2 text-sm font-bold text-[var(--color-base)] transition-opacity hover:opacity-90"
            >
              Dashboard
            </Link>
            <UserMenu {...user} />
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-accent transition-colors hover:opacity-80">
              Sign In
            </Link>
            <Link
              href="/upload"
              className="rounded-(--radius-control) bg-accent px-6 py-2 text-sm font-bold text-[var(--color-base)] transition-opacity hover:opacity-90"
            >
              Analyze your resume
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
