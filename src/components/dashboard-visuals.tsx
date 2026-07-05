import { ArrowUpRight, CircleDot, LineChart, Loader2, SearchX, Sparkles } from "lucide-react";

const trendBars = [
  { label: "Beauty", value: 82, color: "bg-coral" },
  { label: "Home", value: 76, color: "bg-tide" },
  { label: "Pets", value: 69, color: "bg-emerald-500" },
  { label: "Kitchen", value: 61, color: "bg-gold" },
  { label: "Travel", value: 58, color: "bg-moss" }
];

const forecastPoints = [28, 42, 38, 55, 62, 71, 68, 84];

export function TrendVelocityChart() {
  return (
    <section className="premium-card rounded-md p-5 animate-fade-up">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-black">
            <LineChart size={17} className="text-coral" />
            Trend velocity
          </div>
          <p className="mt-1 text-sm text-ink/58 dark:text-paper/58">Category momentum over the next 30 days</p>
        </div>
        <span className="rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-black text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-200">
          +18.4%
        </span>
      </div>

      <div className="mt-6 flex h-40 items-end gap-2 rounded-md bg-ink/[0.035] p-4 dark:bg-white/[0.045]">
        {forecastPoints.map((point, index) => (
          <div key={`${point}-${index}`} className="flex flex-1 flex-col items-center gap-2">
            <div
              className="w-full rounded-t-md bg-gradient-to-t from-tide to-coral transition hover:opacity-80"
              style={{ height: `${point}%` }}
            />
            <span className="text-[0.65rem] font-bold text-ink/42 dark:text-paper/42">{index + 1}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CategoryMomentum() {
  return (
    <section className="premium-card rounded-md p-5 animate-fade-up [animation-delay:80ms]">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black">Category momentum</h2>
        <ArrowUpRight size={18} className="text-ink/45 dark:text-paper/45" />
      </div>
      <div className="mt-5 space-y-4">
        {trendBars.map((item) => (
          <div key={item.label}>
            <div className="mb-2 flex items-center justify-between text-sm font-bold">
              <span>{item.label}</span>
              <span className="text-ink/52 dark:text-paper/52">{item.value}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-black/8 dark:bg-white/10">
              <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.value}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function LoadingInsightCard() {
  return (
    <section className="premium-card relative overflow-hidden rounded-md p-5 animate-fade-up [animation-delay:120ms]">
      <div className="absolute inset-y-0 left-0 w-1/2 animate-shimmer bg-gradient-to-r from-transparent via-white/45 to-transparent dark:via-white/10" />
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-md bg-ink text-paper dark:bg-paper dark:text-ink">
          <Loader2 size={18} className="animate-spin" />
        </span>
        <div>
          <div className="font-black">Scanning live-style signals</div>
          <div className="mt-1 text-sm text-ink/58 dark:text-paper/58">Search, creator, marketplace, and supplier signals</div>
        </div>
      </div>
      <div className="mt-5 space-y-3">
        <SkeletonLine width="w-11/12" />
        <SkeletonLine width="w-8/12" />
        <SkeletonLine width="w-10/12" />
      </div>
    </section>
  );
}

export function EmptyStateCard() {
  return (
    <section className="premium-card rounded-md p-5 animate-fade-up [animation-delay:160ms]">
      <div className="grid min-h-44 place-items-center rounded-md border border-dashed border-black/15 bg-white/38 text-center dark:border-white/15 dark:bg-white/[0.035]">
        <div className="max-w-sm p-5">
          <div className="mx-auto grid size-11 place-items-center rounded-md bg-ink text-paper dark:bg-paper dark:text-ink">
            <SearchX size={19} />
          </div>
          <h3 className="mt-4 font-black">No saved research yet</h3>
          <p className="mt-2 text-sm leading-6 text-ink/58 dark:text-paper/58">
            Ask the consultant a question, then save promising product theses here.
          </p>
        </div>
      </div>
    </section>
  );
}

export function SignalTimeline() {
  const items = ["Intent parsed", "Forecast scored", "Risks checked", "Recommendations ranked"];

  return (
    <section className="premium-card rounded-md p-5 animate-fade-up [animation-delay:200ms]">
      <div className="flex items-center gap-2 font-black">
        <Sparkles size={17} className="text-coral" />
        AI pipeline
      </div>
      <div className="mt-5 space-y-3">
        {items.map((item, index) => (
          <div key={item} className="flex items-center gap-3">
            <span className="grid size-7 place-items-center rounded-full bg-ink text-xs font-black text-paper dark:bg-paper dark:text-ink">
              {index + 1}
            </span>
            <span className="flex-1 rounded-md bg-ink/[0.035] px-3 py-2 text-sm font-bold dark:bg-white/[0.055]">{item}</span>
            <CircleDot size={15} className="text-emerald-500" />
          </div>
        ))}
      </div>
    </section>
  );
}

function SkeletonLine({ width }: { width: string }) {
  return <div className={`h-3 rounded-full bg-ink/10 dark:bg-white/10 ${width}`} />;
}
