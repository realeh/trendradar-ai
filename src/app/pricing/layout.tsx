import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple monthly plans for AI-powered ecommerce product research, billed through Stripe."
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
