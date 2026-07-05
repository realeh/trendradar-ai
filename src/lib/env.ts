export type IntegrationStatus = {
  supabase: boolean;
  stripe: boolean;
  openai: boolean;
  missing: string[];
};

const required = {
  supabase: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"],
  stripe: ["STRIPE_SECRET_KEY", "NEXT_PUBLIC_STRIPE_PRICE_ID"],
  openai: ["OPENAI_API_KEY"]
};

export function getIntegrationStatus(): IntegrationStatus {
  const supabase = required.supabase.every((key) => Boolean(process.env[key]));
  const stripe = required.stripe.every((key) => Boolean(process.env[key]));
  const openai = required.openai.every((key) => Boolean(process.env[key]));
  const missing = [...required.supabase, ...required.stripe, ...required.openai].filter((key) => !process.env[key]);

  return { supabase, stripe, openai, missing };
}
