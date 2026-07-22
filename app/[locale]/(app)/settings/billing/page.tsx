import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getAnalyzeQuota } from "@/lib/rate-limit";
import { AnalysisQuotaBadge } from "@/components/ui/analysis-quota-badge";
import { SettingsSidebar } from "@/components/settings/settings-sidebar";
import { BillingReturnNotice } from "@/components/settings/billing-return-notice";

export default async function BillingSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");
  const t = await getTranslations("settings");

  const [user, quota, cookieStore] = await Promise.all([
    db.user.findUnique({ where: { id: session.user.id }, include: { subscription: true } }),
    getAnalyzeQuota(session.user.id),
    cookies(),
  ]);

  const prePortalStatus = cookieStore.get("stripe_pre_portal_status")?.value;
  const justCanceledSubscription = prePortalStatus === "active" && user?.subscription?.status === "canceled";

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 md:px-16">
      <BillingReturnNotice subscriptionJustCanceled={justCanceledSubscription} />
      <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-12">
        <SettingsSidebar
          title={t("billingPageTitle")}
          description={t("billingPageDescription")}
          active="billing"
          insight={t("billingInsight")}
        />

        <section className="space-y-8 lg:col-span-8">
          <div className="flex flex-col items-start justify-between gap-6 rounded-(--radius-card) border border-track bg-track/20 p-8 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs tracking-widest text-muted uppercase">{t("currentPlan")}</p>
              <p className="mt-1 font-display text-2xl font-bold text-accent">{user?.plan}</p>
              {user?.subscription?.currentPeriodEnd && (
                <p className="mt-2 text-xs text-muted">
                  {t("renewsOn", {
                    date: new Intl.DateTimeFormat(locale).format(user.subscription.currentPeriodEnd),
                  })}
                </p>
              )}
            </div>
            {user?.plan === "FREE" && (
              <Link
                href="/pricing"
                className="rounded-(--radius-control) bg-accent px-6 py-2.5 text-sm font-medium whitespace-nowrap text-[var(--color-base)] transition-opacity hover:opacity-90"
              >
                {t("upgradeToPro")}
              </Link>
            )}
          </div>

          <AnalysisQuotaBadge plan={quota.plan} remaining={quota.remaining} limit={quota.limit} />

          {user?.plan === "PRO" && (
            <form action="/api/stripe/portal" method="POST">
              <input type="hidden" name="locale" value={locale} />
              <button className="rounded-(--radius-control) border border-track px-6 py-2.5 text-sm text-base-light transition-colors hover:bg-track">
                {t("manageSubscription")}
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
