import { NextResponse } from "next/server";
import { noStoreJson, rateLimit, readJsonBody, sanitizePrompt } from "@/lib/api-security";
import { getBaseUrl, createStripeClient } from "@/lib/stripe";
import { logAnalyticsEvent } from "@/lib/analytics";

const priceIdByPlan: Record<string, string | undefined> = {
  starter: process.env.STRIPE_PRICE_STARTER,
  growth: process.env.STRIPE_PRICE_GROWTH,
  scale: process.env.STRIPE_PRICE_SCALE
};

export async function POST(request: Request) {
  const limited = rateLimit(request, 10);
  if (limited) return limited;

  const body = await readJsonBody<{ plan?: unknown }>(request, 2_048);
  if (body.error) return body.error;

  const stripe = createStripeClient();
  const plan = sanitizePrompt(body.data?.plan, 80) || "Growth";
  const priceId = priceIdByPlan[plan.toLowerCase()];

  if (stripe && priceId) {
    const baseUrl = getBaseUrl(request);
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/account?checkout=success`,
      cancel_url: `${baseUrl}/pricing?checkout=cancelled`,
      allow_promotion_codes: true,
      metadata: { plan }
    });

    await logAnalyticsEvent("checkout_started", { plan, stripeSessionId: session.id });

    return noStoreJson({
      mode: "stripe",
      checkoutUrl: session.url
    });
  }

  if (stripe && !priceId) {
    return NextResponse.json(
      { error: `No Stripe price configured for plan "${plan}". Set STRIPE_PRICE_${plan.toUpperCase()} in your environment.` },
      { status: 503 }
    );
  }

  return noStoreJson({
    mode: "mock",
    checkoutUrl: "/account"
  });
}
