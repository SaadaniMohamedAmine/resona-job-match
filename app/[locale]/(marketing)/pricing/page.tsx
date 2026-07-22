import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { PricingCards } from "@/components/billing/pricing-cards";

export default async function PricingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations("pricing");
  const session = await auth();
  let currentPlan: "FREE" | "PRO" | null = null;

  if (session?.user) {
    const user = await db.user.findUnique({ where: { id: session.user.id }, select: { plan: true } });
    currentPlan = user?.plan ?? null;
  }

  const price = await getStripe().prices.retrieve(process.env.STRIPE_PRO_PRICE_ID!);
  const proPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: price.currency,
    minimumFractionDigits: (price.unit_amount ?? 0) % 100 === 0 ? 0 : 2,
  }).format((price.unit_amount ?? 0) / 100);

  return (
    <div className="mx-auto max-w-5xl px-5 py-24 md:px-16">
      <div className="mb-16 text-center">
        <h1 className="font-display text-4xl font-bold text-base-light md:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-3 text-muted">{t("subtitle")}</p>
      </div>

      <PricingCards
        currentPlan={currentPlan}
        isAuthenticated={!!session?.user}
        proPrice={proPrice}
        locale={locale}
      />
    </div>
  );
}
