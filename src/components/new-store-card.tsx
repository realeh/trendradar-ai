import { AlertTriangle, BadgeDollarSign, Box, CheckCircle2, Clapperboard, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import type { BeginnerLaunchRecommendation } from "@/lib/types";
import { saturationColor } from "@/lib/scoring";
import { ScoreRing } from "./score-ring";

export function NewStoreCard({ item }: { item: BeginnerLaunchRecommendation }) {
  const { product, forecast, signals } = item;

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
                {item.verdict}
              </span>
              <span className={`rounded-md px-2.5 py-1 text-xs font-bold ${saturationColor(product.saturation)}`}>
                {product.saturation} saturation
              </span>
              <span className="rounded-md bg-tide/12 px-2.5 py-1 text-xs font-bold text-tide dark:text-cyan-200">
                Shopify starter
              </span>
            </div>
            <h2 className="mt-3 text-2xl font-black leading-tight">{product.name}</h2>
            <p className="mt-2 text-sm leading-6 text-ink/68 dark:text-paper/68">{item.whyRealistic}</p>
          </div>
        </div>
        <ScoreRing label="Beginner Launch" score={item.beginnerLaunchScore} />
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Signal icon={<ShieldCheck size={17} />} label="Low saturation" value={signals.lowSaturation} />
        <Signal icon={<Truck size={17} />} label="Easy shipping" value={signals.easyShipping} />
        <Signal icon={<BadgeDollarSign size={17} />} label="High margin" value={signals.highMargin} />
        <Signal icon={<Clapperboard size={17} />} label="Simple creatives" value={signals.simpleCreatives} />
        <Signal icon={<AlertTriangle size={17} />} label="Low refund risk" value={signals.lowRefundRisk} />
        <Signal icon={<PackageCheck size={17} />} label="Reliable suppliers" value={signals.reliableSuppliers} />
        <Signal icon={<Box size={17} />} label="Small product size" value={signals.smallProductSize} />
        <Signal icon={<CheckCircle2 size={17} />} label="Trend lifespan" value={signals.longTrendLifespan} />
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        <Panel title="Launch economics" body={`Suggested price $${product.suggestedPrice}, estimated cost $${product.estimatedCost}, estimated margin ${product.profitMargin}%.`} />
        <Panel title="Trend runway" body={`${forecast.expectedTrendLifespan} expected lifespan, ${forecast.expectedGrowth}% expected growth, saturation likely in ${forecast.expectedSaturationDate}.`} />
        <Panel title="Best route to market" body={`${product.platform} in ${product.country}. Use ${product.adAngles.slice(0, 2).join(" and ")} as the first creative tests.`} />
      </div>

      <div className="mt-5 rounded-md bg-ink/5 p-4 dark:bg-white/8">
        <h3 className="font-black">First-store launch plan</h3>
        <div className="mt-3 grid gap-2">
          {item.launchPlan.map((step) => (
            <div key={step} className="flex gap-2 text-sm leading-6 text-ink/70 dark:text-paper/70">
              <CheckCircle2 size={17} className="mt-1 shrink-0 text-tide dark:text-cyan-200" />
              {step}
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

export function ExcludedNewStoreCard({ item }: { item: BeginnerLaunchRecommendation }) {
  return (
    <div className="rounded-md border border-black/10 bg-white/55 p-4 dark:border-white/10 dark:bg-white/5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-black">{item.product.name}</div>
          <div className="mt-1 text-sm text-ink/58 dark:text-paper/58">
            Score {item.beginnerLaunchScore}/100 · {item.product.saturation} saturation
          </div>
        </div>
        <span className="rounded-md bg-coral/12 px-3 py-2 text-sm font-black text-coral">Excluded</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-ink/66 dark:text-paper/66">{item.excludedReasons?.join(". ")}.</p>
    </div>
  );
}

function Signal({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-md border border-black/10 bg-paper/70 p-3 dark:border-white/10 dark:bg-ink/70">
      <div className="flex items-center justify-between gap-2 text-xs font-bold uppercase tracking-[0.14em] text-ink/48 dark:text-paper/48">
        <span className="flex items-center gap-2">
          <span className="text-coral">{icon}</span>
          {label}
        </span>
        <span>{value}</span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
        <div className="h-full rounded-full bg-tide dark:bg-cyan-200" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function Panel({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-md bg-ink/5 p-4 dark:bg-white/8">
      <div className="text-sm font-black">{title}</div>
      <p className="mt-2 text-sm leading-6 text-ink/66 dark:text-paper/66">{body}</p>
    </div>
  );
}
