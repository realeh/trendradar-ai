import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { noStoreJson, rateLimit, readJsonBody, sanitizePrompt } from "@/lib/api-security";
import { isCjConfigured, searchCjProducts } from "@/lib/cj-client";
import { buildCuratedPayload, rankCjProducts } from "@/lib/ai-curator";
import { upsertCuratedProduct } from "@/lib/curated-product-writer";

/**
 * AI Auto-Curate: searches the live CJ Dropshipping catalog, scores results
 * on real signals (competing listings, verified inventory, price sanity),
 * and writes up + saves the top candidates automatically — no manual
 * per-product form-filling required. Numeric fields always come from real
 * CJ data; descriptive copy is AI-written (Claude preferred, OpenAI as a
 * second choice, otherwise an honest rules-based fallback) and every saved
 * row discloses which path produced it via curatedBy.
 */
export async function POST(request: Request) {
  const limited = rateLimit(request, 5, 60_000);
  if (limited) return limited;

  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  if (!isCjConfigured()) {
    return NextResponse.json(
      { error: "CJ_DROPSHIPPING_API_KEY is not set. Add it to your environment to run AI curation against the live catalog." },
      { status: 503 }
    );
  }

  const body = await readJsonBody<{
    keyword?: unknown;
    trendingOnly?: unknown;
    count?: unknown;
    country?: unknown;
    platform?: unknown;
  }>(request);
  if (body.error) return body.error;

  const keyword = sanitizePrompt(body.data?.keyword, 100);
  const trendingOnly = body.data?.trendingOnly !== false;
  const count = Math.max(1, Math.min(10, typeof body.data?.count === "number" ? body.data.count : 5));
  const country = sanitizePrompt(body.data?.country, 60) || "United States";
  const platform = sanitizePrompt(body.data?.platform, 20) || "TikTok";

  try {
    const searchResult = await searchCjProducts({
      keyWord: keyword || undefined,
      productFlag: trendingOnly ? 0 : undefined,
      size: 50
    });

    const ranked = rankCjProducts(searchResult.products, count);
    if (ranked.length === 0) {
      return NextResponse.json({ error: "No usable products found for that search." }, { status: 404 });
    }

    const saved: unknown[] = [];
    const failed: { name: string; error: string }[] = [];

    for (const scored of ranked) {
      const payload = await buildCuratedPayload(scored, { cjTrendingFlag: trendingOnly, country, platform });
      const result = await upsertCuratedProduct(payload);
      if ("error" in result) {
        failed.push({ name: scored.product.nameEn, error: result.error });
      } else {
        saved.push(result.data);
      }
    }

    const aiProvider = process.env.ANTHROPIC_API_KEY ? "claude" : process.env.OPENAI_API_KEY ? "openai" : "heuristic";
    return noStoreJson({ saved, failed, aiProvider });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "AI curation failed." }, { status: 502 });
  }
}
