import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";

export default async function ResumesPage() {
  const session = await auth();
  const analyses = await db.analysis.findMany({
    where: { userId: session!.user!.id },
    include: { jobPost: true },
    orderBy: { createdAt: "desc" },
  });

  if (analyses.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--color-base-light)]">
          Nothing analyzed yet
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Upload your first resume to get your match score.
        </p>
        <Link
          href="/upload"
          className="mt-6 inline-block rounded-[var(--radius-control)] bg-[var(--color-accent)] px-6 py-3 text-sm font-medium text-[var(--color-base)] transition-opacity hover:opacity-90"
        >
          Upload your first resume
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-8 font-[family-name:var(--font-display)] text-2xl text-[var(--color-base-light)]">
        Resume history
      </h1>
      <div className="flex flex-col gap-3">
        {analyses.map((a) => (
          <Link
            key={a.id}
            href={`/results/${a.id}`}
            className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--color-track)] px-5 py-4 transition-colors hover:border-[var(--color-accent)]"
          >
            <div>
              <p className="text-sm text-[var(--color-base-light)]">{a.jobPost.title}</p>
              <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                {a.createdAt.toLocaleDateString()}
              </p>
            </div>
            <span className="font-[family-name:var(--font-display)] text-sm text-[var(--color-accent)]">
              {a.matchScore}%
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
