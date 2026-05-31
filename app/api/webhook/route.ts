import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { provisionCredits } from "@/lib/credits";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-05-27.dahlia" as const,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Service role client for upserts that bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Map Stripe price IDs → plan slugs
function planFromPriceId(priceId: string): string {
  const map: Record<string, string> = {
    [process.env.STRIPE_CREATOR_PRICE_ID ?? ""]: "creator",
    [process.env.STRIPE_PRO_PRICE_ID     ?? ""]: "pro",
    [process.env.STRIPE_STUDIO_PRICE_ID  ?? ""]: "studio",
  };
  return map[priceId] ?? "creator";
}

type SubLike = { current_period_end: number; current_period_start: number };

async function upsertSubscription(
  userId:         string,
  customerId:     string,
  subscriptionId: string,
  plan:           string,
  status:         string,
  periodStart:    number | null,
  periodEnd:      number | null
) {
  await supabase.from("subscriptions").upsert(
    {
      user_id:                userId,
      stripe_customer_id:     customerId,
      stripe_subscription_id: subscriptionId,
      plan,
      status,
      period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
      period_end:   periodEnd   ? new Date(periodEnd   * 1000).toISOString() : null,
    },
    { onConflict: "user_id" }
  );
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig  = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {

      // ── New subscription created via checkout ───────────────────────────
      case "checkout.session.completed": {
        const session   = event.data.object as Stripe.Checkout.Session;
        const userId    = session.metadata?.userId ?? session.client_reference_id ?? "";
        const plan      = session.metadata?.plan ?? "creator";
        const custId    = session.customer as string;
        const subId     = session.subscription as string;

        if (userId) {
          await upsertSubscription(userId, custId, subId, plan, "active", null, null);
          // Provision initial credits
          await provisionCredits(userId, plan, new Date(), null);
        }
        break;
      }

      // ── Subscription updated (upgrade / downgrade) or period renewed ────
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub       = event.data.object as Stripe.Subscription;
        const priceId   = sub.items.data[0]?.price?.id ?? "";
        const plan      = planFromPriceId(priceId);
        const subLike   = sub as unknown as SubLike;
        const periodEnd = subLike.current_period_end;
        const periodStart = subLike.current_period_start;

        const { data: existing } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", sub.customer as string)
          .maybeSingle();

        if (existing?.user_id) {
          await upsertSubscription(
            existing.user_id,
            sub.customer as string,
            sub.id,
            plan,
            sub.status,
            periodStart,
            periodEnd
          );
          // On renewal, reset credits for the new period
          if (sub.status === "active") {
            await provisionCredits(
              existing.user_id,
              plan,
              new Date(periodStart * 1000),
              new Date(periodEnd   * 1000)
            );
          }
        }
        break;
      }

      // ── Subscription cancelled ──────────────────────────────────────────
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await supabase
          .from("subscriptions")
          .update({ status: "cancelled", plan: "free" })
          .eq("stripe_customer_id", sub.customer as string);

        // Zero out credits on cancellation
        const { data: existing } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", sub.customer as string)
          .maybeSingle();
        if (existing?.user_id) {
          await supabase
            .from("user_credits")
            .update({ credits_remaining: 0, plan: "free" })
            .eq("user_id", existing.user_id);
        }
        break;
      }

      // ── Payment failed ──────────────────────────────────────────────────
      case "invoice.payment_failed": {
        const inv = event.data.object as Stripe.Invoice;
        await supabase
          .from("subscriptions")
          .update({ status: "past_due" })
          .eq("stripe_customer_id", inv.customer as string);
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }
}
