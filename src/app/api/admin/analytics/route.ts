import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { noStoreJson, rateLimit } from "@/lib/api-security";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

/**
 * Real churn/conversion numbers, built entirely from data already in
 * Supabase: `analytics_events` (signups, checkout starts — logged by the app)
 * and `billing_events` (raw Stripe webhook events — checkout completions and
 * subscription cancellations). No third-party analytics account required.
 */
export async function GET(request: Request) {
  const limited = rateLimit(request, 30);
  if (limited) return limited;

  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const supabase = createSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });

  const [signups, checkoutStarted, checkoutCompleted, subscriptionsCancelled, profiles] = await Promise.all([
    supabase.from("analytics_events").select("id, created_at", { count: "exact" }).eq("event_type", "signup").order("created_at", { ascending: false }),
    supabase.from("analytics_events").select("id, created_at, metadata", { count: "exact" }).eq("event_type", "checkout_started").order("created_at", { ascending: false }),
    supabase.from("billing_events").select("id, created_at", { count: "exact" }).eq("event_type", "checkout.session.completed"),
    supabase.from("billing_events").select("id, created_at", { count: "exact" }).eq("event_type", "customer.subscription.deleted"),
    supabase.from("profiles").select("subscription_status")
  ]);

  const firstError = [signups.error, checkoutStarted.error, checkoutCompleted.error, subscriptionsCancelled.error, profiles.error].find(Boolean);
  if (firstError) {
    return NextResponse.json({ error: firstError.message }, { status: 500 });
  }

  const statusCounts: Record<string, number> = {};
  for (const row of profiles.data ?? []) {
    const status = row.subscription_status ?? "unknown";
    statusCounts[status] = (statusCounts[status] ?? 0) + 1;
  }

  const startedCount = checkoutStarted.count ?? 0;
  const completedCount = checkoutCompleted.count ?? 0;
  const conversionRate = startedCount > 0 ? Math.round((completedCount / startedCount) * 1000) / 10 : null;

  const activeSubs = statusCounts.active ?? 0;
  const cancelledCount = subscriptionsCancelled.count ?? 0;
  const churnRate = activeSubs + cancelledCount > 0 ? Math.round((cancelledCount / (activeSubs + cancelledCount)) * 1000) / 10 : null;

  return noStoreJson({
    totals: {
      signups: signups.count ?? 0,
      checkoutStarted: startedCount,
      checkoutCompleted: completedCount,
      subscriptionsCancelled: cancelledCount,
      activeSubscriptions: activeSubs
    },
    conversionRate,
    churnRate,
    subscriptionStatusBreakdown: statusCounts,
    recentSignups: (signups.data ?? []).slice(0, 10),
    recentCheckoutStarts: (checkoutStarted.data ?? []).slice(0, 10)
  });
}
