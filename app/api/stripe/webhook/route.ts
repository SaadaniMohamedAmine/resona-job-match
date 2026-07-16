import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getStripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import * as Sentry from "@sentry/nextjs";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature")!;

  let event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    Sentry.captureException(err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const session = event.data.object as any;
      const userId: string = session.metadata.userId;
      const subId: string = session.subscription;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const subscription = (await getStripe().subscriptions.retrieve(subId)) as any;

      await db.subscription.upsert({
        where: { userId },
        create: {
          userId,
          stripeCustomerId: session.customer,
          stripeSubscriptionId: subscription.id,
          stripePriceId: subscription.items.data[0].price.id,
          status: subscription.status,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        },
        update: {
          stripeSubscriptionId: subscription.id,
          stripePriceId: subscription.items.data[0].price.id,
          status: subscription.status,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        },
      });

      await db.user.update({ where: { id: userId }, data: { plan: "PRO" } });
      break;
    }

    case "customer.subscription.deleted": {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const subscription = event.data.object as any;
      const existing = await db.subscription.findFirst({
        where: { stripeSubscriptionId: subscription.id },
      });
      if (existing) {
        await db.subscription.update({
          where: { id: existing.id },
          data: { status: "canceled" },
        });
        await db.user.update({ where: { id: existing.userId }, data: { plan: "FREE" } });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
