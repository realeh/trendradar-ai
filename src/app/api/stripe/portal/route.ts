import { NextResponse } from "next/server";
import { noStoreJson, rateLimit } from "@/lib/api-security";
import { requireUser } from "@/lib/auth-server";
import { createStripeClient, getBaseUrl } from "@/lib/stripe";

export async function POST(request: Request) {
  const limited = rateLimit(request, 15);
  if (limited) return limited;

  const { user, error: authError, supabase } = await requireUser(request);
  if (authError) return authError;

  const stripe = createStripeClient();
  if (!stripe || !supabase) {
    return NextResponse.json({ error: "Billing is not configured." }, { status: 503 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user!.id)
    .maybeSingle();

  if (!profile?.stripe_customer_id) {
    return NextResponse.json(
      { error: "No billing account found yet. Subscribe to a plan first." },
      { status: 400 }
    );
  }

  const baseUrl = getBaseUrl(request);
  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${baseUrl}/account`
  });

  return noStoreJson({ url: session.url });
}
