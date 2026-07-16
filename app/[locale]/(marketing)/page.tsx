import { Wordmark } from "@/components/ui/wordmark";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <nav className="flex items-center justify-between px-8 py-6">
        <Wordmark />
        <div className="flex gap-4 text-sm text-[var(--color-muted)]">
          <Link href="/login">Log in</Link>
          <Link href="/sign-up" className="text-[var(--color-accent)]">Sign up</Link>
        </div>
      </nav>
      <section className="mx-auto max-w-3xl px-8 py-32 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-5xl font-medium text-[var(--color-base-light)]">
          Your resume, aligned to every opportunity.
        </h1>
        <p className="mt-6 text-[var(--color-muted)]">
          75% of resumes are rejected by ATS before a human ever reads them.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Link
            href="/upload"
            className="rounded-[var(--radius-control)] bg-[var(--color-accent)] px-6 py-3 text-sm font-medium text-[var(--color-base)]"
          >
            Analyze your resume
          </Link>
          <Link
            href="#how-it-works"
            className="rounded-[var(--radius-control)] border border-[var(--color-track)] px-6 py-3 text-sm text-[var(--color-base-light)]"
          >
            See how it works
          </Link>
        </div>
      </section>
    </div>
  );
}
