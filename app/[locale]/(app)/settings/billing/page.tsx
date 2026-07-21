import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getAnalyzeQuota } from "@/lib/rate-limit";
import { AnalysisQuotaBadge } from "@/components/ui/analysis-quota-badge";

export default async function BillingSettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [user, quota] = await Promise.all([
    db.user.findUnique({ where: { id: session.user.id }, include: { subscription: true } }),
    getAnalyzeQuota(session.user.id),
  ]);

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-8 font-[family-name:var(--font-display)] text-2xl text-[var(--color-base-light)]">
        Billing
      </h1>
      <div className="rounded-[var(--radius-card)] border border-[var(--color-track)] p-6">
        <p className="text-xs text-[var(--color-muted)]">Current plan</p>
        <p className="mt-1 font-[family-name:var(--font-display)] text-xl text-[var(--color-accent)]">
          {user?.plan}
        </p>
        {user?.subscription?.currentPeriodEnd && (
          <p className="mt-2 text-xs text-[var(--color-muted)]">
            Renews on{" "}
            {new Date(user.subscription.currentPeriodEnd).toLocaleDateString()}
          </p>
        )}
      </div>

      <div className="mt-4">
        <AnalysisQuotaBadge plan={quota.plan} remaining={quota.remaining} limit={quota.limit} />
      </div>

      {user?.plan === "PRO" && (
        <form action="/api/stripe/portal" method="POST" className="mt-4">
          <button className="rounded-[var(--radius-control)] border border-[var(--color-track)] px-4 py-2 text-sm text-[var(--color-base-light)] transition-opacity hover:opacity-90">
            Manage subscription
          </button>
        </form>
      )}
    </div>
  );
}
