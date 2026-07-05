import type { ForecastSignalSet, ForecastWindow, GrowthDirection, Product, ProductForecast } from "./types";

const categorySeasonality: Record<string, number> = {
  Beauty: 76,
  Fitness: 62,
  Pets: 72,
  Kitchen: 68,
  Home: 82,
  Garden: 70,
  Travel: 84
};

export function forecastProduct(product: Product): ProductForecast {
  const signals = deriveSignals(product);
  const demandPressure = weightedAverage([
    [signals.googleSearchGrowth, 0.14],
    [signals.tiktokCreatorGrowth, 0.13],
    [signals.videoEngagement, 0.13],
    [signals.pinterestSaves, 0.1],
    [signals.marketplaceSalesGrowth, 0.13],
    [signals.searchMomentum, 0.12],
    [signals.trendAcceleration, 0.12],
    [signals.seasonality, 0.08],
    [signals.supplierAvailability, 0.08],
    [100 - signals.competitionGrowth, 0.07]
  ]);

  const expectedGrowth = Math.round((demandPressure - 50) * 0.9 + product.growth);
  const forecastConfidence = Math.round(
    weightedAverage([
      [demandPressure, 0.44],
      [signals.supplierAvailability, 0.18],
      [product.supplierReliability, 0.14],
      [product.trendMomentum, 0.14],
      [100 - signals.competitionGrowth, 0.1]
    ])
  );

  const windows: ForecastWindow[] = [2, 4, 8].map((weeks) => {
    const decay = weeks === 2 ? 0.58 : weeks === 4 ? 1 : 1.54;
    const competitionDrag = Math.max(0, signals.competitionGrowth - 52) * (weeks === 8 ? 0.18 : 0.09);
    const growth = Math.round(expectedGrowth * decay - competitionDrag);
    return {
      weeks: weeks as 2 | 4 | 8,
      expectedGrowth: growth,
      confidence: clamp(Math.round(forecastConfidence - (weeks === 8 ? 8 : weeks === 4 ? 3 : 0)), 35, 96),
      growthDirection: growthDirection(growth, signals.trendAcceleration)
    };
  });

  return {
    forecastConfidence: clamp(forecastConfidence, 35, 96),
    expectedGrowth: clamp(expectedGrowth, -18, 72),
    expectedTrendLifespan: trendLifespan(forecastConfidence, signals.competitionGrowth, signals.trendAcceleration),
    expectedSaturationDate: saturationDate(product, signals),
    growthDirection: growthDirection(expectedGrowth, signals.trendAcceleration),
    confidenceExplanation: explainConfidence(product, signals, forecastConfidence),
    windows,
    signals
  };
}

function deriveSignals(product: Product): ForecastSignalSet {
  const saturationPenalty = product.saturation === "High" ? 16 : product.saturation === "Medium" ? 7 : 0;
  const platformLift = product.platform === "TikTok" ? 8 : product.platform === "Pinterest" ? 5 : product.platform === "Google" ? 4 : 1;
  const hasRealCatalogData = product.dataSource === "cj_dropshipping";
  const curatorAssessment = product.curatorTrendAssessment;

  const socialEstimate = curatorAssessment ?? clamp(Math.round(product.viralPotential * 0.58 + product.growth * 0.7 + platformLift - saturationPenalty), 18, 99);

  const supplierAvailability = hasRealCatalogData && product.verifiedInventory !== undefined
    ? clamp(Math.round((product.verifiedInventory / 10)), 20, 99)
    : clamp(Math.round(product.supplierReliability * 0.7 + product.shippingEase * 0.26), 20, 99);

  const competitionGrowth = hasRealCatalogData && product.listedNum !== undefined
    ? clamp(Math.round(20 + Math.log10(product.listedNum + 1) * 25), 12, 98)
    : clamp(Math.round(product.competition * 0.7 + product.growth * 0.45 + (product.saturation === "High" ? 14 : 0)), 12, 98);

  return {
    googleSearchGrowth: curatorAssessment ?? clamp(Math.round(product.demand * 0.54 + product.trendMomentum * 0.32 + product.growth * 0.55 - saturationPenalty), 20, 98),
    tiktokCreatorGrowth: socialEstimate,
    videoEngagement: curatorAssessment ?? clamp(Math.round(product.viralPotential * 0.72 + product.trendMomentum * 0.22 - saturationPenalty * 0.5), 20, 99),
    pinterestSaves: clamp(Math.round((product.category === "Home" || product.category === "Kitchen" || product.category === "Garden" ? 18 : 5) + product.demand * 0.48 + product.growth * 0.45), 18, 96),
    marketplaceSalesGrowth: hasRealCatalogData && product.listedNum !== undefined
      ? clamp(Math.round(100 - Math.log10(product.listedNum + 1) * 18), 18, 98)
      : clamp(Math.round(product.demand * 0.42 + product.growth * 0.82 + product.profitMargin * 0.18), 18, 98),
    supplierAvailability,
    competitionGrowth,
    searchMomentum: curatorAssessment ?? clamp(Math.round(product.trendMomentum * 0.68 + product.demand * 0.2 + product.growth * 0.35), 20, 99),
    trendAcceleration: clamp(Math.round(product.growth * 1.15 + product.trendMomentum * 0.42 - saturationPenalty), 12, 96),
    seasonality: categorySeasonality[product.category] ?? 64
  };
}

function explainConfidence(product: Product, signals: ForecastSignalSet, confidence: number) {
  const positives = [
    signals.searchMomentum >= 75 ? "search momentum is strong" : "",
    signals.tiktokCreatorGrowth >= 75 ? "creator growth is expanding" : "",
    signals.videoEngagement >= 78 ? "video engagement is healthy" : "",
    signals.supplierAvailability >= 78 ? "supplier availability supports scaling" : "",
    signals.seasonality >= 78 ? "seasonality is favorable" : ""
  ].filter(Boolean);

  const concerns = [
    signals.competitionGrowth >= 72 ? "competition is rising quickly" : "",
    product.saturation === "High" ? "current saturation is already high" : ""
  ].filter(Boolean);

  const provenance = product.dataSource === "cj_dropshipping"
    ? "Catalog and inventory signals are pulled from live CJ Dropshipping data; social/search signals are still a curator estimate unless noted."
    : product.dataSource === "demo"
      ? "This is demo data, not a live product - replace it by curating real products in /admin/curate."
      : "";

  return ("Confidence is " + confidence + "/100 because " + (positives.length ? positives.join(", ") : "the signal mix is balanced") + ". " + (concerns.length ? ("Watch-outs: " + concerns.join(", ") + ".") : "No single signal is overwhelming the forecast.") + " " + provenance).trim();
}

function trendLifespan(confidence: number, competitionGrowth: number, acceleration: number) {
  if (confidence >= 82 && competitionGrowth < 62) return "8-12 weeks";
  if (acceleration >= 70 && competitionGrowth < 75) return "6-10 weeks";
  if (competitionGrowth >= 78) return "2-4 weeks";
  return "4-8 weeks";
}

function saturationDate(product: Product, signals: ForecastSignalSet) {
  const weeks =
    product.saturation === "High" ? 2 : signals.competitionGrowth >= 75 ? 4 : signals.competitionGrowth >= 60 ? 6 : 9;
  return `${weeks}-${weeks + 2} weeks`;
}

function growthDirection(expectedGrowth: number, acceleration: number): GrowthDirection {
  if (expectedGrowth >= 38 && acceleration >= 68) return "Accelerating";
  if (expectedGrowth >= 16) return "Rising";
  if (expectedGrowth >= 4) return "Stable";
  if (expectedGrowth >= -8) return "Cooling";
  return "Declining";
}

function weightedAverage(values: Array<[number, number]>) {
  const totalWeight = values.reduce((sum, [, weight]) => sum + weight, 0);
  return values.reduce((sum, [value, weight]) => sum + value * weight, 0) / totalWeight;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
