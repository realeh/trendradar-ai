import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { createStripeClient } from "@/lib/stripe";
import { planForPriceId } from "@/lib/stripe-plans";

export async function POST(request: Request) {
  const stripe = createStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    return NextResponse.json({ received: true, mode: "mock" });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  const payload = await request.text();
  let event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid Stripe signature." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  // This is the piece that was missing entirely before: without it, Stripe
  // charges the card and we log the event, but no user's profile ever
  // reflects that they paid — so nothing in the app can actually gate on
  // subscription status. Every branch below both logs to billing_events
  // (audit trail / churn analytics) AND writes the real state to profiles
  // (what the app actually checks to grant access).

  if (supabase && event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    await supabase.from("billing_events").insert({
      stripe_event_id: event.id,
      event_type: event.type,
      payload: session
    });

    const userId = session.client_reference_id;
    const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
    const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
    const plan = session.metadata?.plan?.toLowerCase() ?? null;

    if (userId && customerId) {
      await supabase
        .from("profiles")
        .update({
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId ?? null,
          plan: plan ?? "growth",
          subscription_status: "active",
          updated_at: new Date().toISOString()
        })
        .eq("id", userId);
    }
  }

  if (supabase && (event.type === "customer.subscription.updated" || event.type === "customer.subscription.created")) {
    const subscription = event.data.object as Stripe.Subscription;
    await supabase.from("billing_events").insert({
      stripe_event_id: event.id,
      event_type: event.type,
      payload: subscription
    });

    const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
    const priceId = subscription.items.data[0]?.price?.id;
    const plan = planForPriceId(priceId);

    await supabase
      .from("profiles")
      .update({
        stripe_subscription_id: subscription.id,
        subscription_status: subscription.status,
        ...(plan ? { plan } : {}),
        updated_at: new Date().toISOString()
      })
      .eq("stripe_customer_id", customerId);
  }

  // Churn signal — this was documented in DEPLOYMENT.md as a listened-for
  // event but was never actually handled here until now.
  if (supabase && event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    await supabase.from("billing_events").insert({
      stripe_event_id: event.id,
      event_type: event.type,
      payload: subscription
    });

    const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
    await supabase
      .from("profiles")
      .update({ subscription_status: "canceled", updated_at: new Date().toISOString() })
      .eq("stripe_customer_id", customerId);
  }

  return NextResponse.json({ received: true });
}
