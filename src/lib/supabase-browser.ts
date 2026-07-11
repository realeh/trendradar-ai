"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Singleton: creating a fresh client per call spins up a new GoTrueClient
// instance every time, which all fight over the same localStorage session
// key ("Multiple GoTrueClient instances detected" console warning) and can
// produce inconsistent session reads across components. Every caller in the
// app should share the same instance.
let cachedClient: SupabaseClient | null | undefined;

export function createBrowserSupabaseClient() {
  if (cachedClient !== undefined) return cachedClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  cachedClient = !url || !anonKey ? null : createClient(url, anonKey);
  return cachedClient;
}

/**
 * Fetch headers carrying the current session's bearer token, for calling
 * protected API routes (requireUser/requireActiveSubscription on the server
 * side check this same header). Returns {} if there's no session — the
 * server route will then correctly reject with 401/402 rather than silently
 * serving data.
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const supabase = createBrowserSupabaseClient();
  if (!supabase) return {};

  const {
    data: { session }
  } = await supabase.auth.getSession();

  return session ? { Authorization: `Bearer ${session.access_token}` } : {};
}
