import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { noStoreJson, rateLimit, readJsonBody } from "@/lib/api-security";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { invalidateProductCache } from "@/lib/product-store";
import { upsertCuratedProduct } from "@/lib/curated-product-writer";

export async function GET(request: Request) {
  const limited = rateLimit(request, 60);
  if (limited) return limited;

  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const supabase = createSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });

  const { data, error } = await supabase
    .from("curated_products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return noStoreJson({ products: data });
}

export async function POST(request: Request) {
  const limited = rateLimit(request, 30);
  if (limited) return limited;

  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const body = await readJsonBody<Record<string, unknown>>(request, 16_384);
  if (body.error) return body.error;

  const result = await upsertCuratedProduct(body.data ?? {});
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });

  return noStoreJson({ product: result.data });
}

export async function DELETE(request: Request) {
  const limited = rateLimit(request, 30);
  if (limited) return limited;

  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const supabase = createSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });

  const { error } = await supabase.from("curated_products").update({ status: "archived" }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  invalidateProductCache();
  return noStoreJson({ ok: true });
}
