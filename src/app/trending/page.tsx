"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { FilterBar, type SortKey } from "@/components/filter-bar";
import { PageHeader } from "@/components/page-header";
import { ProductGrid } from "@/components/product-grid";
import { products } from "@/lib/mock-products";

export default function TrendingPage() {
  const [sort, setSort] = useState<SortKey>("trendScore");
  const [category, setCategory] = useState("All");
  const [country, setCountry] = useState("All");
  const [platform, setPlatform] = useState("All");

  const visible = useMemo(() => {
    return [...products]
      .filter((product) => category === "All" || product.category === category)
      .filter((product) => country === "All" || product.country === country)
      .filter((product) => platform === "All" || product.platform === platform)
      .sort((a, b) => {
        const left = a[sort];
        const right = b[sort];
        if (typeof left === "number" && typeof right === "number") return right - left;
        return String(left).localeCompare(String(right));
      });
  }, [category, country, platform, sort]);

  return (
    <AppShell>
      <div className="space-y-5 p-4 sm:p-6">
        <PageHeader
          eyebrow="Trending Products"
          title="Live-style trend board"
          description="Sort and filter mock product intelligence by score, growth, category, market, and ad platform."
        />
        <FilterBar
          sort={sort}
          setSort={setSort}
          category={category}
          setCategory={setCategory}
          country={country}
          setCountry={setCountry}
          platform={platform}
          setPlatform={setPlatform}
        />
        <ProductGrid products={visible} />
      </div>
    </AppShell>
  );
}
