import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { IconCircleCheck, IconAlertCircle, IconEdit, IconSparkles, IconFileText } from "@tabler/icons-react";
import { ScoreRing } from "@/components/ui/score-ring";
import { SkillTag } from "@/components/ui/skill-tag";
import { Stepper } from "@/components/ui/stepper";
import { formatRelativeTime } from "@/lib/format";
import { DownloadReportButton } from "@/components/results/download-report-button";
import Link from "next/link";

type Suggestion = { section: string; issue: string; recommendation: string };

function scoreCopy(score: number, jobTitle: string, missingCount: number) {
  if (score >= 85) {
    return {
      headline: "Optimized Precision",
      description: `Your resume shows a strong technical alignment with the ${jobTitle} role.${
        missingCount > 0
          ? ` Strengthening ${missingCount === 1 ? "the missing skill" : "specific missing skills"} could push you into the top percentile.`
          : ""
      }`,
    };
  }
  if (score >= 65) {
    return {
      headline: "Strong Alignment",
      description: `Your resume aligns well with the ${jobTitle} role. Closing the ${missingCount} gap${missingCount === 1 ? "" : "s"} identified below would meaningfully strengthen your application.`,
    };
  }
  return {
    headline: "Room to Sharpen",
    description: `Your resume covers some ground for the ${jobTitle} role, but ${missingCount} key area${missingCount === 1 ? "" : "s"} could use attention before you apply.`,
  };
}

export default async function ResultsPage({ params }: { params: Promise<{ analysisId: string }> }) {
  const session = await auth();
  const { analysisId } = await params;
  const analysis = await db.analysis.findUnique({
    where: { id: analysisId },
    include: { resume: { select: { fileName: true } }, jobPost: { select: { title: true, company: true } } },
  });
  if (!analysis || analysis.userId !== session?.user?.id) notFound();

  const suggestions = analysis.suggestions as unknown as Suggestion[];
  const { headline, description } = scoreCopy(
    analysis.matchScore,
    analysis.jobPost.title,
    analysis.missingSkills.length
  );

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 md:px-16">
      <Stepper steps={["Upload", "Analyze", "Results"]} currentStep={2} />

      <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="flex flex-col gap-8 lg:col-span-8">
          <section className="flex flex-col items-center rounded-(--radius-card) border border-track bg-track/20 p-10 text-center">
            <ScoreRing score={analysis.matchScore} size={160} />
            <h1 className="mt-6 font-display text-2xl font-bold text-base-light">{headline}</h1>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">{description}</p>
          </section>

          <section className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="rounded-(--radius-card) border border-track bg-track/20 p-6">
              <div className="mb-6 flex items-center gap-2">
                <IconCircleCheck size={20} stroke={1.5} className="text-accent" />
                <h3 className="font-display text-lg font-medium text-base-light">Matching skills</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysis.matchingSkills.map((skill) => (
                  <SkillTag key={skill} label={skill} variant="match" />
                ))}
                {analysis.matchingSkills.length === 0 && (
                  <p className="text-sm text-muted">None identified</p>
                )}
              </div>
            </div>
            <div className="rounded-(--radius-card) border border-track bg-track/20 p-6">
              <div className="mb-6 flex items-center gap-2">
                <IconAlertCircle size={20} stroke={1.5} className="text-accent" />
                <h3 className="font-display text-lg font-medium text-base-light">Missing skills</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysis.missingSkills.map((skill) => (
                  <SkillTag key={skill} label={skill} variant="gap" />
                ))}
                {analysis.missingSkills.length === 0 && (
                  <p className="text-sm text-muted">None identified</p>
                )}
              </div>
            </div>
          </section>
        </div>

        <aside className="lg:col-span-4">
          <div className="sticky top-24 rounded-(--radius-card) border border-track bg-track/20 p-8">
            <h2 className="font-display text-lg font-medium text-base-light">Recommendations</h2>

            <div className="mt-6 flex flex-col gap-5">
              {suggestions.length === 0 && (
                <p className="text-sm leading-relaxed text-muted">
                  No specific recommendations were flagged — your resume is well matched to this role.
                </p>
              )}
              {suggestions.map((s, i) => (
                <div key={i} className="border-b border-track pb-5 last:border-0 last:pb-0">
                  <span className="text-[10px] font-medium tracking-widest text-accent uppercase">
                    {s.section}
                  </span>
                  <p className="mt-1 text-sm font-medium text-base-light">{s.issue}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{s.recommendation}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-4">
              <Link
                href={`/results/${analysis.id}/rewrite`}
                className="flex items-center justify-center gap-2 rounded-(--radius-control) bg-accent py-4 text-sm font-bold text-[var(--color-base)] transition-opacity hover:opacity-90"
              >
                <IconEdit size={18} stroke={1.5} />
                Rewrite my resume
              </Link>
              <Link
                href={`/results/${analysis.id}/cover-letter`}
                className="flex items-center justify-center gap-2 rounded-(--radius-control) border border-accent py-4 text-sm font-bold text-accent transition-colors hover:bg-accent/5"
              >
                <IconSparkles size={18} stroke={1.5} />
                Generate cover letter
              </Link>
            </div>

            <hr className="my-8 border-track" />

            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <IconFileText size={20} stroke={1.5} className="mt-0.5 text-accent" />
                <div>
                  <p className="truncate text-sm font-medium text-base-light">
                    {analysis.resume.fileName}
                  </p>
                  <p className="text-xs text-muted">Analyzed {formatRelativeTime(analysis.createdAt)}</p>
                </div>
              </div>
              <DownloadReportButton
                fileName={analysis.resume.fileName}
                jobTitle={analysis.jobPost.title}
                company={analysis.jobPost.company}
                matchScore={analysis.matchScore}
                matchingSkills={analysis.matchingSkills}
                missingSkills={analysis.missingSkills}
                suggestions={suggestions}
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
