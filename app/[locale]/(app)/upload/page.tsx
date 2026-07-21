import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAnalyzeQuota } from "@/lib/rate-limit";
import { Stepper } from "@/components/ui/stepper";
import { AnalysisQuotaBadge } from "@/components/ui/analysis-quota-badge";
import { UploadForm } from "@/components/upload/upload-form";

export default async function UploadPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const quota = await getAnalyzeQuota(session.user.id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <Stepper steps={["Upload", "Analyze", "Results"]} currentStep={0} />

      <div className="mt-8">
        <AnalysisQuotaBadge plan={quota.plan} remaining={quota.remaining} limit={quota.limit} />
      </div>

      <div className="mt-8">
        <UploadForm quotaExceeded={quota.remaining === 0} />
      </div>
    </div>
  );
}
