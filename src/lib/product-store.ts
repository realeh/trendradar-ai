import type { Platform, Product, Saturation } from "./types";
import { createSupabaseAdminClient } from "./supabase-admin";
import { seedProducts } from "./mock-products";

type CuratedProductRow = {
  id: string;
  name: string;
  category: string;
  country: string;
  platform: Platform;
  trend_score: number;
  launch_score: number;
  growth: number;
  saturation: Saturation;
  profit_margin: number;
  viral_potential: number;
  demand: number;
  competition: number;
  trend_momentum: number;
  supplier_reliability: number;
  shipping_ease: number;
  suggested_price: number;
  estimated_cost: number;
  target_audience: string;
  why_trending: string;
  trend_forecast: string;
  supplier_notes: string;
  ai_recommendation: string;
  risks: string[];
  similar_alternatives: string[];
  ad_angles: string[];
  early_signal: string | null;
  data_source: "cj_dropshipping" | "manual";
  cj_product_id: string | null;
  source_url: string | null;
  listed_num: number | null;
  verified_inventory: number | null;
  delivery_cycle_days: string | null;
  cj_trending_flag: boolean | null;
  curator_trend_assessment: number | null;
  curator_notes: string | null;
  curated_by: string | null;
  curated_at: string | null;
};

function rowToProduct(row: CuratedProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    country: row.country,
    platform: row.platform,
    trendScore: row.trend_score,
    launchScore: row.launch_score,
    growth: row.growth,
    saturation: row.saturation,
    profitMargin: row.profit_margin,
    viralPotential: row.viral_potential,
    demand: row.demand,
    competition: row.competition,
    trendMomentum: row.trend_momentum,
    supplierReliability: row.supplier_reliability,
    shippingEase: row.shipping_ease,
    suggestedPrice: row.suggested_price,
    estimatedCost: row.estimated_cost,
    targetAudience: row.target_audience,
    whyTrending: row.why_trending,
    trendForecast: row.trend_forecast,
    supplierNotes: row.supplier_notes,
    aiRecommendation: row.ai_recommendation,
    risks: row.risks ?? [],
    similarAlternatives: row.similar_alternatives ?? [],
    adAngles: row.ad_angles ?? [],
    earlySignal: row.early_signal ?? undefined,
    dataSource: row.data_source,
    cjProductId: row.cj_product_id ?? undefined,
    sourceUrl: row.source_url ?? undefined,
    listedNum: row.listed_num ?? undefined,
    verifiedInventory: row.verified_inventory ?? undefined,
    deliveryCycleDays: row.delivery_cycle_days ?? undefined,
    cjTrendingFlag: row.cj_trending_flag ?? undefined,
    curatorTrendAssessment: row.curator_trend_assessment ?? undefined,
    curatorNotes: row.curator_notes ?? undefined,
    curatedBy: row.curated_by ?? undefined,
    curatedAt: row.curated_at ?? undefined
  };
}

let cache: { products: Product[]; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 60_000;

/**
 * The single source of truth for product data across the app.
 *
 * Order of preference:
 *  1. Curator-approved products from the `curated_products` Supabase table
 *     (populated via /admin/curate, sourced from the real CJ Dropshipping
 *     catalog plus a human's trend judgment).
 *  2. If Supabase isn't configured or the table is empty, falls back to the
 *     bundled seed/demo catalog so the app still renders — but every seed
 *     product is tagged dataSource: "demo" so the UI can disclose that
 *     honestly instead of pretending it's live intelligence.
 */
export async function getActiveProducts(options: { skipCache?: boolean } = {}): Promise<Product[]> {
  if (!options.skipCache && cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.products;
  }

  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("curated_products")
      .select("*")
      .eq("status", "active")
      .order("curated_at", { ascending: false });

    if (!error && data && data.length > 0) {
      const products = (data as CuratedProductRow[]).map(rowToProduct);
      cache = { products, fetchedAt: Date.now() };
      return products;
    }
  }

  const demoProducts = seedProducts.map((product) => ({ ...product, dataSource: "demo" as const }));
  cache = { products: demoProducts, fetchedAt: Date.now() };
  return demoProducts;
}

export function invalidateProductCache() {
  cache = null;
}

export function deriveFilterOptions(products: Product[]) {
  return {
    categories: Array.from(new Set(products.map((product) => product.category))),
    countries: Array.from(new Set(products.map((product) => product.country))),
    platforms: Array.from(new Set(products.map((product) => product.platform)))
  };
}
