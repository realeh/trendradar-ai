"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { HiddenGemCard } from "@/components/hidden-gem-card";
import { PageHeader } from "@/components/page-header";
import { getAuthHeaders } from "@/lib/supabase-browser";
import type { HiddenGemRecommendation } from "@/lib/types";

export default function HiddenGemsPage() {
  const [hidden, setHidden] = useState<HiddenGemRecommendation[] | null>(null);
  const [warmingUp, setWarmingUp] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const authHeaders = await getAuthHeaders();
      const res = await fetch("/api/protected/hidden-gems", { headers: authHeaders });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Could not load hidden gems.");
        return;
      }
      setHidden(json.hidden as HiddenGemRecommendation[]);
      setWarmingUp(json.warmingUp as number);
    })();
  }, []);

  return (
    <AppShell>
      <div className="space-y-6 p-4 sm:p-6">
        <PageHeader
          eyebrow="Hidden Gems"
          title="Early products before the crowd"
          description="Only products still early enough to evaluate. Each gem is scored for early growth, competition level, trend probability, saturation timing, and confidence."
        />

        {error && <div className="rounded-md bg-coral/10 p-4 text-sm font-bold text-coral">{error}</div>}
        {!hidden && !error && (
          <div className="flex items-center gap-2 text-sm font-bold text-ink/55 dark:text-paper/55">
            <Loader2 size={16} className="animate-spin" /> Loading hidden gems...
          </div>
        )}

        {hidden && (
          <>
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
          </>
        )}
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
