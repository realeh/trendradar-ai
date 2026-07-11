// Single source of truth for plan slug <-> Stripe price id, shared by the
// checkout route (slug -> price id) and the webhook (price id -> slug, so we
// know which plan a subscription belongs to when syncing profiles).

export const PLAN_SLUGS = ["starter", "growth", "scale"] as const;
export type PlanSlug = (typeof PLAN_SLUGS)[number];

export function priceIdForPlan(plan: string): string | undefined {
  const slug = plan.toLowerCase();
  if (slug === "starter") return process.env.STRIPE_PRICE_STARTER;
  if (slug === "growth") return process.env.STRIPE_PRICE_GROWTH;
  if (slug === "scale") return process.env.STRIPE_PRICE_SCALE;
  return undefined;
}

export function planForPriceId(priceId: string | null | undefined): PlanSlug | null {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_PRICE_STARTER) return "starter";
  if (priceId === process.env.STRIPE_PRICE_GROWTH) return "growth";
  if (priceId === process.env.STRIPE_PRICE_SCALE) return "scale";
  return null;
}

/** Statuses that should count as "has active access" to the paid app. */
export const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["active", "trialing"]);

export function hasActiveAccess(status: string | null | undefined): boolean {
  return Boolean(status && ACTIVE_SUBSCRIPTION_STATUSES.has(status));
}
