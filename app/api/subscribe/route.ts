import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-05-27.dahlia" as const,
});

// Plan slugs match PRODUCT_DECISIONS §3: creator / pro / studio
const PLANS: Record<string, { priceId: string }> = {
  creator: { priceId: process.env.STRIPE_CREATOR_PRICE_ID! },
  pro:     { priceId: process.env.STRIPE_PRO_PRICE_ID! },
  studio:  { priceId: process.env.STRIPE_STUDIO_PRICE_ID! },
};

export async function POST(req: NextRequest) {
  try {
    const { plan, userId, email } = await req.json();
    const planConfig = PLANS[plan];

    if (!planConfig?.priceId) {
      return NextResponse.json({ error: "Invalid or unconfigured plan" }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email:       email,
      client_reference_id:  userId,
      line_items:           [{ price: planConfig.priceId, quantity: 1 }],
      mode:                 "subscription",
      success_url:          `${appUrl}/studio?subscribed=true`,
      cancel_url:           `${appUrl}/studio`,
      metadata:             { userId, plan },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[/api/subscribe]", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
