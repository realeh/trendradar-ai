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
