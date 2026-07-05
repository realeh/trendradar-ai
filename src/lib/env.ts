export type IntegrationStatus = {
  supabase: boolean;
  stripe: boolean;
  /** True if either an Anthropic or an OpenAI key is configured. */
  ai: boolean;
  aiProvider: "claude" | "openai" | null;
  missing: string[];
};

const required = {
  supabase: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"],
  stripe: ["STRIPE_SECRET_KEY", "STRIPE_PRICE_STARTER", "STRIPE_PRICE_GROWTH", "STRIPE_PRICE_SCALE"]
};

export function getIntegrationStatus(): IntegrationStatus {
  const supabase = required.supabase.every((key) => Boolean(process.env[key]));
  const stripe = required.stripe.every((key) => Boolean(process.env[key]));

  const hasClaude = Boolean(process.env.ANTHROPIC_API_KEY);
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);
  const ai = hasClaude || hasOpenAI;
  const aiProvider: "claude" | "openai" | null = hasClaude ? "claude" : hasOpenAI ? "openai" : null;

  const missing = [
    ...required.supabase.filter((key) => !process.env[key]),
    ...required.stripe.filter((key) => !process.env[key])
  ];
  if (!ai) missing.push("ANTHROPIC_API_KEY (or OPENAI_API_KEY)");

  return { supabase, stripe, ai, aiProvider, missing };
}
