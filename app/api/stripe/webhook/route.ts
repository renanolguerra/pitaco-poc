import { getStripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Webhook signature failed" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      if (!userId || !session.subscription) break;
      await db.user.update({
        where: { id: userId },
        data: {
          plan: "PRO",
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
          stripePriceId: process.env.STRIPE_PRICE_ID_PRO,
        },
      });
      break;
    }
    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      const subId = (invoice as any).parent?.subscription_details?.subscription ?? invoice.subscription;
      if (!subId) break;
      const sub = await getStripe().subscriptions.retrieve(subId as string);
      const latestInvoice = typeof sub.latest_invoice === "object" ? sub.latest_invoice : null;
      const periodEnd = latestInvoice
        ? new Date((latestInvoice as Stripe.Invoice).period_end * 1000)
        : null;
      await db.user.updateMany({
        where: { stripeSubscriptionId: subId as string },
        data: { plan: "PRO", stripeCurrentPeriodEnd: periodEnd },
      });
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await db.user.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: { plan: "FREE", stripeSubscriptionId: null, stripePriceId: null, stripeCurrentPeriodEnd: null },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
