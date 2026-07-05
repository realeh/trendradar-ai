import type { CommerceAIResponse, CommerceIntent, CommerceRecommendation, Platform, Product } from "./types";
import { forecastProduct } from "./forecast-engine";
import { products } from "./mock-products";
import { opportunityScore } from "./scoring";

const platformMap: Record<string, Platform> = {
  tiktok: "TikTok",
  meta: "Meta",
  facebook: "Meta",
  instagram: "Meta",
  google: "Google",
  pinterest: "Pinterest",
  amazon: "Amazon"
};

export function analyzeCommerceQuestion(question: string): CommerceAIResponse {
  const intent = extractIntent(question);
  const recommendations = rankProducts(intent).slice(0, 4);

  return {
    intent,
    summary: buildSummary(intent, recommendations),
    consultantNote: buildConsultantNote(intent, recommendations),
    recommendations
  };
}

function extractIntent(question: string): CommerceIntent {
  const normalized = question.toLowerCase();
  const countries = ["Australia", "United States", "United Kingdom", "Canada", "New Zealand"].filter((country) =>
    normalized.includes(country.toLowerCase())
  );
  const platforms = Object.entries(platformMap)
    .filter(([term]) => normalized.includes(term))
    .map(([, platform]) => platform)
    .filter((platform, index, list) => list.indexOf(platform) === index);

  const budgetMatch = normalized.match(/\$?\s?(\d{2,5})/);
  const excludedCategories = ["electronics", "beauty", "fitness", "kitchen", "pets", "home", "garden", "travel"]
    .filter((category) => normalized.includes(`no ${category}`) || normalized.includes(`don't want ${category}`) || normalized.includes(`not ${category}`))
    .map((category) => (category === "pets" ? "Pets" : titleCase(category)));

  return {
    countries,
    platforms,
    excludedCategories,
    beginnerFriendly: /beginner|new store|first store|easy|simple/.test(normalized),
    highMargin: /high margin|margin|profit|profitable/.test(normalized),
    lowSaturation: /low saturation|unsaturated|not saturated|hidden gem|low competition/.test(normalized),
    forecastNextMonth: /next month|likely to trend|trend next|forecast|future/.test(normalized),
    budget: budgetMatch ? Number(budgetMatch[1]) : undefined
  };
}

function rankProducts(intent: CommerceIntent): CommerceRecommendation[] {
  return products
    .filter((product) => !intent.excludedCategories.includes(product.category))
    .map((product) => {
      const score = calculateFit(product, intent);
      return {
        product,
        opportunityScore: opportunityScore(product),
        forecast: forecastProduct(product),
        fitScore: score,
        whyChosen: explainChoice(product, intent)
      };
    })
    .sort((a, b) => b.fitScore - a.fitScore);
}

function calculateFit(product: Product, intent: CommerceIntent) {
  let score = opportunityScore(product) + product.trendScore * 0.16 + product.launchScore * 0.18;

  if (intent.countries.length && intent.countries.includes(product.country)) score += 24;
  if (intent.platforms.length && intent.platforms.includes(product.platform)) score += 22;
  if (intent.beginnerFriendly) score += product.launchScore * 0.24 + product.shippingEase * 0.12;
  if (intent.highMargin) score += product.profitMargin * 0.26;
  if (intent.lowSaturation) score += product.saturation === "Low" ? 28 : product.saturation === "Medium" ? 8 : -22;
  if (intent.forecastNextMonth) score += product.trendMomentum * 0.22 + product.growth * 0.35;
  if (intent.budget) {
    const estimatedTestBudget = product.estimatedCost * 20 + 150;
    score += estimatedTestBudget <= intent.budget ? 18 : -18;
  }

  return Math.round(score);
}

function explainChoice(product: Product, intent: CommerceIntent) {
  const reasons = [
    `${product.name} has a ${opportunityScore(product)}/100 opportunity score because demand, margin, supplier reliability, and shipping simplicity balance well.`,
    `Its best channel is ${product.platform}, where the strongest hooks are ${product.adAngles.slice(0, 2).join(" and ")}.`
  ];

  if (intent.beginnerFriendly) reasons.push(`It fits a beginner brief because the launch score is ${product.launchScore}/100 and fulfillment complexity is manageable.`);
  if (intent.highMargin) reasons.push(`The estimated ${product.profitMargin}% margin leaves room for testing creatives and small bundles.`);
  if (intent.lowSaturation) reasons.push(`Saturation is ${product.saturation.toLowerCase()}, so the market is not purely won by the biggest advertisers yet.`);
  if (intent.budget) reasons.push(`A $${intent.budget} test budget can support a lean validation sprint if you keep initial inventory light.`);
  if (intent.forecastNextMonth) reasons.push(product.trendForecast);

  return reasons.join(" ");
}

function buildSummary(intent: CommerceIntent, recommendations: CommerceRecommendation[]) {
  const top = recommendations[0]?.product;
  if (!top) return "I could not find a clean fit in the current mock catalog, so I would broaden the constraints before recommending inventory.";

  const constraints = [
    intent.countries.length ? `market: ${intent.countries.join(", ")}` : "market: flexible",
    intent.platforms.length ? `channel: ${intent.platforms.join(", ")}` : "channel: flexible",
    intent.budget ? `budget: $${intent.budget}` : "budget: not specified"
  ];

  return `I read this as an ecommerce strategy question, not a database search. Based on ${constraints.join("; ")}, I would start with ${top.name} and compare it against ${recommendations.length - 1} backup options.`;
}

function buildConsultantNote(intent: CommerceIntent, recommendations: CommerceRecommendation[]) {
  const first = recommendations[0]?.product;
  if (!first) return "The safest next move is to loosen one constraint and test a wider category set.";

  if (intent.budget && intent.budget <= 500) {
    return `With a $${intent.budget} budget, I would avoid bulky products, validate with creator-style ads first, and only buy inventory after you see saves, comments, or low-cost add-to-carts.`;
  }

  return `I would validate ${first.name} with 3 ad angles before committing deeply: ${first.adAngles.join(", ")}.`;
}

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
