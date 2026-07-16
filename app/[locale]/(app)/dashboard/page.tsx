import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id;

  const [applicationsCount, analyses, respondedCount] = await Promise.all([
    db.application.count({ where: { userId } }),
    db.analysis.findMany({ where: { userId }, select: { matchScore: true } }),
    db.application.count({ where: { userId, status: { in: ["INTERVIEW", "OFFER"] } } }),
  ]);

  const avgScore = analyses.length
    ? Math.round(analyses.reduce((sum, a) => sum + a.matchScore, 0) / analyses.length)
    : 0;
  const responseRate = applicationsCount ? Math.round((respondedCount / applicationsCount) * 100) : 0;

  const stats = [
    { label: "Applications sent", value: applicationsCount },
    { label: "Response rate", value: `${responseRate}%` },
    { label: "Average match score", value: `${avgScore}%` },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="mb-8 font-[family-name:var(--font-display)] text-2xl text-[var(--color-base-light)]">
        Dashboard
      </h1>
      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-[var(--radius-card)] border border-[var(--color-track)] p-6">
            <p className="text-xs text-[var(--color-muted)]">{s.label}</p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-2xl text-[var(--color-accent)]">
              {s.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
