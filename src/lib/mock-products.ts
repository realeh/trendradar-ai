import type { Product, SimulatorResult } from "./types";
import { opportunityScore } from "./scoring";

const baseProducts: Product[] = [
  {
    id: "travel-makeup-case",
    name: "Heatless Travel Makeup Case",
    category: "Beauty",
    country: "Australia",
    platform: "TikTok",
    trendScore: 91,
    launchScore: 88,
    growth: 34,
    saturation: "Medium",
    profitMargin: 72,
    viralPotential: 93,
    demand: 90,
    competition: 48,
    trendMomentum: 88,
    supplierReliability: 82,
    shippingEase: 77,
    suggestedPrice: 39,
    estimatedCost: 11,
    targetAudience: "Travel-heavy Gen Z and young professionals",
    whyTrending: "Compact beauty organization clips are performing well with suitcase reset and festival travel content.",
    trendForecast: "Likely to stay strong over the next 30 days as travel, festival, and carry-on packing content keeps cycling.",
    supplierNotes: "Look for reinforced zippers, wipe-clean lining, and suppliers with branded packaging options.",
    aiRecommendation: "Strong beginner pick if bundled with mini brush cleaners and positioned around weekend travel.",
    risks: ["Beauty organizers can look generic without a clear bundle or color story.", "Medium saturation means creative quality matters quickly."],
    similarAlternatives: ["Travel jewelry organizer", "Mini brush cleaning mat", "Cosmetic pouch bundle"],
    adAngles: ["Pack with me", "Tiny bathroom routine", "Festival bag reset"],
    earlySignal: "Search comments mention carry-on organization and airport routines."
  },
  {
    id: "desk-walking-pad",
    name: "Foldaway Desk Walking Pad",
    category: "Fitness",
    country: "United States",
    platform: "Meta",
    trendScore: 86,
    launchScore: 74,
    growth: 22,
    saturation: "High",
    profitMargin: 43,
    viralPotential: 76,
    demand: 88,
    competition: 72,
    trendMomentum: 70,
    supplierReliability: 78,
    shippingEase: 42,
    suggestedPrice: 189,
    estimatedCost: 108,
    targetAudience: "Remote workers and wellness-focused office buyers",
    whyTrending: "Work-from-home wellness content keeps pulling interest, especially around step goals.",
    trendForecast: "Demand should remain steady, but short-term growth is likely slower because the category is already crowded.",
    supplierNotes: "Vet warranty terms carefully; shipping weight and returns can hurt margin.",
    aiRecommendation: "Better for experienced operators due to fulfillment complexity and competitive ad auctions.",
    risks: ["Heavy shipping creates return and damage exposure.", "High competition makes paid acquisition expensive."],
    similarAlternatives: ["Desk pedal exerciser", "Posture cushion", "Standing desk balance board"],
    adAngles: ["10k steps at work", "Under-desk routine", "Quiet apartment workout"],
    earlySignal: "Demand is durable, but auction pressure is already visible."
  },
  {
    id: "pet-fur-detailer",
    name: "Reusable Pet Fur Detailer",
    category: "Pets",
    country: "Canada",
    platform: "TikTok",
    trendScore: 79,
    launchScore: 84,
    growth: 28,
    saturation: "Low",
    profitMargin: 81,
    viralPotential: 88,
    demand: 78,
    competition: 35,
    trendMomentum: 81,
    supplierReliability: 86,
    shippingEase: 92,
    suggestedPrice: 24,
    estimatedCost: 5,
    targetAudience: "Pet owners with cars, couches, and rental apartments",
    whyTrending: "Before-and-after cleaning demos are easy to understand in the first second.",
    trendForecast: "Good chance of rising next month as cleaning transformations and pet-owner problem videos remain highly shareable.",
    supplierNotes: "Choose versions with replaceable edges and clear safety details for fabric surfaces.",
    aiRecommendation: "Excellent Hidden Gems candidate with simple fulfillment and repeatable UGC angles.",
    risks: ["Needs honest demos to avoid overclaiming performance.", "Some fabrics may require compatibility disclaimers."],
    similarAlternatives: ["Pet hair laundry catcher", "Car seat gap brush", "Reusable lint remover"],
    adAngles: ["Car seat reveal", "Couch rescue", "Renter cleaning kit"],
    earlySignal: "Creator videos are getting saves before mainstream marketplace saturation."
  },
  {
    id: "kitchen-clip-strainer",
    name: "Silicone Clip-On Strainer",
    category: "Kitchen",
    country: "United Kingdom",
    platform: "Pinterest",
    trendScore: 73,
    launchScore: 82,
    growth: 19,
    saturation: "Low",
    profitMargin: 76,
    viralPotential: 71,
    demand: 74,
    competition: 39,
    trendMomentum: 69,
    supplierReliability: 88,
    shippingEase: 95,
    suggestedPrice: 18,
    estimatedCost: 4,
    targetAudience: "Small-kitchen cooks, students, and apartment renters",
    whyTrending: "Space-saving kitchen tools fit meal-prep and small apartment content.",
    trendForecast: "Moderate growth expected as back-to-school, apartment, and quick-meal content renews demand.",
    supplierNotes: "Prioritize food-grade silicone certifications and color variants.",
    aiRecommendation: "Low-risk starter product with strong bundle potential around pasta and meal prep.",
    risks: ["Low ticket price means bundles or quantity breaks are important.", "Food-contact claims need material clarity."],
    similarAlternatives: ["Collapsible measuring cups", "Clip-on pot spoon rest", "Magnetic spice tins"],
    adAngles: ["One-pot dinner", "Dorm kitchen hack", "No colander needed"],
    earlySignal: "Pinterest saves are rising for compact kitchen solutions."
  },
  {
    id: "led-reading-bar",
    name: "Rechargeable LED Reading Bar",
    category: "Home",
    country: "Australia",
    platform: "Google",
    trendScore: 82,
    launchScore: 86,
    growth: 31,
    saturation: "Low",
    profitMargin: 68,
    viralPotential: 80,
    demand: 84,
    competition: 31,
    trendMomentum: 83,
    supplierReliability: 80,
    shippingEase: 86,
    suggestedPrice: 34,
    estimatedCost: 11,
    targetAudience: "BookTok buyers, renters, students, and bedside readers",
    whyTrending: "Cozy reading setups and low-light room transformations are gaining traction.",
    trendForecast: "Likely to climb next month if paired with BookTok, winter nesting, and renter-friendly room reset content.",
    supplierNotes: "Confirm battery certifications and include magnetic mount instructions.",
    aiRecommendation: "High-quality creative can make this feel premium while staying beginner-friendly.",
    risks: ["Battery products need quality control and compliance checks.", "Weak product photos can make it look commodity."],
    similarAlternatives: ["Rechargeable closet light", "Clip-on book lamp", "Magnetic night light"],
    adAngles: ["BookTok room reset", "Rental-friendly lighting", "Late-night reading"],
    earlySignal: "Comments ask for renter-safe lighting and rechargeable options."
  },
  {
    id: "plant-watering-stakes",
    name: "Terracotta Plant Watering Stakes",
    category: "Garden",
    country: "United States",
    platform: "Pinterest",
    trendScore: 77,
    launchScore: 80,
    growth: 25,
    saturation: "Medium",
    profitMargin: 70,
    viralPotential: 69,
    demand: 76,
    competition: 44,
    trendMomentum: 74,
    supplierReliability: 83,
    shippingEase: 74,
    suggestedPrice: 29,
    estimatedCost: 9,
    targetAudience: "Apartment plant owners and frequent travelers",
    whyTrending: "Plant care automation is trending around vacation prep and beginner plant content.",
    trendForecast: "Seasonal upside is likely around holiday travel windows and beginner plant-care content.",
    supplierNotes: "Fragility matters; require protective packaging and test breakage rates.",
    aiRecommendation: "Good seasonal product if framed around keeping plants alive during trips.",
    risks: ["Terracotta can break in transit without strong packaging.", "Demand is more seasonal than daily-use products."],
    similarAlternatives: ["Self-watering plant bulb", "Moisture meter", "Plant drip irrigation kit"],
    adAngles: ["Vacation plant care", "Beginner plant mistake", "No more overwatering"],
    earlySignal: "Rising saves around low-maintenance plant routines."
  },
  {
    id: "portable-door-lock",
    name: "Portable Door Lock Kit",
    category: "Travel",
    country: "Australia",
    platform: "TikTok",
    trendScore: 84,
    launchScore: 79,
    growth: 29,
    saturation: "Medium",
    profitMargin: 74,
    viralPotential: 85,
    demand: 82,
    competition: 51,
    trendMomentum: 79,
    supplierReliability: 76,
    shippingEase: 90,
    suggestedPrice: 27,
    estimatedCost: 7,
    targetAudience: "Solo travelers, students, renters, and hostel guests",
    whyTrending: "Safety-focused travel content is spreading through practical packing lists.",
    trendForecast: "Demand should rise with travel packing lists, but ad messaging needs careful positioning.",
    supplierNotes: "Use careful claims and clear compatibility guidance for different door types.",
    aiRecommendation: "Promising, but keep messaging factual and avoid fear-heavy advertising.",
    risks: ["Safety claims can trigger ad review issues.", "Door compatibility needs to be very clear."],
    similarAlternatives: ["Travel door alarm", "Luggage cup holder", "RFID travel pouch"],
    adAngles: ["Solo travel checklist", "Hotel room setup", "Dorm move-in kit"],
    earlySignal: "Comment sections show purchase intent from solo travel audiences."
  },
  {
    id: "ice-face-roller",
    name: "Refillable Ice Face Roller",
    category: "Beauty",
    country: "New Zealand",
    platform: "TikTok",
    trendScore: 69,
    launchScore: 76,
    growth: 16,
    saturation: "High",
    profitMargin: 82,
    viralPotential: 78,
    demand: 71,
    competition: 66,
    trendMomentum: 63,
    supplierReliability: 88,
    shippingEase: 94,
    suggestedPrice: 22,
    estimatedCost: 4,
    targetAudience: "Skincare buyers and morning routine creators",
    whyTrending: "Affordable beauty tools keep cycling through routine videos.",
    trendForecast: "Trend is likely to stay active but not accelerate unless paired with a fresh creator hook.",
    supplierNotes: "Differentiate with leak-resistant molds and safe material details.",
    aiRecommendation: "Only pursue with a distinctive bundle or creator angle because saturation is high.",
    risks: ["High saturation creates fast copycat pressure.", "Beauty claims must stay conservative."],
    similarAlternatives: ["Reusable eye cooling pads", "Silicone face mask brush", "Mini skincare fridge tray"],
    adAngles: ["Morning depuff routine", "Freezer skincare", "Budget facial tool"],
    earlySignal: "High existing demand but fewer fresh hooks than newer beauty items."
  }
];

export const products = baseProducts.map((product) => ({
  ...product,
  launchScore: Math.round((product.launchScore + opportunityScore(product)) / 2)
}));

export const categories = Array.from(new Set(products.map((product) => product.category)));
export const countries = Array.from(new Set(products.map((product) => product.country)));
export const platforms = Array.from(new Set(products.map((product) => product.platform)));

export function discoverProducts(query: string) {
  const normalized = query.toLowerCase();
  let result = products;

  if (normalized.includes("australia")) result = result.filter((product) => product.country === "Australia");
  if (normalized.includes("tiktok")) result = result.filter((product) => product.platform === "TikTok");
  if (normalized.includes("beginner")) result = result.filter((product) => product.launchScore >= 78);
  if (normalized.includes("low saturation") || normalized.includes("hidden")) {
    result = result.filter((product) => product.saturation === "Low");
  }

  return (result.length ? result : products)
    .sort((a, b) => opportunityScore(b) - opportunityScore(a))
    .slice(0, 4);
}

export function simulateProduct(input: string): SimulatorResult {
  const existing = products.find((product) =>
    input.toLowerCase().includes(product.name.toLowerCase().split(" ")[0])
  );
  const seed = input.length || 12;
  const product = existing ?? products[seed % products.length];
  const successProbability = Math.min(94, Math.max(42, opportunityScore(product) + (existing ? 4 : -3)));
  const finalRecommendation = successProbability >= 76 && product.saturation === "Low" ? "Strong Test" : successProbability < 56 || product.saturation === "High" ? "Avoid" : "Test";

  return {
    productName: input.trim() || product.name,
    successProbability,
    demandScore: product.demand,
    targetAudience: product.targetAudience,
    countries: [product.country],
    bestAdPlatform: product.platform,
    sellingPrice: product.suggestedPrice,
    productCost: product.estimatedCost,
    estimatedProfit: product.suggestedPrice - product.estimatedCost,
    suggestedPrice: product.suggestedPrice,
    profitMargin: product.profitMargin,
    competition: product.saturation,
    competitionScore: product.competition,
    saturation: product.saturation,
    tiktokHooks: product.adAngles.map((angle) => `${angle} demo`),
    facebookAdAngles: product.adAngles,
    potentialProblems: product.risks,
    finalRecommendation,
    adAngles: product.adAngles,
    notes: product.aiRecommendation
  };
}
