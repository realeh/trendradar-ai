import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { createStripeClient } from "@/lib/stripe";

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
  if (supabase && event.type === "checkout.session.completed") {
    const session = event.data.object;
    await supabase.from("billing_events").insert({
      stripe_event_id: event.id,
      event_type: event.type,
      payload: session
    });
  }

  if (supabase && event.type === "customer.subscription.updated") {
    const subscription = event.data.object;
    await supabase.from("billing_events").insert({
      stripe_event_id: event.id,
      event_type: event.type,
      payload: subscription
    });
  }

  // Churn signal — this was documented in DEPLOYMENT.md as a listened-for
  // event but was never actually handled here until now.
  if (supabase && event.type === "customer.subscription.deleted") {
    const subscription = event.data.object;
    await supabase.from("billing_events").insert({
      stripe_event_id: event.id,
      event_type: event.type,
      payload: subscription
    });
  }

  return NextResponse.json({ received: true });
}
