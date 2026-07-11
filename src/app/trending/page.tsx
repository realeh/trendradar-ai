"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { TrendingBoard } from "@/components/trending-board";
import { getAuthHeaders } from "@/lib/supabase-browser";
import type { Product } from "@/lib/types";

type TrendingData = {
  products: Product[];
  categories: string[];
  countries: string[];
  platforms: string[];
  isDemoData: boolean;
};

export default function TrendingPage() {
  const [data, setData] = useState<TrendingData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const authHeaders = await getAuthHeaders();
      const res = await fetch("/api/protected/trending", { headers: authHeaders });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Could not load trending products.");
        return;
      }
      setData(json as TrendingData);
    })();
  }, []);

  return (
    <AppShell>
      <div className="space-y-5 p-4 sm:p-6">
        <PageHeader
          eyebrow="Trending Products"
          title="Live-style trend board"
          description={
            data?.isDemoData
              ? "Showing demo data. Curate real products at /admin/curate to see your live catalog here."
              : "Sort and filter your curated product catalog by score, growth, category, market, and ad platform."
          }
        />
        {error && <div className="rounded-md bg-coral/10 p-4 text-sm font-bold text-coral">{error}</div>}
        {!data && !error && (
          <div className="flex items-center gap-2 text-sm font-bold text-ink/55 dark:text-paper/55">
            <Loader2 size={16} className="animate-spin" /> Loading your catalog...
          </div>
        )}
        {data && (
          <TrendingBoard
            products={data.products}
            categories={data.categories}
            countries={data.countries}
            platforms={data.platforms}
          />
        )}
      </div>
    </AppShell>
  );
}
