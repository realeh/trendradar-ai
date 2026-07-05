import type { CompetitionLevel, HiddenGemRecommendation, Product } from "./types";
import { forecastProduct } from "./forecast-engine";
import { products } from "./mock-products";

export function getHiddenGemRecommendations(): HiddenGemRecommendation[] {
  return products
    .map((product) => {
      const forecast = forecastProduct(product);
      const earlyGrowthScore = earlyGrowth(product);
      const competitionLevel = competitionLevelFor(product, forecast.signals.competitionGrowth);
      const trendProbability = trendProbabilityFor(product, forecast.forecastConfidence, earlyGrowthScore);
      const confidence = confidenceFor(product, forecast.forecastConfidence, earlyGrowthScore);

      return {
        product,
        forecast,
        earlyGrowthScore,
        competitionLevel,
        trendProbability,
        estimatedTimeBeforeSaturation: forecast.expectedSaturationDate,
        confidence,
        whySelected: whySelected(product, earlyGrowthScore, trendProbability, competitionLevel),
        saturationWarning: saturationWarning(product, forecast.signals.competitionGrowth)
      };
    })
    .filter((item) => isStillEarly(item))
    .sort((a, b) => b.earlyGrowthScore + b.trendProbability - (a.earlyGrowthScore + a.trendProbability));
}

function isStillEarly(item: HiddenGemRecommendation) {
  if (item.product.saturation === "High") return false;
  if (item.product.competition > 56) return false;
  if (item.forecast.signals.competitionGrowth > 72) return false;
  return item.earlyGrowthScore >= 58 && item.trendProbability >= 60;
}

function earlyGrowth(product: Product) {
  const lowCompetitionLift = 100 - product.competition;
  const saturationLift = product.saturation === "Low" ? 18 : product.saturation === "Medium" ? 4 : -24;

  return clamp(
    Math.round(
      product.growth * 0.72 +
        product.trendMomentum * 0.28 +
        product.viralPotential * 0.16 +
        lowCompetitionLift * 0.18 +
        saturationLift
    ),
    1,
    99
  );
}

function trendProbabilityFor(product: Product, forecastConfidence: number, earlyGrowthScore: number) {
  return clamp(
    Math.round(
      forecastConfidence * 0.34 +
        earlyGrowthScore * 0.28 +
        product.trendMomentum * 0.18 +
        product.demand * 0.12 +
        (100 - product.competition) * 0.08
    ),
    1,
    98
  );
}

function confidenceFor(product: Product, forecastConfidence: number, earlyGrowthScore: number) {
  const signalClarity = Math.abs(product.trendMomentum - product.competition);
  return clamp(Math.round(forecastConfidence * 0.52 + earlyGrowthScore * 0.28 + signalClarity * 0.2), 35, 96);
}

function competitionLevelFor(product: Product, competitionGrowth: number): CompetitionLevel {
  if (competitionGrowth >= 62 || product.saturation === "Medium") return "Rising";
  if (product.competition <= 32) return "Very Low";
  if (product.competition <= 42) return "Low";
  return "Moderate";
}

function saturationWarning(product: Product, competitionGrowth: number) {
  if (product.saturation === "Medium" || competitionGrowth >= 60) {
    return "This product is still early enough to evaluate, but competition signals are rising. Test quickly and watch ad-library duplication.";
  }
  return undefined;
}

function whySelected(product: Product, earlyGrowthScore: number, trendProbability: number, competitionLevel: CompetitionLevel) {
  return `${product.name} was selected because it has an early growth score of ${earlyGrowthScore}/100, ${competitionLevel.toLowerCase()} competition, and a ${trendProbability}% trend probability while still avoiding full saturation. ${product.earlySignal ?? product.whyTrending}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
