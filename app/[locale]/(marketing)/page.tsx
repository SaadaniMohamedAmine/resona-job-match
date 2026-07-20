import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col">
      <section className="mx-auto max-w-3xl px-8 py-32 text-center">
        <h1 className="font-display text-5xl font-medium text-base-light">
          Your resume, aligned to every opportunity.
        </h1>
        <p className="mt-6 text-muted">
          75% of resumes are rejected by ATS before a human ever reads them.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Link
            href="/upload"
            className="rounded-(--radius-control) bg-accent px-6 py-3 text-sm font-medium text-[var(--color-base)]"
          >
            Analyze your resume
          </Link>
          <Link
            href="#how-it-works"
            className="rounded-(--radius-control) border border-track px-6 py-3 text-sm text-base-light"
          >
            See how it works
          </Link>
        </div>
      </section>
    </div>
  );
}
