import { AppShell } from "@/components/app-shell";
import { HiddenGemCard } from "@/components/hidden-gem-card";
import { PageHeader } from "@/components/page-header";
import { getHiddenGemRecommendations } from "@/lib/hidden-gems-engine";
import { getActiveProducts } from "@/lib/product-store";

export const revalidate = 60;

export default async function HiddenGemsPage() {
  const products = await getActiveProducts();
  const hidden = getHiddenGemRecommendations(products);
  const warmingUp = hidden.filter((item) => item.saturationWarning).length;

  return (
    <AppShell>
      <div className="space-y-6 p-4 sm:p-6">
        <PageHeader
          eyebrow="Hidden Gems"
          title="Early products before the crowd"
          description="Only products still early enough to evaluate. Each gem is scored for early growth, competition level, trend probability, saturation timing, and confidence."
        />

        <section className="grid gap-4 md:grid-cols-4">
          <Metric label="Hidden gems" value={String(hidden.length)} detail="Early-stage products only" />
          <Metric label="Warnings" value={String(warmingUp)} detail="Becoming saturated" />
          <Metric label="Minimum probability" value="60%" detail="Trend likelihood threshold" />
          <Metric label="Excluded" value="High saturation" detail="Removed from this page" />
        </section>

        <section className="space-y-4">
          {hidden.map((item) => (
            <HiddenGemCard key={item.product.id} item={item} />
          ))}
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
