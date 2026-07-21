import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getAnalyzeQuota } from "@/lib/rate-limit";
import { AnalysisQuotaBadge } from "@/components/ui/analysis-quota-badge";
import { SettingsSidebar } from "@/components/settings/settings-sidebar";

export default async function BillingSettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [user, quota] = await Promise.all([
    db.user.findUnique({ where: { id: session.user.id }, include: { subscription: true } }),
    getAnalyzeQuota(session.user.id),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 md:px-16">
      <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-12">
        <SettingsSidebar
          title="Billing"
          description="Manage your plan and monitor your monthly analysis usage."
          active="billing"
          insight="Résona Pro removes the monthly ceiling entirely — 200 analyses gives you room to iterate on every application without watching a counter."
        />

        <section className="space-y-8 lg:col-span-8">
          <div className="rounded-(--radius-card) border border-track bg-track/20 p-8">
            <p className="text-xs tracking-widest text-muted uppercase">Current plan</p>
            <p className="mt-1 font-display text-2xl font-bold text-accent">{user?.plan}</p>
            {user?.subscription?.currentPeriodEnd && (
              <p className="mt-2 text-xs text-muted">
                Renews on {new Date(user.subscription.currentPeriodEnd).toLocaleDateString()}
              </p>
            )}
          </div>

          <AnalysisQuotaBadge plan={quota.plan} remaining={quota.remaining} limit={quota.limit} />

          {user?.plan === "PRO" && (
            <form action="/api/stripe/portal" method="POST">
              <button className="rounded-(--radius-control) border border-track px-6 py-2.5 text-sm text-base-light transition-colors hover:bg-track">
                Manage subscription
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
