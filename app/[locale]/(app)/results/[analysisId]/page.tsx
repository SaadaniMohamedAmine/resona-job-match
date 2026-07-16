import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { ScoreRing } from "@/components/ui/score-ring";
import { SkillTag } from "@/components/ui/skill-tag";
import { Stepper } from "@/components/ui/stepper";
import Link from "next/link";

export default async function ResultsPage({ params }: { params: Promise<{ analysisId: string }> }) {
  const session = await auth();
  const { analysisId } = await params;
  const analysis = await db.analysis.findUnique({ where: { id: analysisId } });
  if (!analysis || analysis.userId !== session?.user?.id) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <Stepper steps={["Upload", "Analyze", "Results"]} currentStep={2} />

      <div className="mt-16 flex flex-col items-center">
        <ScoreRing score={analysis.matchScore} size={160} />

        <div className="mt-12 grid w-full grid-cols-1 gap-8 sm:grid-cols-2">
          <div>
            <h3 className="mb-3 text-sm font-medium text-[var(--color-muted)]">
              Matching skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {analysis.matchingSkills.map((skill) => (
                <SkillTag key={skill} label={skill} variant="match" />
              ))}
              {analysis.matchingSkills.length === 0 && (
                <p className="text-sm text-[var(--color-muted)]">None identified</p>
              )}
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-medium text-[var(--color-muted)]">
              Missing skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {analysis.missingSkills.map((skill) => (
                <SkillTag key={skill} label={skill} variant="gap" />
              ))}
              {analysis.missingSkills.length === 0 && (
                <p className="text-sm text-[var(--color-muted)]">None identified</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 flex gap-4">
          <Link
            href={`/results/${analysis.id}/rewrite`}
            className="rounded-[var(--radius-control)] bg-[var(--color-accent)] px-6 py-3 text-sm font-medium text-[var(--color-base)] transition-opacity hover:opacity-90"
          >
            Rewrite my resume
          </Link>
          <Link
            href={`/results/${analysis.id}/cover-letter`}
            className="rounded-[var(--radius-control)] border border-[var(--color-track)] px-6 py-3 text-sm text-[var(--color-base-light)] transition-opacity hover:opacity-90"
          >
            Generate cover letter
          </Link>
        </div>
      </div>
    </div>
  );
}
