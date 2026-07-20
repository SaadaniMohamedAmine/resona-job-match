import Link from "next/link";
import { Wordmark } from "@/components/ui/wordmark";

export function PublicNavbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-track bg-base">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 md:px-16">
        <Link href="/">
          <Wordmark />
        </Link>
        <div className="hidden items-center gap-8 text-sm text-muted md:flex">
          <Link href="/#process" className="transition-colors hover:text-accent">
            Process
          </Link>
          <Link href="/resumes" className="transition-colors hover:text-accent">
            History
          </Link>
          <Link href="mailto:hello@resona.dev" className="transition-colors hover:text-accent">
            Support
          </Link>
        </div>
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
      </div>
    </header>
  );
}
