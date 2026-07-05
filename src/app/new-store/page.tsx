import { AppShell } from "@/components/app-shell";
import { ExcludedNewStoreCard, NewStoreCard } from "@/components/new-store-card";
import { PageHeader } from "@/components/page-header";
import { getExcludedNewStoreProducts, getNewStoreRecommendations } from "@/lib/new-store-engine";

export default function NewStorePage() {
  const beginnerProducts = getNewStoreRecommendations();
  const excludedProducts = getExcludedNewStoreProducts();

  return (
    <AppShell>
      <div className="space-y-6 p-4 sm:p-6">
        <PageHeader
          eyebrow="New Store Mode"
          title="Realistic first-store products"
          description="A separate Shopify starter dashboard that only recommends products with low saturation, easy operations, reliable supply, simple creatives, and enough trend runway for a beginner to test properly."
        />
        <section className="grid gap-4 md:grid-cols-4">
          <Metric label="Recommended" value={String(beginnerProducts.length)} detail="Products passing beginner filters" />
          <Metric label="Excluded" value={String(excludedProducts.length)} detail="Too saturated or risky" />
          <Metric label="Minimum score" value="72" detail="Realistic-success threshold" />
          <Metric label="Focus" value="Shopify" detail="Small, shippable, demo-friendly" />
        </section>

        <section className="space-y-4">
          {beginnerProducts.map((item) => (
            <NewStoreCard key={item.product.id} item={item} />
          ))}
        </section>

        <section className="rounded-md border border-black/10 bg-white/68 p-5 shadow-panel dark:border-white/10 dark:bg-white/6">
          <h2 className="text-xl font-black">Not recommended for a brand new store</h2>
          <p className="mt-2 text-sm leading-6 text-ink/62 dark:text-paper/62">
            These can still be viable for experienced operators, but they are filtered out here because beginners need simple logistics, lower refund exposure, and room to compete.
          </p>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {excludedProducts.map((item) => (
              <ExcludedNewStoreCard key={item.product.id} item={item} />
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-md border border-black/10 bg-white/68 p-4 shadow-panel dark:border-white/10 dark:bg-white/6">
      <div className="text-xs font-bold uppercase tracking-[0.18em] text-ink/48 dark:text-paper/48">{label}</div>
      <div className="mt-2 text-3xl font-black">{value}</div>
      <div className="mt-1 text-sm text-ink/62 dark:text-paper/62">{detail}</div>
    </div>
  );
}
