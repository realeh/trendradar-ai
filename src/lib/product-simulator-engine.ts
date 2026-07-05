import type { Platform, Product, SimulatorResult } from "./types";
import { forecastProduct } from "./forecast-engine";
import { opportunityScore } from "./scoring";

const countriesByCategory: Record<string, string[]> = {
  Beauty: ["Australia", "New Zealand", "United States"],
  Fitness: ["United States", "Canada", "United Kingdom"],
  Pets: ["Canada", "United States", "Australia"],
  Kitchen: ["United Kingdom", "Australia", "United States"],
  Home: ["Australia", "United States", "United Kingdom"],
  Garden: ["United States", "United Kingdom", "Canada"],
  Travel: ["Australia", "New Zealand", "United States"]
};

export function simulateProductAnalysis(input: string, products: Product[]): SimulatorResult {
  const product = matchProduct(input, products);
  const forecast = forecastProduct(product);
  const successProbability = successProbabilityFor(product);
  const finalRecommendation = recommendationFor(successProbability, product);
  const estimatedProfit = Math.max(0, product.suggestedPrice - product.estimatedCost);

  return {
    productName: displayName(input, product),
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
  };
}

function matchProduct(input: string, products: Product[]): Product {
  const normalized = input.toLowerCase();
  const cleaned = normalized.replace(/^https?:\/\//, "").replace(/[-_/?=&.]+/g, " ");
  const direct = products.find((product) => {
    const terms = product.name.toLowerCase().split(" ").filter((term) => term.length > 3);
    return terms.some((term) => cleaned.includes(term));
  });

  if (direct) return direct;

  const categoryMatch = products.find((product) => cleaned.includes(product.category.toLowerCase()));
  if (categoryMatch) return categoryMatch;

  const seed = cleaned.length || 7;
  return products[seed % products.length];
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
