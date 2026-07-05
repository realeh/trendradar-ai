import { getIntegrationStatus } from "./env";
import { isCjConfigured } from "./cj-client";

export const integrationRoadmap = [
  "TikTok Creative Center",
  "Google Trends (SerpApi)",
  "Amazon Best Sellers",
  "Etsy trend signals",
  "Pinterest Trends",
  "Reddit community mentions",
  "Supplier quality APIs beyond CJ"
];

export function getCjConfigStatus() {
  return isCjConfigured();
}

export function getSupabaseConfigStatus() {
  return getIntegrationStatus().supabase;
}

export function getStripeConfigStatus() {
  return getIntegrationStatus().stripe;
}

export function getAIConfigStatus() {
  return getIntegrationStatus().ai;
}

export function getAIProvider() {
  return getIntegrationStatus().aiProvider;
}
