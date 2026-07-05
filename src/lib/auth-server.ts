import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "./supabase-admin";

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
