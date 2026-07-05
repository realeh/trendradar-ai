import Link from "next/link";
import { Check } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { CheckoutButton } from "@/components/checkout-button";
import { PageHeader } from "@/components/page-header";

const plans = [
  {
    name: "Starter",
    price: "$19",
    description: "For testing product ideas and building a first store.",
    features: ["AI Discovery", "Trending products", "New Store Mode", "Product Simulator"]
  },
  {
    name: "Growth",
    price: "$49",
    description: "For operators running weekly product research.",
    features: ["Everything in Starter", "Hidden Gems", "Saved research boards", "Team-ready exports"]
  },
  {
    name: "Scale",
    price: "$99",
    description: "For agencies and multi-store ecommerce teams.",
    features: ["Everything in Growth", "API integrations", "Supplier intelligence", "Priority AI credits"]
  }
];

export default function PricingPage() {
  return (
    <AppShell>
      <div className="space-y-6 p-4 sm:p-6">
        <PageHeader
          eyebrow="Pricing"
          title="Choose your radar range"
          description="Simple monthly plans, billed through Stripe. Cancel anytime."
        />
        <div className="grid gap-4 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <article
              key={plan.name}
              className="rounded-md border border-black/10 bg-white/68 p-5 shadow-panel dark:border-white/10 dark:bg-white/6"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-black">{plan.name}</h2>
                {index === 1 && <span className="rounded-md bg-coral px-2.5 py-1 text-xs font-bold text-white">Popular</span>}
              </div>
              <div className="mt-4">
                <span className="font-display text-5xl">{plan.price}</span>
                <span className="text-ink/55 dark:text-paper/55"> / month</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-ink/65 dark:text-paper/65">{plan.description}</p>
              <CheckoutButton plan={plan.name} />
              <div className="mt-5 space-y-3">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm font-bold">
                    <Check size={16} className="text-tide" />
                    {feature}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
        <p className="text-xs font-bold text-ink/45 dark:text-paper/45">
          By subscribing you agree to our{" "}
          <Link href="/terms" className="underline hover:text-ink dark:hover:text-paper">Terms of Service</Link>,{" "}
          <Link href="/privacy" className="underline hover:text-ink dark:hover:text-paper">Privacy Policy</Link>, and{" "}
          <Link href="/refund-policy" className="underline hover:text-ink dark:hover:text-paper">Refund Policy</Link>.
        </p>
      </div>
    </AppShell>
  );
}
