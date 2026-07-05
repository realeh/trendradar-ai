import { getIntegrationStatus } from "./env";

export const integrationRoadmap = [
  "TikTok Creative Center",
  "Google Trends",
  "Amazon Best Sellers",
  "Etsy trend signals",
  "AliExpress supplier feeds",
  "Pinterest Trends",
  "Reddit community mentions",
  "Supplier quality APIs"
];

export function getSupabaseConfigStatus() {
  return getIntegrationStatus().supabase;
}

export function getStripeConfigStatus() {
  return getIntegrationStatus().stripe;
}

export function getOpenAIConfigStatus() {
  return getIntegrationStatus().openai;
}
