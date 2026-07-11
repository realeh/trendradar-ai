import { NextResponse } from "next/server";
import { noStoreJson } from "@/lib/api-security";
import { isCjConfigured, searchCjProducts } from "@/lib/cj-client";
import { buildCuratedPayload, rankCjProducts } from "@/lib/ai-curator";
import { upsertCuratedProduct } from "@/lib/curated-product-writer";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

/**
 * Automatic daily catalog refresh, triggered by Vercel Cron (see vercel.json).
 * This is a server-to-server call authenticated via CRON_SECRET — Vercel
 * automatically sends `Authorization: Bearer <CRON_SECRET>` when invoking it,
 * so there's no admin-secret form entry involved and nothing for a human (or
 * an AI assistant) to type in anywhere. Runs entirely unattended.
 *
 * Each run:
 *  1. Pulls CJ's current trending list.
 *  2. Skips any product already in curated_products (by cj_product_id) so
 *     the catalog doesn't fill up with duplicates of the same item.
 *  3. Curates a handful of genuinely new products (real CJ data + AI copy,
 *     same pipeline as the manual /admin/curate flow).
 *  4. Archives the oldest active products beyond MAX_ACTIVE_PRODUCTS so the
 *     catalog stays a manageable, rotating "currently trending" set instead
 *     of growing forever.
 */
const MAX_ACTIVE_PRODUCTS = 30;
const NEW_PRODUCTS_PER_RUN = 4;

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!isCjConfigured()) {
    return NextResponse.json({ error: "CJ_DROPSHIPPING_API_KEY is not set." }, { status: 503 });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  try {
    const { data: existing } = await supabase
      .from("curated_products")
      .select("cj_product_id")
      .not("cj_product_id", "is", null);
    const existingIds = new Set((existing ?? []).map((row: { cj_product_id: string }) => row.cj_product_id));

    const searchResult = await searchCjProducts({ productFlag: 0, size: 50 });
    const freshProducts = searchResult.products.filter((product) => !existingIds.has(product.id));

    const ranked = rankCjProducts(freshProducts, NEW_PRODUCTS_PER_RUN);

    const saved: unknown[] = [];
    const failed: { name: string; error: string }[] = [];

    for (const scored of ranked) {
      const payload = await buildCuratedPayload(scored, {
        cjTrendingFlag: true,
        country: "United States",
        platform: "TikTok"
      });
      const result = await upsertCuratedProduct(payload);
      if ("error" in result) failed.push({ name: scored.product.nameEn, error: result.error });
      else saved.push(result.data);
    }

    const { data: activeRows } = await supabase
      .from("curated_products")
      .select("id, curated_at")
      .eq("status", "active")
      .order("curated_at", { ascending: false });

    let archived = 0;
    if (activeRows && activeRows.length > MAX_ACTIVE_PRODUCTS) {
      const toArchive = activeRows.slice(MAX_ACTIVE_PRODUCTS).map((row: { id: string }) => row.id);
      const { error: archiveError } = await supabase
        .from("curated_products")
        .update({ status: "archived" })
        .in("id", toArchive);
      if (!archiveError) archived = toArchive.length;
    }

    return noStoreJson({ added: saved.length, failed, archived, skippedDuplicates: freshProducts.length === 0 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Automatic curation run failed." },
      { status: 502 }
    );
  }
}
