"use client";

import { FormEvent, useEffect, useState } from "react";
import { AlertTriangle, BadgeDollarSign, Calculator, ExternalLink, Facebook, Globe2, Megaphone, Package, Radar, Target, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { getAuthHeaders } from "@/lib/supabase-browser";
import type { SimulatorResult } from "@/lib/types";

const matchTypeLabel: Record<SimulatorResult["matchType"], string> = {
  catalog_name: "Matched your curated catalog",
  catalog_category: "Closest category match in your curated catalog",
  live_cj_search: "Live result from CJ Dropshipping (not yet curated)"
};

export default function SimulatorPage() {
  const [input, setInput] = useState("Reusable Pet Fur Detailer");
  const [result, setResult] = useState<SimulatorResult | null>(null);
  const [noMatchMessage, setNoMatchMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runSimulation(value: string) {
    setLoading(true);
    setError(null);
    setNoMatchMessage(null);
    setResult(null);
    try {
      const authHeaders = await getAuthHeaders();
      const response = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ input: value })
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
        return;
      }
      if (data.noMatch) {
        setNoMatchMessage(data.message as string);
        return;
      }
      setResult(data.result as SimulatorResult);
    } catch {
      setError("Could not reach the simulator service. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    runSimulation(input);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function submit(event: FormEvent) {
    event.preventDefault();
    runSimulation(input);
  }

  return (
    <AppShell>
      <div className="space-y-5 p-4 sm:p-6">
        <PageHeader
          eyebrow="Product Simulator"
          title="Estimate launch viability"
          description="Enter a product name or supplier link to generate a success estimate, audience, pricing, margin, competition, and ad angles — checked against your curated catalog first, then a live CJ Dropshipping search if it's not there yet."
        />
        <div className="grid gap-5 lg:grid-cols-[420px_1fr]">
          <form onSubmit={submit} className="rounded-md border border-black/10 bg-white/68 p-5 shadow-panel dark:border-white/10 dark:bg-white/6">
            <label className="text-sm font-black">Product or supplier link</label>
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              rows={6}
              className="mt-2 w-full rounded-md border border-black/10 bg-paper p-3 outline-none focus:ring-2 focus:ring-tide dark:border-white/10 dark:bg-ink"
            />
            <button disabled={loading} className="mt-3 inline-flex items-center gap-2 rounded-md bg-coral px-5 py-3 font-black text-white disabled:opacity-60">
              <Calculator size={18} />
              {loading ? "Simulating..." : "Simulate"}
            </button>
            <div className="mt-4 rounded-md bg-ink/5 p-4 text-sm leading-6 text-ink/64 dark:bg-white/8 dark:text-paper/64">
              Type a product name. We check your curated catalog first; if it's not there, we search CJ Dropshipping's live catalog for a real match instead of guessing. Pasted URLs aren't parsed yet — type the product name instead.
            </div>
          </form>
          <section className="rounded-md border border-black/10 bg-white/68 p-5 shadow-panel dark:border-white/10 dark:bg-white/6">
            {error && <div className="rounded-md bg-coral/10 p-4 text-sm font-bold text-coral">{error}</div>}
            {noMatchMessage && (
              <div className="rounded-md bg-ink/5 p-4 text-sm leading-6 text-ink/68 dark:bg-white/8 dark:text-paper/68">
                {noMatchMessage}
              </div>
            )}
            {result && (
            <>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-coral">{result.productName}</span>
                  <span className="rounded-md bg-ink/[0.06] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-ink/55 dark:bg-white/10 dark:text-paper/60">
                    {matchTypeLabel[result.matchType]}
                  </span>
                  {result.sourceUrl && (
                    <a
                      href={result.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-tide underline dark:text-cyan-200"
                    >
                      View supplier <ExternalLink size={12} />
                    </a>
                  )}
                </div>
                <h2 className="mt-1 text-3xl font-black">{result.successProbability}% success probability</h2>
              </div>
              <div className={`rounded-md px-4 py-3 text-sm font-black ${recommendationClass(result.finalRecommendation)}`}>
                {result.finalRecommendation}
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <Metric icon={<TrendingUp size={17} />} label="Demand Score" value={`${result.demandScore}/100`} />
              <Metric icon={<Radar size={17} />} label="Competition" value={`${result.competitionScore}/100`} />
              <Metric icon={<AlertTriangle size={17} />} label="Saturation" value={result.saturation} />
              <Metric icon={<Megaphone size={17} />} label="Best Platform" value={result.bestAdPlatform} />
              <Metric icon={<BadgeDollarSign size={17} />} label="Selling Price" value={`$${result.sellingPrice}`} />
              <Metric icon={<Package size={17} />} label="Product Cost" value={`$${result.productCost}`} />
              <Metric icon={<BadgeDollarSign size={17} />} label="Estimated Profit" value={`$${result.estimatedProfit}`} />
              <Metric icon={<Globe2 size={17} />} label="Countries" value={result.countries.join(", ")} />
            </div>

            <div className="mt-5 rounded-md bg-ink/5 p-4 dark:bg-white/8">
              <div className="flex items-center gap-2 font-black">
                <Target size={18} className="text-coral" />
                Target audience
              </div>
              <p className="mt-2 text-sm leading-6 text-ink/68 dark:text-paper/68">{result.targetAudience}</p>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <ListPanel title="TikTok hooks" icon={<Megaphone size={18} />} items={result.tiktokHooks} />
              <ListPanel title="Facebook ad angles" icon={<Facebook size={18} />} items={result.facebookAdAngles} />
            </div>

            <div className="mt-5 rounded-md bg-coral/10 p-4 dark:bg-coral/15">
              <div className="flex items-center gap-2 font-black text-coral">
                <AlertTriangle size={18} />
                Potential problems
              </div>
              <div className="mt-3 grid gap-2">
                {result.potentialProblems.map((problem) => (
                  <div key={problem} className="text-sm leading-6 text-ink/70 dark:text-paper/70">
                    {problem}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-md border border-black/10 bg-paper p-4 dark:border-white/10 dark:bg-ink">
              <div className="text-sm font-black">Final recommendation</div>
              <p className="mt-2 text-sm leading-6 text-ink/68 dark:text-paper/68">{result.notes}</p>
            </div>
            </>
            )}
          </section>
        </div>
      </div>
    </AppShell>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-md border border-black/10 bg-paper p-4 dark:border-white/10 dark:bg-ink">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-ink/45 dark:text-paper/45">
        <span className="text-coral">{icon}</span>
        {label}
      </div>
      <div className="mt-2 text-xl font-black">{value}</div>
    </div>
  );
}

function ListPanel({ title, icon, items }: { title: string; icon: React.ReactNode; items: string[] }) {
  return (
    <div className="rounded-md bg-ink/5 p-4 dark:bg-white/8">
      <div className="flex items-center gap-2 font-black">
        <span className="text-coral">{icon}</span>
        {title}
      </div>
      <div className="mt-3 grid gap-2">
        {items.map((item) => (
          <div key={item} className="rounded-md border border-black/10 bg-white/55 px-3 py-2 text-sm font-bold leading-5 dark:border-white/10 dark:bg-white/5">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function recommendationClass(recommendation: "Avoid" | "Test" | "Strong Test") {
  if (recommendation === "Strong Test") return "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-200";
  if (recommendation === "Test") return "bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-200";
  return "bg-red-100 text-red-800 dark:bg-red-400/15 dark:text-red-200";
}
