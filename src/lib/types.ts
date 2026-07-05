export type Platform = "TikTok" | "Meta" | "Google" | "Pinterest" | "Amazon";
export type Saturation = "Low" | "Medium" | "High";
export type GrowthDirection = "Accelerating" | "Rising" | "Stable" | "Cooling" | "Declining";

export type ForecastSignalSet = {
  googleSearchGrowth: number;
  tiktokCreatorGrowth: number;
  videoEngagement: number;
  pinterestSaves: number;
  marketplaceSalesGrowth: number;
  supplierAvailability: number;
  competitionGrowth: number;
  searchMomentum: number;
  trendAcceleration: number;
  seasonality: number;
};

export type ForecastWindow = {
  weeks: 2 | 4 | 8;
  expectedGrowth: number;
  confidence: number;
  growthDirection: GrowthDirection;
};

export type ProductForecast = {
  forecastConfidence: number;
  expectedGrowth: number;
  expectedTrendLifespan: string;
  expectedSaturationDate: string;
  growthDirection: GrowthDirection;
  confidenceExplanation: string;
  windows: ForecastWindow[];
  signals: ForecastSignalSet;
};

export type BeginnerLaunchSignalSet = {
  lowSaturation: number;
  easyShipping: number;
  highMargin: number;
  simpleCreatives: number;
  lowRefundRisk: number;
  reliableSuppliers: number;
  smallProductSize: number;
  longTrendLifespan: number;
};

export type BeginnerLaunchRecommendation = {
  product: Product;
  forecast: ProductForecast;
  beginnerLaunchScore: number;
  signals: BeginnerLaunchSignalSet;
  verdict: string;
  whyRealistic: string;
  launchPlan: string[];
  excludedReasons?: string[];
};

export type CompetitionLevel = "Very Low" | "Low" | "Moderate" | "Rising";

export type HiddenGemRecommendation = {
  product: Product;
  forecast: ProductForecast;
  earlyGrowthScore: number;
  competitionLevel: CompetitionLevel;
  trendProbability: number;
  estimatedTimeBeforeSaturation: string;
  confidence: number;
  whySelected: string;
  saturationWarning?: string;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  country: string;
  platform: Platform;
  trendScore: number;
  launchScore: number;
  growth: number;
  saturation: Saturation;
  profitMargin: number;
  viralPotential: number;
  demand: number;
  competition: number;
  trendMomentum: number;
  supplierReliability: number;
  shippingEase: number;
  suggestedPrice: number;
  estimatedCost: number;
  targetAudience: string;
  whyTrending: string;
  trendForecast: string;
  supplierNotes: string;
  aiRecommendation: string;
  risks: string[];
  similarAlternatives: string[];
  adAngles: string[];
  earlySignal?: string;
  dataSource?: "cj_dropshipping" | "manual" | "demo";
  cjProductId?: string;
  sourceUrl?: string;
  listedNum?: number;
  verifiedInventory?: number;
  deliveryCycleDays?: string;
  cjTrendingFlag?: boolean;
  curatorTrendAssessment?: number;
  curatorNotes?: string;
  curatedBy?: string;
  curatedAt?: string;
};

export type CommerceIntent = {
  countries: string[];
  platforms: Platform[];
  excludedCategories: string[];
  beginnerFriendly: boolean;
  highMargin: boolean;
  lowSaturation: boolean;
  forecastNextMonth: boolean;
  budget?: number;
};

export type CommerceRecommendation = {
  product: Product;
  opportunityScore: number;
  forecast: ProductForecast;
  fitScore: number;
  whyChosen: string;
};

export type CommerceAIResponse = {
  intent: CommerceIntent;
  summary: string;
  consultantNote: string;
  recommendations: CommerceRecommendation[];
};

export type SimulatorResult = {
  productName: string;
  successProbability: number;
  demandScore: number;
  targetAudience: string;
  countries: string[];
  bestAdPlatform: Platform;
  sellingPrice: number;
  productCost: number;
  estimatedProfit: number;
  suggestedPrice: number;
  profitMargin: number;
  competition: Saturation;
  competitionScore: number;
  saturation: Saturation;
  tiktokHooks: string[];
  facebookAdAngles: string[];
  potentialProblems: string[];
  finalRecommendation: "Avoid" | "Test" | "Strong Test";
  adAngles: string[];
  notes: string;
};
