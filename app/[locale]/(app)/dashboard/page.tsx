import Link from "next/link";
import { redirect } from "next/navigation";
import {
  IconSend,
  IconChartBar,
  IconArrowUp,
  IconArrowDown,
  IconFileText,
  IconArrowRight,
  IconUpload,
  IconSparkles,
  IconClipboardCheck,
} from "@tabler/icons-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatRelativeTime } from "@/lib/format";
import { ScoreRing } from "@/components/ui/score-ring";
import { SkillTag } from "@/components/ui/skill-tag";
import { TrendChart } from "@/components/dashboard/trend-chart";

const DAY_MS = 24 * 60 * 60 * 1000;
const RESPONDED_STATUSES = ["INTERVIEW", "OFFER"];

const STATUS_LABELS: Record<string, string> = {
  APPLIED: "Applied",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  REJECTED: "Rejected",
};

const ONBOARDING_STEPS = [
  {
    phase: "Step 01",
    title: "Upload",
    description: "Drop your resume and paste the job description you're targeting.",
    icon: IconUpload,
  },
  {
    phase: "Step 02",
    title: "Analyze",
    description: "We compare both against real ATS logic to compute your match score.",
    icon: IconChartBar,
  },
  {
    phase: "Step 03",
    title: "Results",
    description: "Get matching/missing skills, a rewrite pass, and a tailored cover letter.",
    icon: IconClipboardCheck,
  },
];

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Morning";
  if (hour < 18) return "Afternoon";
  return "Evening";
}

function pctChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function responseRateOf(apps: { status: string }[]) {
  return apps.length
    ? Math.round((apps.filter((a) => RESPONDED_STATUSES.includes(a.status)).length / apps.length) * 100)
    : 0;
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = session.user.id;
  const firstName = session.user.name?.split(" ")[0] ?? "there";

  const [analyses, applications] = await Promise.all([
    db.analysis.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { jobPost: { select: { title: true, company: true } } },
    }),
    db.application.findMany({ where: { userId }, orderBy: { updatedAt: "desc" } }),
  ]);

  if (analyses.length === 0) {
    return (
      <div className="mx-auto w-full max-w-4xl px-5 py-16 md:px-16">
        <div className="flex flex-col items-center py-8 text-center">
          <div className="mb-6 flex size-16 items-center justify-center rounded-(--radius-card) border border-track bg-track/20">
            <IconSparkles size={28} stroke={1.5} className="text-accent" />
          </div>
          <h1 className="mb-3 font-display text-2xl font-bold text-base-light">
            {greeting()}, {firstName}
          </h1>
          <p className="mb-8 max-w-md text-muted">
            You haven&apos;t analyzed a resume yet. Upload one against a job description to get your match
            score, close the gaps, and generate a tailored cover letter.
          </p>
          <Link
            href="/upload"
            className="flex items-center gap-2 rounded-(--radius-control) bg-accent px-8 py-4 text-sm font-bold text-[var(--color-base)] transition-opacity hover:opacity-90"
          >
            <IconUpload size={18} stroke={1.5} />
            Analyze my first resume
          </Link>
        </div>

        <div className="mt-20 border-t border-track pt-16">
          <h2 className="mb-12 text-center font-display text-xl font-medium text-base-light">
            How it works
          </h2>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            {ONBOARDING_STEPS.map((step) => (
              <div key={step.title} className="text-center md:text-left">
                <div className="mb-4 flex justify-center md:justify-start">
                  <div className="flex size-11 items-center justify-center rounded-(--radius-control) border border-track bg-track/20">
                    <step.icon size={20} stroke={1.5} className="text-accent" />
                  </div>
                </div>
                <span className="mb-2 block text-xs tracking-widest text-accent uppercase">
                  {step.phase}
                </span>
                <h3 className="mb-2 font-display text-lg font-medium text-base-light">{step.title}</h3>
                <p className="text-sm text-muted">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // eslint-disable-next-line react-hooks/purity -- async Server Component, renders once per request; "now" must reflect actual request time
  const now = Date.now();
  const last30Start = now - 30 * DAY_MS;
  const prev30Start = now - 60 * DAY_MS;

  const appsLast30 = applications.filter((a) => a.appliedAt.getTime() >= last30Start);
  const appsPrev30 = applications.filter(
    (a) => a.appliedAt.getTime() >= prev30Start && a.appliedAt.getTime() < last30Start,
  );

  const applicationsTrend = pctChange(appsLast30.length, appsPrev30.length);
  const responseRate = responseRateOf(applications);
  const responseRateTrend = responseRateOf(appsLast30) - responseRateOf(appsPrev30);
  const avgMatchScore = Math.round(
    analyses.reduce((sum, a) => sum + a.matchScore, 0) / analyses.length,
  );

  const chartData = Array.from({ length: 30 }, (_, i) => {
    const dayStart = new Date(now - (29 - i) * DAY_MS);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart.getTime() + DAY_MS);
    const count = applications.filter(
      (a) => a.appliedAt >= dayStart && a.appliedAt < dayEnd,
    ).length;
    return {
      label: dayStart.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      count,
    };
  });

  const activity = [
    ...analyses.slice(0, 5).map((a) => ({
      type: "analysis" as const,
      key: `analysis-${a.id}`,
      timestamp: a.createdAt,
      href: `/results/${a.id}`,
      title: a.jobPost.company ? `${a.jobPost.title} — ${a.jobPost.company}` : a.jobPost.title,
      matchScore: a.matchScore,
    })),
    ...applications.slice(0, 5).map((a) => ({
      type: "application" as const,
      key: `application-${a.id}`,
      timestamp: a.updatedAt,
      href: "/tracker",
      title: `${a.role} — ${a.company}`,
      status: a.status,
    })),
  ]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 5);

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-12 md:px-16">
      <header className="mb-16">
        <h1 className="mb-2 font-display text-3xl font-bold text-base-light">
          {greeting()}, {firstName}
        </h1>
        <p className="max-w-xl text-muted">
          Here is your career performance digest, updated as you analyze and apply.
        </p>
      </header>

      {/* Stat cards */}
      <div className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="flex h-48 flex-col justify-between rounded-(--radius-card) border border-track p-8 transition-colors hover:border-accent/40">
          <div className="flex items-start justify-between">
            <span className="text-xs tracking-widest text-muted uppercase">Applications sent</span>
            <IconSend size={18} stroke={1.5} className="text-accent" />
          </div>
          <div>
            <span className="block font-display text-4xl font-bold text-base-light">
              {applications.length}
            </span>
            <span className="flex items-center gap-1 text-xs text-accent">
              {applicationsTrend >= 0 ? (
                <IconArrowUp size={12} stroke={1.5} />
              ) : (
                <IconArrowDown size={12} stroke={1.5} />
              )}
              {Math.abs(applicationsTrend)}% from last month
            </span>
          </div>
        </div>

        <div className="flex h-48 flex-col justify-between rounded-(--radius-card) border border-track p-8 transition-colors hover:border-accent/40">
          <div className="flex items-start justify-between">
            <span className="text-xs tracking-widest text-muted uppercase">Response rate</span>
            <IconChartBar size={18} stroke={1.5} className="text-accent" />
          </div>
          <div>
            <span className="block font-display text-4xl font-bold text-base-light">
              {responseRate}%
            </span>
            <span className="flex items-center gap-1 text-xs text-accent">
              {responseRateTrend >= 0 ? (
                <IconArrowUp size={12} stroke={1.5} />
              ) : (
                <IconArrowDown size={12} stroke={1.5} />
              )}
              {Math.abs(responseRateTrend)}pts from last month
            </span>
          </div>
        </div>

        <div className="flex h-48 flex-col justify-between rounded-(--radius-card) border border-track p-8 transition-colors hover:border-accent/40">
          <div className="flex items-start justify-between">
            <span className="text-xs tracking-widest text-muted uppercase">Average match score</span>
            <ScoreRing score={avgMatchScore} size={32} showLabel={false} />
          </div>
          <div>
            <span className="block font-display text-4xl font-bold text-base-light">
              {avgMatchScore}
            </span>
            <span className="text-xs text-muted">Optimal range target</span>
          </div>
        </div>
      </div>

      {/* Trend chart */}
      <section className="mb-16">
        <div className="rounded-(--radius-card) border border-track p-8">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <h2 className="mb-1 font-display text-xl font-medium text-base-light">
                Application Trends
              </h2>
              <p className="text-sm text-muted">Activity volume over the last 30 days</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted">
              <span className="size-3 rounded-full bg-accent" />
              Active submissions
            </div>
          </div>
          <TrendChart data={chartData} />
        </div>
      </section>

      {/* Recent activity */}
      <section>
        <div className="mb-8 flex items-center justify-between">
          <h2 className="font-display text-xl font-medium text-base-light">Recent Activity</h2>
          <Link
            href="/resumes"
            className="flex items-center gap-1 text-sm text-accent transition-opacity hover:opacity-80"
          >
            View Full History
            <IconArrowRight size={14} stroke={1.5} />
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          {activity.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="flex flex-col gap-4 rounded-(--radius-card) border border-track p-6 transition-colors hover:border-accent/40 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex items-center gap-6">
                <div className="flex size-12 items-center justify-center rounded-(--radius-control) border border-track bg-track/20">
                  <IconFileText size={20} stroke={1.5} className="text-accent" />
                </div>
                <div>
                  <h4 className="font-medium text-base-light">{item.title}</h4>
                  <p className="text-sm text-muted">
                    {item.type === "analysis"
                      ? `Analysis complete • ${formatRelativeTime(item.timestamp)}`
                      : `Moved to ${STATUS_LABELS[item.status]} • ${formatRelativeTime(item.timestamp)}`}
                  </p>
                </div>
              </div>

              {item.type === "analysis" ? (
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className="mb-1 block text-xs tracking-widest text-muted uppercase">
                      Match score
                    </span>
                    <span className="font-display text-lg font-medium text-accent">
                      {item.matchScore}%
                    </span>
                  </div>
                  <SkillTag
                    label={item.matchScore >= 70 ? "Matches requirements" : "Needs improvement"}
                    variant={item.matchScore >= 70 ? "match" : "gap"}
                  />
                </div>
              ) : (
                <SkillTag label={STATUS_LABELS[item.status]} variant="match" />
              )}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
