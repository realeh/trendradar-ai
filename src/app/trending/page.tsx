import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { TrendingBoard } from "@/components/trending-board";
import { deriveFilterOptions, getActiveProducts } from "@/lib/product-store";

export const revalidate = 60;

export default async function TrendingPage() {
  const products = await getActiveProducts();
  const { categories, countries, platforms } = deriveFilterOptions(products);
  const isDemoData = products[0]?.dataSource === "demo";

  return (
    <AppShell>
      <div className="space-y-5 p-4 sm:p-6">
        <PageHeader
          eyebrow="Trending Products"
          title="Live-style trend board"
          description={
            isDemoData
              ? "Showing demo data. Curate real products at /admin/curate to see your live catalog here."
              : "Sort and filter your curated product catalog by score, growth, category, market, and ad platform."
          }
        />
        <TrendingBoard products={products} categories={categories} countries={countries} platforms={platforms} />
      </div>
    </AppShell>
  );
}
