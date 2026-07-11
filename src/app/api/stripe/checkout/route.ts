import { NextResponse } from "next/server";
import { noStoreJson, rateLimit, readJsonBody, sanitizePrompt } from "@/lib/api-security";
import { getBaseUrl, createStripeClient } from "@/lib/stripe";
import { logAnalyticsEvent } from "@/lib/analytics";
import { requireUser } from "@/lib/auth-server";
import { priceIdForPlan } from "@/lib/stripe-plans";

export async function POST(request: Request) {
  const limited = rateLimit(request, 10);
  if (limited) return limited;

  // Checkout must be tied to a real logged-in user — otherwise the webhook
  // has no reliable way to know whose profile to mark as paid.
  const { user, error: authError, supabase } = await requireUser(request);
  if (authError) return authError;

  const body = await readJsonBody<{ plan?: unknown }>(request, 2_048);
  if (body.error) return body.error;

  const stripe = createStripeClient();
  const plan = sanitizePrompt(body.data?.plan, 80) || "Growth";
  const priceId = priceIdForPlan(plan);

  if (stripe && priceId) {
    const baseUrl = getBaseUrl(request);

    // Reuse an existing Stripe customer if this user already has one
    // (e.g. a previously cancelled subscription) instead of creating dupes.
    let existingCustomerId: string | undefined;
    if (supabase) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("stripe_customer_id")
        .eq("id", user!.id)
        .maybeSingle();
      existingCustomerId = profile?.stripe_customer_id ?? undefined;
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/account?checkout=success`,
      cancel_url: `${baseUrl}/pricing?checkout=cancelled`,
      allow_promotion_codes: true,
      client_reference_id: user!.id,
      customer: existingCustomerId,
      customer_email: existingCustomerId ? undefined : user!.email,
      metadata: { plan, supabase_user_id: user!.id }
    });

    await logAnalyticsEvent("checkout_started", { plan, stripeSessionId: session.id, userId: user!.id });

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
