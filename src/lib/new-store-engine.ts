import type { BeginnerLaunchRecommendation, BeginnerLaunchSignalSet, Product } from "./types";
import { forecastProduct } from "./forecast-engine";
import { products } from "./mock-products";

export function getNewStoreRecommendations(): BeginnerLaunchRecommendation[] {
  return products
    .map((product) => {
      const forecast = forecastProduct(product);
      const signals = beginnerSignals(product, forecast.expectedTrendLifespan);
      const beginnerLaunchScore = scoreBeginnerLaunch(signals);
      const excludedReasons = exclusionReasons(product, signals, beginnerLaunchScore);

      return {
        product,
        forecast,
        beginnerLaunchScore,
        signals,
        verdict: verdict(beginnerLaunchScore),
        whyRealistic: explainRealisticFit(product, signals, forecast.expectedTrendLifespan),
        launchPlan: launchPlan(product),
        excludedReasons
      };
    })
    .filter((item) => item.excludedReasons.length === 0)
    .sort((a, b) => b.beginnerLaunchScore - a.beginnerLaunchScore);
}

export function getExcludedNewStoreProducts(): BeginnerLaunchRecommendation[] {
  return products
    .map((product) => {
      const forecast = forecastProduct(product);
      const signals = beginnerSignals(product, forecast.expectedTrendLifespan);
      const beginnerLaunchScore = scoreBeginnerLaunch(signals);

      return {
        product,
        forecast,
        beginnerLaunchScore,
        signals,
        verdict: "Do not start here",
        whyRealistic: "",
        launchPlan: [],
        excludedReasons: exclusionReasons(product, signals, beginnerLaunchScore)
      };
    })
    .filter((item) => item.excludedReasons.length > 0)
    .sort((a, b) => b.beginnerLaunchScore - a.beginnerLaunchScore);
}

function beginnerSignals(product: Product, trendLifespan: string): BeginnerLaunchSignalSet {
  return {
    lowSaturation: product.saturation === "Low" ? 94 : product.saturation === "Medium" ? 58 : 18,
    easyShipping: product.shippingEase,
    highMargin: product.profitMargin,
    simpleCreatives: simpleCreativeScore(product),
    lowRefundRisk: refundRiskScore(product),
    reliableSuppliers: product.supplierReliability,
    smallProductSize: sizeScore(product),
    longTrendLifespan: lifespanScore(trendLifespan)
  };
}

function scoreBeginnerLaunch(signals: BeginnerLaunchSignalSet) {
  return Math.round(
    signals.lowSaturation * 0.22 +
      signals.easyShipping * 0.16 +
      signals.highMargin * 0.15 +
      signals.simpleCreatives * 0.13 +
      signals.lowRefundRisk * 0.12 +
      signals.reliableSuppliers * 0.1 +
      signals.smallProductSize * 0.07 +
      signals.longTrendLifespan * 0.05
  );
}

function exclusionReasons(product: Product, signals: BeginnerLaunchSignalSet, score: number) {
  const reasons: string[] = [];
  if (product.saturation === "High") reasons.push("Already saturated");
  if (signals.easyShipping < 68) reasons.push("Shipping complexity is too high for a first store");
  if (signals.lowRefundRisk < 62) reasons.push("Refund or quality-control risk is too high");
  if (signals.smallProductSize < 58) reasons.push("Product is too large or operationally awkward");
  if (score < 72) reasons.push("Beginner Launch Score is below the realistic-success threshold");
  return reasons;
}

function simpleCreativeScore(product: Product) {
  const demoFriendlyCategories = ["Pets", "Kitchen", "Home", "Beauty", "Travel"];
  const base = demoFriendlyCategories.includes(product.category) ? 82 : 64;
  return clamp(Math.round(base + product.viralPotential * 0.14 + (product.adAngles.length - 2) * 4), 35, 98);
}

function refundRiskScore(product: Product) {
  let score = 88;
  if (product.category === "Fitness") score -= 28;
  if (product.category === "Beauty") score -= 8;
  if (product.category === "Garden") score -= 12;
  if (product.estimatedCost > 60) score -= 22;
  if (product.shippingEase < 70) score -= 16;
  return clamp(score, 20, 96);
}

function sizeScore(product: Product) {
  if (product.estimatedCost > 80 || product.shippingEase < 55) return 35;
  if (product.category === "Fitness" || product.name.toLowerCase().includes("walking")) return 28;
  if (product.category === "Garden") return 68;
  return clamp(Math.round(product.shippingEase * 0.72 + 24), 45, 98);
}

function lifespanScore(lifespan: string) {
  if (lifespan.includes("8-12")) return 94;
  if (lifespan.includes("6-10")) return 84;
  if (lifespan.includes("4-8")) return 72;
  return 42;
}

function verdict(score: number) {
  if (score >= 86) return "Best first-store candidate";
  if (score >= 78) return "Realistic beginner launch";
  return "Test carefully";
}

function explainRealisticFit(product: Product, signals: BeginnerLaunchSignalSet, lifespan: string) {
  return `${product.name} is realistic for a new Shopify store because saturation is controlled, shipping is simple, the estimated margin is ${product.profitMargin}%, and the creative can be explained with quick demo-style content. The forecasted trend lifespan is ${lifespan}, which gives a beginner enough time to test without chasing a trend that is already over.`;
}

function launchPlan(product: Product) {
  return [
    `Start with 3 short-form creatives: ${product.adAngles.join(", ")}.`,
    `Price around $${product.suggestedPrice} and protect margin by keeping landed cost near $${product.estimatedCost}.`,
    `Validate with small daily spend before ordering inventory beyond test quantities.`
  ];
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
