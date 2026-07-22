import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { withErrorHandling } from "@/lib/api-handler";
import { locales, defaultLocale } from "@/i18n/request";

export const POST = withErrorHandling(async (req: Request) => {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const locale = locales.includes(body?.locale) ? body.locale : defaultLocale;
  const localePath = locale === defaultLocale ? "" : `/${locale}`;

  const user = await db.user.findUnique({
    where: { id: session.user.id! },
    include: { subscription: true },
  });

  let customerId = user?.subscription?.stripeCustomerId;
  if (!customerId) {
    const customer = await getStripe().customers.create({ email: user!.email! });
    customerId = customer.id;
  }

  const checkoutSession = await getStripe().checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID!, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}${localePath}/settings/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}${localePath}/settings/billing?canceled=true`,
    metadata: { userId: session.user.id! },
    locale,
  });

  return NextResponse.json({ url: checkoutSession.url! });
});
