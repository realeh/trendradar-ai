import type { Product } from "./types";

export function opportunityScore(product: Product) {
  const lowCompetition = 100 - product.competition;
  return Math.round(
    product.demand * 0.3 +
      lowCompetition * 0.2 +
      product.profitMargin * 0.2 +
      product.trendMomentum * 0.15 +
      product.supplierReliability * 0.1 +
      product.shippingEase * 0.05
  );
}

export function saturationColor(level: Product["saturation"]) {
  if (level === "Low") return "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-200";
  if (level === "Medium") return "bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-200";
  return "bg-red-100 text-red-800 dark:bg-red-400/15 dark:text-red-200";
}

export function scoreTone(score: number) {
  if (score >= 82) return "text-emerald-700 dark:text-emerald-300";
  if (score >= 68) return "text-tide dark:text-cyan-200";
  return "text-coral dark:text-orange-200";
}
