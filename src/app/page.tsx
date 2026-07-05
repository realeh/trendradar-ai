import Link from "next/link";
import { ArrowRight, Radar, Sparkles } from "lucide-react";
import { products } from "@/lib/mock-products";
import { ProductCard } from "@/components/product-card";

export default function LandingPage() {
  const heroProduct = products[0];

  return (
    <main className="min-h-screen bg-paper text-ink dark:bg-ink dark:text-paper">
      <section className="soft-grid flex min-h-screen flex-col px-5 py-5">
        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-md bg-ink text-paper dark:bg-paper dark:text-ink">
              <Radar size={21} />
            </span>
            <span className="font-display text-2xl">TrendRadar AI</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/pricing" className="hidden rounded-md px-4 py-2 text-sm font-bold hover:bg-black/5 dark:hover:bg-white/8 sm:block">
              Pricing
            </Link>
            <Link href="/dashboard" className="rounded-md bg-ink px-4 py-2 text-sm font-bold text-paper dark:bg-paper dark:text-ink">
              Open app
            </Link>
          </div>
        </nav>

        <div className="mx-auto grid w-full max-w-7xl flex-1 items-center gap-8 py-10 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-md border border-black/10 bg-white/60 px-3 py-2 text-sm font-bold dark:border-white/10 dark:bg-white/6">
              <Sparkles size={16} className="text-coral" />
              AI product research for ecommerce operators
            </div>
            <h1 className="mt-6 font-display text-5xl leading-[1.02] sm:text-7xl">TrendRadar AI</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-ink/68 dark:text-paper/68">
              Find dropshipping products with demand, margin, momentum, low saturation, and supplier-fit signals before the market gets crowded.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/ai-discovery" className="inline-flex items-center gap-2 rounded-md bg-coral px-5 py-3 font-black text-white shadow-panel">
                Ask the AI <ArrowRight size={18} />
              </Link>
              <Link href="/trending" className="rounded-md border border-black/10 bg-white/70 px-5 py-3 font-black dark:border-white/10 dark:bg-white/6">
                View trends
              </Link>
            </div>
          </div>
          <div className="pb-4">
            <ProductCard product={heroProduct} />
          </div>
        </div>
      </section>
    </main>
  );
}
