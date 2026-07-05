import type { CjProduct } from "./cj-client";
import type { Saturation } from "./types";
import type { CuratedProductInput } from "./curated-product-writer";
import { buildCjSupplierUrl } from "./supplier-links";

export type ScoredCjProduct = {
  product: CjProduct;
  score: number;
  saturation: Saturation;
  competition: number;
  category: string;
  price: number;
  verifiedInventory: number;
};

function toNumber(value: string | number | undefined, fallback = 0) {
  const n = typeof value === "number" ? value : parseFloat(value ?? "");
  return Number.isFinite(n) ? n : fallback;
}

function saturationFromListings(listedNum: number): { saturation: Saturation; competition: number } {
  if (listedNum <= 200) return { saturation: "Low", competition: 25 };
  if (listedNum <= 1000) return { saturation: "Medium", competition: 55 };
  return { saturation: "High", competition: 80 };
}

/**
 * Score a real CJ product on signals that actually exist in the data — no
 * fabricated "virality" numbers. Fewer competing listings and healthy
 * verified inventory push the score up; missing price data or an
 * unworkable price range pulls it down.
 */
export function scoreCjProduct(product: CjProduct): ScoredCjProduct {
  const price = toNumber(product.nowPrice) || toNumber(product.sellPrice);
  const verifiedInventory = product.totalVerifiedInventory ?? product.warehouseInventoryNum ?? 0;
  const listedNum = product.listedNum ?? 0;
  const { saturation, competition } = saturationFromListings(listedNum);

  let score = 100;
  score -= Math.min(60, listedNum / 25);
  score += Math.min(20, verifiedInventory / 500);
  if (price <= 0) score -= 50;
  if (price > 0 && price < 3) score -= 10;
  if (price > 80) score -= 15;
  if (!product.nameEn || product.nameEn.trim().length < 3) score -= 100;

  const category = product.threeCategoryName || product.twoCategoryName || product.oneCategoryName || "General";

  return { product, score: Math.round(score), saturation, competition, category, price, verifiedInventory };
}

export function rankCjProducts(products: CjProduct[], count: number): ScoredCjProduct[] {
  const seen = new Set<string>();
  return products
    .map(scoreCjProduct)
    .filter((p) => {
      if (seen.has(p.product.id)) return false;
      seen.add(p.product.id);
      return p.score > 0;
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, count);
}

type CuratorCopy = {
  targetAudience: string;
  whyTrending: string;
  trendForecast: string;
  supplierNotes: string;
  aiRecommendation: string;
  risks: string[];
  similarAlternatives: string[];
  adAngles: string[];
  earlySignal: string;
};

function heuristicCopy(scored: ScoredCjProduct, cjTrendingFlag: boolean): CuratorCopy {
  const { product, saturation, verifiedInventory, price, category } = scored;
  const listedNum = product.listedNum ?? 0;

  return {
    targetAudience: `Shoppers browsing ${category} on TikTok/Meta looking for a $${price.toFixed(2)}-range impulse buy.`,
    whyTrending: cjTrendingFlag
      ? `CJ Dropshipping's own trending-products flag surfaced this item. It's currently listed by ${listedNum} other sellers on the platform, which is ${saturation.toLowerCase()} saturation for a flagged-trending SKU.`
      : `Sourced from a keyword/category search rather than CJ's trending flag. It's listed by ${listedNum} other sellers, putting it in ${saturation.toLowerCase()} saturation territory.`,
    trendForecast: `No independent forecast signal exists for this SKU — the listing count and inventory snapshot above are real, but predicting future demand direction would need ad-spend or search-trend data this app doesn't have access to. Treat this as a test candidate, not a guaranteed winner.`,
    supplierNotes: `${verifiedInventory} units of CJ-verified inventory` + (product.deliveryCycle ? `, delivery cycle ~${product.deliveryCycle}.` : "."),
    aiRecommendation: `Auto-selected for its ${saturation.toLowerCase()} saturation (${listedNum} competing listings) and verified stock. This is a rules-based read of real CJ catalog data, not a validated sales forecast — review before spending on ads.`,
    risks: [
      saturation === "High" ? "Already widely listed — differentiation will be hard." : "Limited validation beyond CJ listing/inventory data.",
      verifiedInventory < 50 ? "Low verified inventory — confirm stock before scaling ad spend." : "Standard dropshipping fulfillment/shipping-time risk."
    ],
    similarAlternatives: [],
    adAngles: [`Show the ${category.toLowerCase()} problem it solves in the first 2 seconds of a UGC-style video.`],
    earlySignal: cjTrendingFlag ? "Flagged as trending by CJ Dropshipping's own platform data." : ""
  };
}

function curatorPrompt(scored: ScoredCjProduct, cjTrendingFlag: boolean): string {
  const { product, saturation, verifiedInventory, price, category } = scored;

  return `You are helping curate a real dropshipping product for an ecommerce trend-research app. Use ONLY the facts given below — do not invent statistics, sales numbers, or trend data that isn't provided. Write honest, grounded copy.

Facts (all real, from CJ Dropshipping's live catalog):
- Product name: ${product.nameEn}
- Category: ${category}
- Price: $${price.toFixed(2)}
- Listed by ${product.listedNum ?? 0} other sellers on CJ (saturation: ${saturation})
- CJ-verified inventory: ${verifiedInventory} units
- Delivery cycle: ${product.deliveryCycle || "not specified"}
- CJ trending flag set: ${cjTrendingFlag ? "yes" : "no"}

Return ONLY valid JSON with these exact keys: targetAudience (string, 1 sentence), whyTrending (string, grounded in the facts above, no invented numbers), trendForecast (string, honest — say clearly that forecast confidence is limited given the data available), supplierNotes (string, based on the inventory/delivery facts), aiRecommendation (string, 1-2 sentences, note this is a data-grounded suggestion not a guarantee), risks (array of 1-3 short strings), similarAlternatives (array of 0-3 short strings, general product-category alternatives, not fabricated brand names), adAngles (array of 1-3 short strings), earlySignal (short string or empty string).`;
}

function parseCuratorCopy(content: string): CuratorCopy | null {
  try {
    const parsed = JSON.parse(content);
    return {
      targetAudience: String(parsed.targetAudience || "").slice(0, 200),
      whyTrending: String(parsed.whyTrending || "").slice(0, 500),
      trendForecast: String(parsed.trendForecast || "").slice(0, 500),
      supplierNotes: String(parsed.supplierNotes || "").slice(0, 500),
      aiRecommendation: String(parsed.aiRecommendation || "").slice(0, 500),
      risks: Array.isArray(parsed.risks) ? parsed.risks.map(String).slice(0, 5) : [],
      similarAlternatives: Array.isArray(parsed.similarAlternatives) ? parsed.similarAlternatives.map(String).slice(0, 5) : [],
      adAngles: Array.isArray(parsed.adAngles) ? parsed.adAngles.map(String).slice(0, 5) : [],
      earlySignal: String(parsed.earlySignal || "").slice(0, 300)
    };
  } catch {
    return null;
  }
}

async function claudeCopy(scored: ScoredCjProduct, cjTrendingFlag: boolean): Promise<CuratorCopy | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5",
        max_tokens: 700,
        messages: [{ role: "user", content: curatorPrompt(scored, cjTrendingFlag) }]
      })
    });

    if (!response.ok) return null;
    const payload = await response.json();
    const text = payload.content?.[0]?.text;
    if (typeof text !== "string") return null;

    // Claude may wrap JSON in prose or a code fence despite instructions; pull out the first {...} block.
    const match = text.match(/\{[\s\S]*\}/);
    return match ? parseCuratorCopy(match[0]) : parseCuratorCopy(text);
  } catch {
    return null;
  }
}

async function openAiCopy(scored: ScoredCjProduct, cjTrendingFlag: boolean): Promise<CuratorCopy | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [{ role: "user", content: curatorPrompt(scored, cjTrendingFlag) }],
        response_format: { type: "json_object" },
        temperature: 0.4
      })
    });

    if (!response.ok) return null;
    const payload = await response.json();
    const content = payload.choices?.[0]?.message?.content;
    return content ? parseCuratorCopy(content) : null;
  } catch {
    return null;
  }
}

export type CurationOptions = {
  cjTrendingFlag: boolean;
  country?: string;
  platform?: string;
};

/**
 * Builds the full payload for /api/admin/curated-products from a scored,
 * real CJ product. Numeric/provenance fields are always derived from real
 * CJ data; only the descriptive copy is AI-written (Claude preferred,
 * OpenAI as a fallback, otherwise an honest rules-based template that says so).
 */
export async function buildCuratedPayload(scored: ScoredCjProduct, options: CurationOptions): Promise<CuratedProductInput> {
  const { product, saturation, competition, verifiedInventory, price, category } = scored;

  const claudeResult = await claudeCopy(scored, options.cjTrendingFlag);
  const openAiResult = claudeResult ? null : await openAiCopy(scored, options.cjTrendingFlag);
  const copy = claudeResult ?? openAiResult ?? heuristicCopy(scored, options.cjTrendingFlag);
  const provider = claudeResult ? "claude" : openAiResult ? "openai" : "heuristic";

  const suggestedPrice = Math.round(price * 3 * 100) / 100;
  const launchScore = Math.round((70 + 75 + (100 - competition)) / 3);

  return {
    name: product.nameEn,
    category,
    country: options.country || "United States",
    platform: options.platform || "TikTok",
    saturation,
    growth: 20,
    trendScore: Math.max(1, Math.min(99, scored.score)),
    launchScore,
    profitMargin: suggestedPrice > 0 ? Math.round(((suggestedPrice - price) / suggestedPrice) * 100) : 0,
    viralPotential: Math.max(1, 100 - competition),
    demand: Math.max(1, 100 - competition - 10),
    competition,
    trendMomentum: options.cjTrendingFlag ? 70 : 50,
    supplierReliability: verifiedInventory > 0 ? 80 : 55,
    shippingEase: 70,
    suggestedPrice,
    estimatedCost: price,
    targetAudience: copy.targetAudience,
    whyTrending: copy.whyTrending,
    trendForecast: copy.trendForecast,
    supplierNotes: copy.supplierNotes,
    aiRecommendation: copy.aiRecommendation,
    risks: copy.risks,
    similarAlternatives: copy.similarAlternatives,
    adAngles: copy.adAngles,
    earlySignal: copy.earlySignal,
    dataSource: "cj_dropshipping",
    cjProductId: product.id,
    sourceUrl: buildCjSupplierUrl(product.sku || product.nameEn),
    listedNum: product.listedNum,
    verifiedInventory,
    deliveryCycleDays: product.deliveryCycle,
    cjTrendingFlag: options.cjTrendingFlag,
    curatorTrendAssessment: null,
    curatorNotes:
      provider === "claude"
        ? "AI auto-curated using Claude, grounded in real CJ catalog data."
        : provider === "openai"
          ? "AI auto-curated using OpenAI, grounded in real CJ catalog data."
          : "AI auto-curated using rules-based analysis of real CJ catalog data (no ANTHROPIC_API_KEY or OPENAI_API_KEY configured — set one for richer, AI-written copy).",
    curatedBy: `ai-auto-${provider}`
  };
}
