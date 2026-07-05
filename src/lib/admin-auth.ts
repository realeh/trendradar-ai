import { NextResponse } from "next/server";

/**
 * Minimal shared-secret gate for the curation admin tooling (/admin/curate and
 * its API routes). This is intentionally simple for a solo-founder MVP — it
 * is NOT the same as real user authentication. Before you have other staff
 * using this, replace it with a proper Supabase role check (e.g. a `role`
 * column on `profiles` checked via requireUser in auth-server.ts).
 *
 * Fails closed: if ADMIN_SECRET isn't set, every request is rejected rather
 * than silently allowed.
 */
export function requireAdmin(request: Request) {
  const configured = process.env.ADMIN_SECRET;
  if (!configured) {
    return NextResponse.json(
      { error: "ADMIN_SECRET is not configured on the server. Set it in your environment to enable curation tools." },
      { status: 503 }
    );
  }

  const provided = request.headers.get("x-admin-secret");
  if (!provided || provided !== configured) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  return null;
}
