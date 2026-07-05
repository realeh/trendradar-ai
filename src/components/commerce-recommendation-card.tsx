import { Activity, AlertTriangle, ArrowRight, BadgeDollarSign, CalendarClock, Globe2, Megaphone, PackageSearch, TrendingUp } from "lucide-react";
import type { CommerceRecommendation } from "@/lib/types";
import { saturationColor } from "@/lib/scoring";
import { ScoreRing } from "./score-ring";
import { SupplierLink } from "./supplier-link";

export function CommerceRecommendationCard({ recommendation }: { recommendation: CommerceRecommendation }) {
  const { product, opportunityScore, whyChosen, forecast } = recommendation;

  return (
    <article className="premium-card rounded-md p-5 transition hover:-translate-y-0.5 hover:shadow-lift">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="grid size-20 shrink-0 place-items-center rounded-md bg-gradient-to-br from-[#f2d492] via-[#9bc3b1] to-[#4e9aa7] text-2xl font-black text-ink">
          {product.name
            .split(" ")
            .slice(0, 2)
            .map((word) => word[0])
            .join("")}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-md bg-ink px-2.5 py-1 text-xs font-bold text-paper dark:bg-paper dark:text-ink">
              {product.category}
            </span>
            <span className={`rounded-md px-2.5 py-1 text-xs font-bold ${saturationColor(product.saturation)}`}>
              {product.saturation} saturation
            </span>
            <span className="rounded-md bg-tide/12 px-2.5 py-1 text-xs font-bold text-tide dark:text-cyan-200">
              {product.platform}
            </span>
            <SupplierLink url={product.sourceUrl} />
          </div>
          <h3 className="mt-3 text-2xl font-black leading-tight">{product.name}</h3>
          <p className="mt-2 text-sm leading-6 text-ink/68 dark:text-paper/68">{whyChosen}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <ScoreRing label="Opportunity" score={opportunityScore} />
        <ScoreRing label="Trend Score" score={product.trendScore} />
        <ScoreRing label="Beginner Launch" score={product.launchScore} />
      </div>

      <section className="mt-5 rounded-md border border-tide/20 bg-tide/8 p-4 dark:border-cyan-200/15 dark:bg-cyan-200/8">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            <div className="flex items-center gap-2 text-sm font-black text-tide dark:text-cyan-200">
              <TrendingUp size={18} />
              Product Forecast Engine
            </div>
            <p className="mt-2 text-sm leading-6 text-ink/68 dark:text-paper/68">{forecast.confidenceExplanation}</p>
          </div>
          <div className="shrink-0 rounded-md bg-ink px-4 py-3 text-paper dark:bg-paper dark:text-ink">
            <div className="text-xs font-bold uppercase tracking-[0.16em] opacity-70">Forecast Confidence</div>
            <div className="mt-1 text-3xl font-black">{forecast.forecastConfidence}</div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Metric icon={<Activity size={17} />} label="Expected Growth" value={`${forecast.expectedGrowth}%`} />
          <Metric icon={<CalendarClock size={17} />} label="Trend Lifespan" value={forecast.expectedTrendLifespan} />
          <Metric icon={<CalendarClock size={17} />} label="Saturation Date" value={forecast.expectedSaturationDate} />
          <Metric icon={<TrendingUp size={17} />} label="Growth Direction" value={forecast.growthDirection} />
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {forecast.windows.map((window) => (
            <div key={window.weeks} className="rounded-md border border-black/10 bg-white/60 p-3 dark:border-white/10 dark:bg-ink/55">
              <div className="text-xs font-bold uppercase tracking-[0.16em] text-ink/48 dark:text-paper/48">{window.weeks} week forecast</div>
              <div className="mt-2 text-2xl font-black">{window.expectedGrowth}%</div>
              <div className="mt-1 text-sm text-ink/62 dark:text-paper/62">
                {window.growthDirection} with {window.confidence}/100 confidence
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-2 text-xs font-bold sm:grid-cols-2 xl:grid-cols-5">
          <Signal label="Google search" value={forecast.signals.googleSearchGrowth} />
          <Signal label="TikTok creators" value={forecast.signals.tiktokCreatorGrowth} />
          <Signal label="Video engagement" value={forecast.signals.videoEngagement} />
          <Signal label="Pinterest saves" value={forecast.signals.pinterestSaves} />
          <Signal label="Marketplace sales" value={forecast.signals.marketplaceSalesGrowth} />
          <Signal label="Supplier availability" value={forecast.signals.supplierAvailability} />
          <Signal label="Competition growth" value={forecast.signals.competitionGrowth} />
          <Signal label="Search momentum" value={forecast.signals.searchMomentum} />
          <Signal label="Acceleration" value={forecast.signals.trendAcceleration} />
          <Signal label="Seasonality" value={forecast.signals.seasonality} />
        </div>
      </section>

      <div className="mt-5 grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-4">
        <Metric icon={<PackageSearch size={17} />} label="Competition" value={`${product.competition}/100`} />
        <Metric icon={<BadgeDollarSign size={17} />} label="Margin" value={`${product.profitMargin}% est.`} />
        <Metric icon={<ArrowRight size={17} />} label="Price / Cost" value={`$${product.suggestedPrice} / $${product.estimatedCost}`} />
        <Metric icon={<Globe2 size={17} />} label="Best country" value={product.country} />
        <Metric icon={<Megaphone size={17} />} label="Best platform" value={product.platform} />
        <Metric icon={<ArrowRight size={17} />} label="Saturation" value={product.saturation} />
        <Metric icon={<PackageSearch size={17} />} label="Supplier" value={product.supplierNotes} />
        <Metric icon={<Megaphone size={17} />} label="Ad hooks" value={product.adAngles.slice(0, 2).join(", ")} />
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        <Insight title="Trend Forecast" body={product.trendForecast} />
        <Insight title="Why AI Chose It" body={product.aiRecommendation} />
        <Insight title="Similar Alternatives" body={product.similarAlternatives.join(", ")} />
      </div>

      <div className="mt-4 rounded-md bg-coral/10 p-4 text-sm leading-6 text-ink/72 dark:bg-coral/15 dark:text-paper/72">
        <div className="mb-2 flex items-center gap-2 font-black text-coral">
          <AlertTriangle size={17} />
          Risks
        </div>
        {product.risks.join(" ")}
      </div>
    </article>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-md border border-black/10 bg-paper/70 p-3 dark:border-white/10 dark:bg-ink/70">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-ink/48 dark:text-paper/48">
        <span className="text-coral">{icon}</span>
        {label}
      </div>
      <div className="mt-2 leading-5 text-ink/78 dark:text-paper/78">{value}</div>
    </div>
  );
}

function Insight({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-md bg-ink/5 p-4 dark:bg-white/8">
      <div className="text-sm font-black">{title}</div>
      <p className="mt-2 text-sm leading-6 text-ink/66 dark:text-paper/66">{body}</p>
    </div>
  );
}

function Signal({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-white/60 p-3 dark:bg-ink/55">
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
