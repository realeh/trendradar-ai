import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "./supabase-admin";
import { hasActiveAccess } from "./stripe-plans";

export async function requireUser(request: Request) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return { user: null, error: NextResponse.json({ error: "Supabase is not configured." }, { status: 503 }) };
  }

  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) {
    return { user: null, error: NextResponse.json({ error: "Missing bearer token." }, { status: 401 }) };
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return { user: null, error: NextResponse.json({ error: "Invalid session." }, { status: 401 }) };
  }

  return { user: data.user, error: null, supabase };
}

/**
 * Stronger gate for endpoints that hold the actual paid product data
 * (catalog reads, AI answers, simulator results). requireUser only proves
 * "someone is logged in" — this additionally checks their profile has an
 * active/trialing subscription, so the real access boundary lives on the
 * server (not just the client-side redirect in AppShell), and can't be
 * bypassed by calling the API directly.
 */
export async function requireActiveSubscription(request: Request) {
  const result = await requireUser(request);
  if (result.error) return result;

  const { data: profile } = await result.supabase!
    .from("profiles")
    .select("subscription_status")
    .eq("id", result.user!.id)
    .maybeSingle();

  if (!hasActiveAccess(profile?.subscription_status)) {
    return {
      user: null,
      error: NextResponse.json({ error: "An active subscription is required." }, { status: 402 }),
      supabase: null
    };
  }

  return result;
}
