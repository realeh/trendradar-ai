"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { CommerceChat } from "@/components/commerce-chat";
import { CategoryMomentum, EmptyStateCard, LoadingInsightCard, SignalTimeline, TrendVelocityChart } from "@/components/dashboard-visuals";
import { KpiCard } from "@/components/kpi-card";
import { PageHeader } from "@/components/page-header";
import { integrationRoadmap } from "@/lib/integrations";
import { getAuthHeaders } from "@/lib/supabase-browser";
import type { Product } from "@/lib/types";

type DashboardData = { products: Product[]; isDemoData: boolean; lowSaturationCount: number };

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const authHeaders = await getAuthHeaders();
      const res = await fetch("/api/protected/dashboard", { headers: authHeaders });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Could not load your dashboard.");
        return;
      }
      setData(json as DashboardData);
    })();
  }, []);

  const products = data?.products ?? [];
  const avgLaunchScore = products.length
    ? Math.round(products.reduce((sum, p) => sum + p.launchScore, 0) / products.length)
    : 0;

  return (
    <AppShell>
      <div className="space-y-7 p-4 sm:p-7">
        <PageHeader
          eyebrow="AI Commerce Intelligence"
          title="Ask the consultant"
          description="The dashboard now starts with strategic AI chat: ask about markets, budget, platform fit, saturation, margin, trend forecasts, and beginner launch risk."
        />

        {error && <div className="rounded-md bg-coral/10 p-4 text-sm font-bold text-coral">{error}</div>}

        {data?.isDemoData && (
          <div className="rounded-md border border-coral/30 bg-coral/10 p-4 text-sm font-bold text-coral">
            You are viewing demo data. Curate real products at <code>/admin/curate</code> to replace it with live CJ Dropshipping catalog data.
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-4">
          <KpiCard label="Tracked products" value={String(products.length)} detail={data?.isDemoData ? "Demo records" : "Curated catalog records"} />
          <KpiCard label="Avg launch score" value={String(avgLaunchScore)} detail="Beginner-readiness index" />
          <KpiCard label="Low saturation" value={String(data?.lowSaturationCount ?? 0)} detail="Hidden gem candidates" />
          <KpiCard label="API adapters" value="8" detail="Prepared integration targets" />
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
          <TrendVelocityChart />
          <CategoryMomentum />
        </div>

        <CommerceChat />

        <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
          <section className="premium-card rounded-md p-5 animate-fade-up">
            <h2 className="text-xl font-black">How the AI consultant thinks</h2>
            <p className="mt-2 text-sm leading-6 text-ink/62 dark:text-paper/62">
              It extracts intent from the question, scores products against constraints, and explains each recommendation with risks, price, cost, country, platform, and alternatives.
            </p>
            <div className="panel-line mt-5 h-px" />
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <LoadingInsightCard />
              <EmptyStateCard />
            </div>
          </section>
          <div className="space-y-4">
            <SignalTimeline />
            <section className="premium-card rounded-md p-5 animate-fade-up">
            <h2 className="text-xl font-black">Data roadmap</h2>
            <p className="mt-2 text-sm leading-6 text-ink/62 dark:text-paper/62">
              Catalog and inventory data comes from the live CJ Dropshipping API. Search, social, and ad-signal integrations below are still on the roadmap.
            </p>
            <div className="mt-4 space-y-2">
              {integrationRoadmap.map((item) => (
                <div key={item} className="rounded-md bg-ink/[0.035] px-3 py-2 text-sm font-bold dark:bg-white/[0.055]">
                  {item}
                </div>
              ))}
            </div>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
