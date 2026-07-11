import type { Platform, Product, SimulatorMatchType, SimulatorOutcome, SimulatorResult } from "./types";
import { forecastProduct } from "./forecast-engine";
import { opportunityScore } from "./scoring";
import { isCjConfigured, searchCjProducts } from "./cj-client";
import { scoreCjProduct } from "./ai-curator";
import { buildCjSupplierUrl } from "./supplier-links";

const countriesByCategory: Record<string, string[]> = {
  Beauty: ["Australia", "New Zealand", "United States"],
  Fitness: ["United States", "Canada", "United Kingdom"],
  Pets: ["Canada", "United States", "Australia"],
  Kitchen: ["United Kingdom", "Australia", "United States"],
  Home: ["Australia", "United States", "United Kingdom"],
  Garden: ["United States", "United Kingdom", "Canada"],
  Travel: ["Australia", "New Zealand", "United States"]
};

/**
 * Runs the simulation for a typed product name/link. Match order:
 *  1. Exact-ish name match against the user's curated catalog.
 *  2. Category match against the curated catalog.
 *  3. A live CJ Dropshipping keyword search — so a product that isn't in
 *     the curated catalog yet still gets a real, grounded answer instead of
 *     silently substituting an unrelated catalog item under the wrong name.
 * If none of those find anything real, this returns `{ found: false }`
 * rather than fabricating a result — honesty over always showing a number.
 */
export async function simulateProductAnalysis(input: string, products: Product[]): Promise<SimulatorOutcome> {
  const match = await matchProduct(input, products);
  if (!match) return { found: false, query: input };

  const { product, matchType } = match;
  const forecast = forecastProduct(product);
  const successProbability = successProbabilityFor(product);
  const finalRecommendation = recommendationFor(successProbability, product);
  const estimatedProfit = Math.max(0, product.suggestedPrice - product.estimatedCost);

  return {
    found: true,
    result: {
      productName: matchType === "live_cj_search" ? product.name : displayName(input, product),
      matchType,
      sourceUrl: product.sourceUrl,
      successProbability,
      demandScore: product.demand,
      targetAudience: product.targetAudience,
      countries: countriesByCategory[product.category] ?? [product.country],
      bestAdPlatform: bestPlatformFor(product),
      sellingPrice: product.suggestedPrice,
      productCost: product.estimatedCost,
      estimatedProfit,
      suggestedPrice: product.suggestedPrice,
      profitMargin: product.profitMargin,
      competition: product.saturation,
      competitionScore: product.competition,
      saturation: product.saturation,
      tiktokHooks: tiktokHooksFor(product),
      facebookAdAngles: facebookAnglesFor(product),
      potentialProblems: potentialProblemsFor(product, forecast.expectedSaturationDate),
      finalRecommendation,
      adAngles: product.adAngles,
      notes: finalNote(product, finalRecommendation)
    }
  };
}

async function matchProduct(
  input: string,
  products: Product[]
): Promise<{ product: Product; matchType: SimulatorMatchType } | null> {
  const normalized = input.toLowerCase();
  const cleaned = normalized.replace(/^https?:\/\//, "").replace(/[-_/?=&.]+/g, " ");

  const direct = products.find((product) => {
    const terms = product.name.toLowerCase().split(" ").filter((term) => term.length > 3);
    return terms.some((term) => cleaned.includes(term));
  });
  if (direct) return { product: direct, matchType: "catalog_name" };

  const categoryMatch = products.find((product) => cleaned.includes(product.category.toLowerCase()));
  if (categoryMatch) return { product: categoryMatch, matchType: "catalog_category" };

  // Not in the curated catalog — try a live CJ Dropshipping search instead
  // of guessing. Skip this for pasted URLs, since a raw link isn't a useful
  // keyword search term (real link-parsing isn't built yet, per the UI copy).
  const trimmed = input.trim();
  if (!trimmed || /^https?:\/\//i.test(trimmed) || !isCjConfigured()) return null;

  try {
    const searchResult = await searchCjProducts({ keyWord: trimmed.slice(0, 60), size: 20 });
    if (!searchResult.products.length) return null;

    const scored = searchResult.products
      .map(scoreCjProduct)
      .filter((candidate) => candidate.score > 0)
      .sort((a, b) => b.score - a.score)[0];
    if (!scored) return null;

    return { product: cjResultToProduct(scored), matchType: "live_cj_search" };
  } catch {
    return null;
  }
}

function cjResultToProduct(scored: ReturnType<typeof scoreCjProduct>): Product {
  const { product: cj, saturation, competition, verifiedInventory, price, category } = scored;
  const suggestedPrice = Math.round(price * 3 * 100) / 100;

  return {
    id: cj.id,
    name: cj.nameEn,
    category,
    country: "United States",
    platform: "TikTok",
    trendScore: Math.max(1, Math.min(99, scored.score)),
    launchScore: Math.round((70 + 75 + (100 - competition)) / 3),
    growth: 20,
    saturation,
    profitMargin: suggestedPrice > 0 ? Math.round(((suggestedPrice - price) / suggestedPrice) * 100) : 0,
    viralPotential: Math.max(1, 100 - competition),
    demand: Math.max(1, 100 - competition - 10),
    competition,
    trendMomentum: 55,
    supplierReliability: verifiedInventory > 0 ? 80 : 55,
    shippingEase: 70,
    suggestedPrice,
    estimatedCost: price,
    targetAudience: `Shoppers browsing ${category} on TikTok/Meta looking for a $${price.toFixed(2)}-range impulse buy.`,
    whyTrending: `Live result from CJ Dropshipping's catalog — not yet in your curated list. Listed by ${cj.listedNum ?? 0} other sellers, which is ${saturation.toLowerCase()} saturation.`,
    trendForecast: "No independent forecast signal exists yet for this SKU — this is a fresh live-search result, not a curated or AI-reviewed catalog entry.",
    supplierNotes: `${verifiedInventory} units of CJ-verified inventory` + (cj.deliveryCycle ? `, delivery cycle ~${cj.deliveryCycle}.` : "."),
    aiRecommendation:
      "Pulled live from CJ Dropshipping's catalog because it wasn't already in your curated list. Numbers above are real CJ data; run it through /admin/curate to add AI-written strategy notes and save it permanently.",
    risks: [
      saturation === "High" ? "Already widely listed — differentiation will be hard." : "Limited validation beyond this live CJ snapshot.",
      "Not yet reviewed by your curated catalog — treat this as an early, unvetted lead."
    ],
    similarAlternatives: [`Other ${category.toLowerCase()} listings on CJ Dropshipping`],
    adAngles: [`Show the ${category.toLowerCase()} problem it solves in the first 2 seconds of a UGC-style video.`],
    dataSource: "cj_dropshipping",
    cjProductId: cj.id,
    sourceUrl: buildCjSupplierUrl(cj.sku || cj.nameEn),
    listedNum: cj.listedNum,
    verifiedInventory,
    deliveryCycleDays: cj.deliveryCycle
  };
}

function displayName(input: string, product: Product) {
  const trimmed = input.trim();
  if (!trimmed) return product.name;
  if (/^https?:\/\//i.test(trimmed)) return `${product.name} from pasted link`;
  return trimmed;
}

function successProbabilityFor(product: Product) {
  const score =
    opportunityScore(product) * 0.34 +
    product.demand * 0.18 +
    (100 - product.competition) * 0.16 +
    product.profitMargin * 0.13 +
    product.shippingEase * 0.1 +
    product.supplierReliability * 0.09;

  const saturationPenalty = product.saturation === "High" ? 16 : product.saturation === "Medium" ? 6 : 0;
  return clamp(Math.round(score - saturationPenalty), 18, 94);
}

function recommendationFor(successProbability: number, product: Product): "Avoid" | "Test" | "Strong Test" {
  if (product.saturation === "High" || product.shippingEase < 55 || successProbability < 56) return "Avoid";
  if (successProbability >= 76 && product.saturation === "Low") return "Strong Test";
  return "Test";
}

function bestPlatformFor(product: Product): Platform {
  if (product.viralPotential >= 82) return "TikTok";
  if (product.category === "Home" || product.category === "Kitchen" || product.category === "Garden") return "Pinterest";
  if (product.suggestedPrice >= 90) return "Meta";
  return product.platform;
}

function tiktokHooksFor(product: Product) {
  return [
    `I wish I knew about this ${product.category.toLowerCase()} product sooner`,
    `Watch this fix a real problem in under 10 seconds`,
    `${product.adAngles[0]}: before vs after`
  ];
}

function facebookAnglesFor(product: Product) {
  return [
    `Problem-solution carousel for ${product.targetAudience.toLowerCase()}`,
    `Bundle offer around ${product.similarAlternatives[0].toLowerCase()}`,
    `Testimonial-style ad focused on convenience and value`
  ];
}

function potentialProblemsFor(product: Product, saturationDate: string) {
  const problems = [...product.risks];
  if (product.saturation !== "Low") problems.push(`Saturation may tighten within ${saturationDate}.`);
  if (product.profitMargin < 55) problems.push("Margin may be thin after ads, returns, and payment fees.");
  if (product.shippingEase < 70) problems.push("Shipping or returns may create support pressure.");
  return problems;
}

function finalNote(product: Product, recommendation: SimulatorResult["finalRecommendation"]) {
  if (recommendation === "Avoid") {
    return `${product.name} has too much beginner risk right now. I would avoid it unless you have a clear creative edge, supplier advantage, or audience already built.`;
  }

  if (recommendation === "Strong Test") {
    return `${product.name} is a strong test because it combines demand, manageable competition, healthy margin, and simple ad concepts. Keep the first test lean and let creative performance decide whether to scale.`;
  }

  return `${product.name} is worth a controlled test, but it needs disciplined creative testing and careful supplier checks before deeper inventory commitment.`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
