import { ArrowUpRight, BadgeDollarSign, Megaphone, PackageCheck } from "lucide-react";
import type { Product } from "@/lib/types";
import { opportunityScore, saturationColor } from "@/lib/scoring";
import { ScoreRing } from "./score-ring";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="premium-card rounded-md p-4 transition hover:-translate-y-0.5 hover:shadow-lift">
      <div className="flex gap-4">
        <div className="grid size-20 shrink-0 place-items-center rounded-md bg-gradient-to-br from-[#f2d492] via-[#9bc3b1] to-[#4e9aa7] text-2xl font-black text-ink">
          {product.name
            .split(" ")
            .slice(0, 2)
            .map((word) => word[0])
            .join("")}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-ink px-2.5 py-1 text-xs font-bold text-paper dark:bg-paper dark:text-ink">
              {product.category}
            </span>
            <span className={`rounded-md px-2.5 py-1 text-xs font-bold ${saturationColor(product.saturation)}`}>
              {product.saturation} saturation
            </span>
            <span className="rounded-md bg-tide/12 px-2.5 py-1 text-xs font-bold text-tide dark:text-cyan-200">
              {product.platform}
            </span>
          </div>
          <h3 className="mt-3 text-xl font-black leading-tight">{product.name}</h3>
          <p className="mt-2 text-sm leading-6 text-ink/66 dark:text-paper/66">{product.whyTrending}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <ScoreRing label="Trend Score" score={product.trendScore} />
        <ScoreRing label="Launch Score" score={product.launchScore} />
        <ScoreRing label="Opportunity" score={opportunityScore(product)} />
      </div>

      <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <Info icon={<BadgeDollarSign size={17} />} label="Margin" value={`${product.profitMargin}% est. margin`} />
        <Info icon={<Megaphone size={17} />} label="Viral potential" value={`${product.viralPotential}/100`} />
        <Info icon={<ArrowUpRight size={17} />} label="Suggested price" value={`$${product.suggestedPrice}`} />
        <Info icon={<PackageCheck size={17} />} label="Supplier notes" value={product.supplierNotes} />
      </div>

      <div className="mt-5 rounded-md bg-ink/5 p-3 text-sm leading-6 dark:bg-white/8">
        <span className="font-black">AI recommendation: </span>
        {product.aiRecommendation}
      </div>
    </article>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex gap-3 rounded-md border border-black/10 bg-white/45 p-3 dark:border-white/10 dark:bg-white/5">
      <span className="mt-0.5 text-coral">{icon}</span>
      <span>
        <span className="block text-xs font-bold uppercase tracking-[0.16em] text-ink/48 dark:text-paper/48">
          {label}
        </span>
        <span className="leading-5 text-ink/78 dark:text-paper/78">{value}</span>
      </span>
    </div>
  );
}
