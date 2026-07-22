import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { withErrorHandling } from "@/lib/api-handler";
import { locales, defaultLocale } from "@/i18n/request";

export const POST = withErrorHandling(async (req: Request) => {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sub = await db.subscription.findUnique({ where: { userId: session.user.id! } });
  if (!sub) return NextResponse.json({ error: "No subscription" }, { status: 404 });

  const formData = await req.formData().catch(() => null);
  const requestedLocale = formData?.get("locale");
  const locale = locales.includes(requestedLocale as (typeof locales)[number])
    ? requestedLocale
    : defaultLocale;
  const localePath = locale === defaultLocale ? "" : `/${locale}`;

  const portalSession = await getStripe().billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}${localePath}/settings/billing`,
  });

  return NextResponse.redirect(portalSession.url);
});
