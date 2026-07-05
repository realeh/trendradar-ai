"use client";

import { useMemo, useState } from "react";
import { FilterBar, type SortKey } from "@/components/filter-bar";
import { ProductGrid } from "@/components/product-grid";
import type { Product } from "@/lib/types";

export function TrendingBoard({
  products,
  categories,
  countries,
  platforms
}: {
  products: Product[];
  categories: string[];
  countries: string[];
  platforms: string[];
}) {
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
  }, [category, country, platform, sort, products]);

  return (
    <>
      <FilterBar
        sort={sort}
        setSort={setSort}
        category={category}
        setCategory={setCategory}
        country={country}
        setCountry={setCountry}
        platform={platform}
        setPlatform={setPlatform}
        categories={categories}
        countries={countries}
        platforms={platforms}
      />
      <ProductGrid products={visible} />
    </>
  );
}
