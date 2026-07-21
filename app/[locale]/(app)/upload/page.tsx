import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAnalyzeQuota } from "@/lib/rate-limit";
import { IconInfoCircle } from "@tabler/icons-react";
import { Stepper } from "@/components/ui/stepper";
import { AnalysisQuotaBadge } from "@/components/ui/analysis-quota-badge";
import { UploadForm } from "@/components/upload/upload-form";

export default async function UploadPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const quota = await getAnalyzeQuota(session.user.id);

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 md:px-16">
      <Stepper steps={["Upload", "Analyze", "Results"]} currentStep={0} />

      <div className="mt-8">
        <AnalysisQuotaBadge plan={quota.plan} remaining={quota.remaining} limit={quota.limit} />
      </div>

      <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <h1 className="font-display text-4xl font-bold text-base-light md:text-5xl">
            Define Your Ambition.
          </h1>
          <p className="mt-6 max-w-md leading-relaxed text-muted">
            Our precision-engineered engine benchmarks your professional trajectory against
            specific industry requirements.
          </p>
          <div className="mt-8 flex items-start gap-4 rounded-(--radius-card) border border-track bg-track/20 p-4">
            <IconInfoCircle size={20} stroke={1.5} className="mt-0.5 shrink-0 text-accent" />
            <p className="text-sm text-muted">
              Ensure your resume is in PDF format for the most accurate structural extraction.
            </p>
          </div>
        </div>

        <div className="lg:col-span-7">
          <UploadForm quotaExceeded={quota.remaining === 0} />
        </div>
      </div>
    </div>
  );
}
