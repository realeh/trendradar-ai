import { createSupabaseAdminClient } from "./supabase-admin";

/**
 * Logs a lightweight product-analytics event (signup, checkout_started, etc.)
 * to Supabase. Failures here never throw — analytics must not break the
 * primary user flow (checkout, signup) it's instrumenting.
 */
export async function logAnalyticsEvent(eventType: string, metadata: Record<string, unknown> = {}, userId?: string | null) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return;

  try {
    await supabase.from("analytics_events").insert({
      event_type: eventType,
      user_id: userId ?? null,
      metadata
    });
  } catch {
    // Swallow — analytics is best-effort.
  }
}
