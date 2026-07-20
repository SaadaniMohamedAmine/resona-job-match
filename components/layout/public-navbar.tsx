import Link from "next/link";
import { Wordmark } from "@/components/ui/wordmark";

export function PublicNavbar() {
  return (
    <header className="relative z-10 w-full border-b border-track">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-5 md:px-16">
        <Link href="/">
          <Wordmark />
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/pricing" className="text-muted transition-colors hover:text-accent">
            Pricing
          </Link>
          <Link href="/login" className="text-muted transition-colors hover:text-accent">
            Log in
          </Link>
          <Link
            href="/sign-up"
            className="rounded-(--radius-control) bg-accent px-4 py-2 text-xs font-medium uppercase tracking-widest text-[var(--color-base)] transition-opacity hover:opacity-90"
          >
            Sign up
          </Link>
        </nav>
      </div>
    </header>
  );
}
