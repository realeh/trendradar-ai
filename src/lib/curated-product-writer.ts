import { createSupabaseAdminClient } from "./supabase-admin";
import { sanitizePrompt } from "./api-security";
import { invalidateProductCache } from "./product-store";

export const ALLOWED_PLATFORMS = ["TikTok", "Meta", "Google", "Pinterest", "Amazon"];
export const ALLOWED_SATURATION = ["Low", "Medium", "High"];

export type CuratedProductInput = Record<string, unknown>;

/**
 * Shared validation + row-shaping + upsert logic for writing to the
 * curated_products table. Used by both the manual curation admin route
 * (/api/admin/curated-products) and the AI auto-curate route
 * (/api/admin/ai-curate) so the two paths can never drift apart on what
 * fields are required or how they're sanitized.
 */
export function validateCuratedInput(d: CuratedProductInput): string | null {
  const name = sanitizePrompt(d.name, 180);
  const category = sanitizePrompt(d.category, 60);
  const platform = sanitizePrompt(d.platform, 20);
  const saturation = sanitizePrompt(d.saturation, 10);

  if (!name || !category) return "Product name and category are required.";
  if (!ALLOWED_PLATFORMS.includes(platform)) return `Platform must be one of ${ALLOWED_PLATFORMS.join(", ")}.`;
  if (!ALLOWED_SATURATION.includes(saturation)) return "Saturation must be Low, Medium, or High.";
  return null;
}

export function buildCuratedRow(d: CuratedProductInput) {
  const num = (value: unknown, fallback: number) => (typeof value === "number" && Number.isFinite(value) ? value : fallback);
  const strArray = (value: unknown): string[] => (Array.isArray(value) ? value.filter((v) => typeof v === "string").slice(0, 10) : []);

  return {
    id: typeof d.id === "string" && d.id ? d.id : crypto.randomUUID(),
    name: sanitizePrompt(d.name, 180),
    category: sanitizePrompt(d.category, 60),
    country: sanitizePrompt(d.country, 60) || "United States",
    platform: sanitizePrompt(d.platform, 20),
    trend_score: num(d.trendScore, 70),
    launch_score: num(d.launchScore, 70),
    growth: num(d.growth, 20),
    saturation: sanitizePrompt(d.saturation, 10),
    profit_margin: num(d.profitMargin, 60),
    viral_potential: num(d.viralPotential, 60),
    demand: num(d.demand, 60),
    competition: num(d.competition, 50),
    trend_momentum: num(d.trendMomentum, 60),
    supplier_reliability: num(d.supplierReliability, 70),
    shipping_ease: num(d.shippingEase, 70),
    suggested_price: num(d.suggestedPrice, 0),
    estimated_cost: num(d.estimatedCost, 0),
    target_audience: sanitizePrompt(d.targetAudience, 200),
    why_trending: sanitizePrompt(d.whyTrending, 500),
    trend_forecast: sanitizePrompt(d.trendForecast, 500),
    supplier_notes: sanitizePrompt(d.supplierNotes, 500),
    ai_recommendation: sanitizePrompt(d.aiRecommendation, 500),
    risks: strArray(d.risks),
    similar_alternatives: strArray(d.similarAlternatives),
    ad_angles: strArray(d.adAngles),
    early_signal: sanitizePrompt(d.earlySignal, 300) || null,
    data_source: d.dataSource === "cj_dropshipping" ? "cj_dropshipping" : "manual",
    cj_product_id: sanitizePrompt(d.cjProductId, 100) || null,
    source_url: sanitizePrompt(d.sourceUrl, 500) || null,
    listed_num: typeof d.listedNum === "number" ? d.listedNum : null,
    verified_inventory: typeof d.verifiedInventory === "number" ? d.verifiedInventory : null,
    delivery_cycle_days: sanitizePrompt(d.deliveryCycleDays, 20) || null,
    cj_trending_flag: Boolean(d.cjTrendingFlag),
    curator_trend_assessment: typeof d.curatorTrendAssessment === "number" ? d.curatorTrendAssessment : null,
    curator_notes: sanitizePrompt(d.curatorNotes, 1000) || null,
    curated_by: sanitizePrompt(d.curatedBy, 100) || "admin",
    status: "active",
    curated_at: new Date().toISOString()
  };
}

export async function upsertCuratedProduct(
  d: CuratedProductInput
): Promise<{ data: Record<string, unknown> } | { error: string; status: number }> {
  const validationError = validateCuratedInput(d);
  if (validationError) return { error: validationError, status: 400 };

  const supabase = createSupabaseAdminClient();
  if (!supabase) return { error: "Supabase is not configured.", status: 503 };

  const row = buildCuratedRow(d);
  const { data, error } = await supabase.from("curated_products").upsert(row).select().single();
  if (error) return { error: error.message, status: 500 };

  invalidateProductCache();
  return { data };
}
