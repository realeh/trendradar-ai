import { NextResponse } from "next/server";
import { noStoreJson, rateLimit, readJsonBody, sanitizePrompt } from "@/lib/api-security";
import { getBaseUrl, createStripeClient } from "@/lib/stripe";

export async function POST(request: Request) {
  const limited = rateLimit(request, 10);
  if (limited) return limited;

  const body = await readJsonBody<{ plan?: unknown }>(request, 2_048);
  if (body.error) return body.error;

  const stripe = createStripeClient();
  const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;
  if (stripe && priceId) {
    const baseUrl = getBaseUrl(request);
    const plan = sanitizePrompt(body.data?.plan, 80) || "Growth";
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/account?checkout=success`,
      cancel_url: `${baseUrl}/pricing?checkout=cancelled`,
      allow_promotion_codes: true,
      metadata: { plan }
    });

    return noStoreJson({
      mode: "stripe",
      checkoutUrl: session.url
    });
  }

  return noStoreJson({
    mode: "mock",
    checkoutUrl: "/account"
  });
}
