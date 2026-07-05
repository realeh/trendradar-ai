import { AlertTriangle, Clock, Gauge, Radar, ShieldAlert, Sparkles, TrendingUp } from "lucide-react";
import type { HiddenGemRecommendation } from "@/lib/types";
import { SupplierLink } from "./supplier-link";

export function HiddenGemCard({ item }: { item: HiddenGemRecommendation }) {
  const { product } = item;

  return (
    <article className="rounded-md border border-black/10 bg-white/72 p-5 shadow-panel dark:border-white/10 dark:bg-white/6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div className="flex gap-4">
          <div className="grid size-20 shrink-0 place-items-center rounded-md bg-gradient-to-br from-[#f2d492] via-[#9bc3b1] to-[#4e9aa7] text-2xl font-black text-ink">
            {product.name
              .split(" ")
              .slice(0, 2)
              .map((word) => word[0])
              .join("")}
          </div>
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-md bg-ink px-2.5 py-1 text-xs font-bold text-paper dark:bg-paper dark:text-ink">
                Early signal
              </span>
              <span className="rounded-md bg-tide/12 px-2.5 py-1 text-xs font-bold text-tide dark:text-cyan-200">
                {product.category}
              </span>
              <span className="rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-200">
                {product.platform}
              </span>
              <SupplierLink url={product.sourceUrl} />
            </div>
            <h2 className="mt-3 text-2xl font-black leading-tight">{product.name}</h2>
            <p className="mt-2 text-sm leading-6 text-ink/68 dark:text-paper/68">{item.whySelected}</p>
          </div>
        </div>
        <div className="rounded-md bg-ink px-4 py-3 text-paper dark:bg-paper dark:text-ink">
          <div className="text-xs font-bold uppercase tracking-[0.16em] opacity-70">Confidence</div>
          <div className="mt-1 text-3xl font-black">{item.confidence}</div>
        </div>
      </div>

      {item.saturationWarning && (
        <div className="mt-5 rounded-md bg-coral/12 p-4 text-sm leading-6 text-coral dark:bg-coral/15">
          <div className="mb-1 flex items-center gap-2 font-black">
            <AlertTriangle size={17} />
            Becoming saturated
          </div>
          {item.saturationWarning}
        </div>
      )}

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <Metric icon={<TrendingUp size={17} />} label="Early Growth Score" value={`${item.earlyGrowthScore}/100`} />
        <Metric icon={<ShieldAlert size={17} />} label="Competition Level" value={item.competitionLevel} />
        <Metric icon={<Radar size={17} />} label="Trend Probability" value={`${item.trendProbability}%`} />
        <Metric icon={<Clock size={17} />} label="Before Saturation" value={item.estimatedTimeBeforeSaturation} />
        <Metric icon={<Gauge size={17} />} label="Confidence" value={`${item.confidence}/100`} />
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        <Panel title="Early signal" body={product.earlySignal ?? product.whyTrending} />
        <Panel title="Forecast read" body={`${item.forecast.expectedGrowth}% expected growth, ${item.forecast.growthDirection.toLowerCase()} direction, ${item.forecast.expectedTrendLifespan} trend lifespan.`} />
        <Panel title="Launch angle" body={`${product.country} is the best market and ${product.platform} is the best channel. Start with ${product.adAngles.slice(0, 2).join(" and ")}.`} />
      </div>

      <div className="mt-5 grid gap-2 text-xs font-bold sm:grid-cols-2 xl:grid-cols-4">
        <Signal label="Search momentum" value={item.forecast.signals.searchMomentum} />
        <Signal label="Trend acceleration" value={item.forecast.signals.trendAcceleration} />
        <Signal label="Creator growth" value={item.forecast.signals.tiktokCreatorGrowth} />
        <Signal label="Competition growth" value={item.forecast.signals.competitionGrowth} />
      </div>
    </article>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-md border border-black/10 bg-paper/70 p-3 dark:border-white/10 dark:bg-ink/70">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-ink/48 dark:text-paper/48">
        <span className="text-coral">{icon}</span>
        {label}
      </div>
      <div className="mt-2 text-lg font-black">{value}</div>
    </div>
  );
}

function Panel({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-md bg-ink/5 p-4 dark:bg-white/8">
      <div className="flex items-center gap-2 text-sm font-black">
        <Sparkles size={16} className="text-coral" />
        {title}
      </div>
      <p className="mt-2 text-sm leading-6 text-ink/66 dark:text-paper/66">{body}</p>
    </div>
  );
}

function Signal({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-ink/5 p-3 dark:bg-white/8">
      <div className="flex items-center justify-between gap-2">
        <span className="text-ink/58 dark:text-paper/58">{label}</span>
        <span>{value}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
        <div className="h-full rounded-full bg-coral" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
