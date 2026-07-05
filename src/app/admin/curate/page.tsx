"use client";

import { useState } from "react";
import { buildCjSupplierUrl } from "@/lib/supplier-links";

type CjProduct = {
  id: string;
  nameEn: string;
  sku?: string;
  bigImage: string;
  sellPrice: string;
  oneCategoryName?: string;
  twoCategoryName?: string;
  threeCategoryName?: string;
  listedNum: number;
  warehouseInventoryNum: number;
  totalVerifiedInventory: number;
  deliveryCycle?: string;
};

type CuratedRow = {
  id: string;
  name: string;
  category: string;
  saturation: string;
  status: string;
  data_source: string;
  suggested_price: number;
  estimated_cost: number;
};

const platforms = ["TikTok", "Meta", "Google", "Pinterest", "Amazon"];
const saturations = ["Low", "Medium", "High"];

export default function AdminCuratePage() {
  const [secret, setSecret] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [trendingOnly, setTrendingOnly] = useState(true);
  const [results, setResults] = useState<CjProduct[]>([]);
  const [selected, setSelected] = useState<CjProduct | null>(null);
  const [curated, setCurated] = useState<CuratedRow[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [aiKeyword, setAiKeyword] = useState("");
  const [aiTrendingOnly, setAiTrendingOnly] = useState(true);
  const [aiCount, setAiCount] = useState(5);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState<string | null>(null);

  const [form, setForm] = useState({
    country: "United States",
    platform: "TikTok",
    saturation: "Medium",
    suggestedPrice: 0,
    estimatedCost: 0,
    targetAudience: "",
    whyTrending: "",
    trendForecast: "",
    supplierNotes: "",
    aiRecommendation: "",
    risks: "",
    similarAlternatives: "",
    adAngles: "",
    earlySignal: "",
    curatorTrendAssessment: 65,
    growth: 20,
    demand: 65,
    competition: 45,
    trendMomentum: 60,
    viralPotential: 60,
    supplierReliability: 75,
    shippingEase: 75,
    curatorNotes: ""
  });

  function headers() {
    return { "Content-Type": "application/json", "x-admin-secret": secret };
  }

  async function loadCurated() {
    const res = await fetch("/api/admin/curated-products", { headers: headers() });
    const data = await res.json();
    if (data.error) {
      setStatus(data.error);
      return;
    }
    setCurated(data.products ?? []);
  }

  async function unlock() {
    setLoading(true);
    await loadCurated();
    setLoading(false);
    setUnlocked(true);
  }

  async function search() {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/cj-search", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ keyword, productFlag: trendingOnly ? 0 : undefined })
      });
      const data = await res.json();
      if (data.error) {
        setStatus(data.error);
        setResults([]);
        return;
      }
      setResults(data.products ?? []);
    } finally {
      setLoading(false);
    }
  }

  function pick(product: CjProduct) {
    setSelected(product);
    setForm((prev) => ({
      ...prev,
      estimatedCost: Number(product.sellPrice) || 0,
      suggestedPrice: Math.round((Number(product.sellPrice) || 0) * 3 * 100) / 100
    }));
  }

  async function saveCurated() {
    if (!selected) return;
    setLoading(true);
    setStatus(null);

    const listToArray = (value: string) => value.split(",").map((v) => v.trim()).filter(Boolean);
    const verifiedInventory = selected.totalVerifiedInventory ?? selected.warehouseInventoryNum ?? 0;

    const payload = {
      name: selected.nameEn,
      category: selected.threeCategoryName || selected.twoCategoryName || selected.oneCategoryName || "General",
      country: form.country,
      platform: form.platform,
      saturation: form.saturation,
      growth: form.growth,
      trendScore: form.curatorTrendAssessment,
      launchScore: Math.round((form.supplierReliability + form.shippingEase + (100 - form.competition)) / 3),
      profitMargin: form.suggestedPrice > 0 ? Math.round(((form.suggestedPrice - form.estimatedCost) / form.suggestedPrice) * 100) : 0,
      viralPotential: form.viralPotential,
      demand: form.demand,
      competition: form.competition,
      trendMomentum: form.trendMomentum,
      supplierReliability: form.supplierReliability,
      shippingEase: form.shippingEase,
      suggestedPrice: form.suggestedPrice,
      estimatedCost: form.estimatedCost,
      targetAudience: form.targetAudience,
      whyTrending: form.whyTrending,
      trendForecast: form.trendForecast,
      supplierNotes: form.supplierNotes,
      aiRecommendation: form.aiRecommendation,
      risks: listToArray(form.risks),
      similarAlternatives: listToArray(form.similarAlternatives),
      adAngles: listToArray(form.adAngles),
      earlySignal: form.earlySignal,
      dataSource: "cj_dropshipping",
      cjProductId: selected.id,
      sourceUrl: buildCjSupplierUrl(selected.sku || selected.nameEn),
      listedNum: selected.listedNum,
      verifiedInventory,
      deliveryCycleDays: selected.deliveryCycle,
      cjTrendingFlag: trendingOnly,
      curatorTrendAssessment: form.curatorTrendAssessment,
      curatorNotes: form.curatorNotes,
      curatedBy: "admin"
    };

    const res = await fetch("/api/admin/curated-products", {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    setLoading(false);

    if (data.error) {
      setStatus(data.error);
      return;
    }

    setStatus(`Saved "${selected.nameEn}" to your live catalog.`);
    setSelected(null);
    await loadCurated();
  }

  async function archive(id: string) {
    setLoading(true);
    await fetch(`/api/admin/curated-products?id=${encodeURIComponent(id)}`, { method: "DELETE", headers: headers() });
    await loadCurated();
    setLoading(false);
  }

  async function runAiCurate() {
    setAiLoading(true);
    setAiStatus(null);
    try {
      const res = await fetch("/api/admin/ai-curate", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ keyword: aiKeyword, trendingOnly: aiTrendingOnly, count: aiCount })
      });
      const data = await res.json();
      if (data.error) {
        setAiStatus(data.error);
        return;
      }
      const savedCount = data.saved?.length ?? 0;
      const failedCount = data.failed?.length ?? 0;
      const providerNote =
        data.aiProvider === "claude"
          ? " (Copy written by Claude.)"
          : data.aiProvider === "openai"
            ? " (Copy written by OpenAI.)"
            : " (Using rules-based copy — set ANTHROPIC_API_KEY or OPENAI_API_KEY for AI-written descriptions.)";
      setAiStatus(
        `Saved ${savedCount} product${savedCount === 1 ? "" : "s"} to your live catalog` +
          (failedCount ? `, ${failedCount} failed.` : ".") +
          providerNote
      );
      await loadCurated();
    } finally {
      setAiLoading(false);
    }
  }

  if (!unlocked) {
    return (
      <div className="mx-auto max-w-md space-y-4 p-8">
        <h1 className="text-2xl font-black">Curation admin</h1>
        <p className="text-sm text-ink/60">
          Enter the ADMIN_SECRET you set in your environment variables. This gates access to product curation — it
          is not full user auth, so don&apos;t share this secret outside your team.
        </p>
        <input
          type="password"
          value={secret}
          onChange={(event) => setSecret(event.target.value)}
          placeholder="Admin secret"
          className="w-full rounded-md border border-black/10 p-3"
        />
        <button onClick={unlock} disabled={!secret || loading} className="rounded-md bg-ink px-4 py-2 font-bold text-white disabled:opacity-50">
          {loading ? "Checking..." : "Unlock"}
        </button>
        {status && <p className="text-sm text-red-600">{status}</p>}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-black">Curate real products</h1>
        <p className="mt-1 text-sm text-ink/60">
          Search the live CJ Dropshipping catalog, pick real products, and add your own trend judgment. Anything you
          save here replaces the demo data across the whole app.
        </p>
      </div>

      {status && <div className="rounded-md bg-ink/5 p-3 text-sm font-bold">{status}</div>}

      <section className="space-y-3 rounded-md border border-coral/30 bg-coral/5 p-4">
        <h2 className="font-black">AI Auto-Curate</h2>
        <p className="text-sm text-ink/60">
          Let AI search the live CJ catalog, score real listings by saturation and verified stock, and write up the
          top picks automatically. Every number still comes from CJ&apos;s real data — the AI only writes the
          descriptive copy, preferring Claude, then OpenAI, then an honest rules-based fallback.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={aiKeyword}
            onChange={(event) => setAiKeyword(event.target.value)}
            placeholder="e.g. pet hair remover (optional)"
            className="min-w-[240px] flex-1 rounded-md border border-black/10 p-2"
          />
          <label className="flex items-center gap-2 text-sm font-bold">
            <input type="checkbox" checked={aiTrendingOnly} onChange={(event) => setAiTrendingOnly(event.target.checked)} />
            CJ-flagged trending only
          </label>
          <label className="flex items-center gap-2 text-sm font-bold">
            Count
            <input
              type="number"
              min={1}
              max={10}
              value={aiCount}
              onChange={(event) => setAiCount(Number(event.target.value))}
              className="w-16 rounded-md border border-black/10 p-2"
            />
          </label>
          <button onClick={runAiCurate} disabled={aiLoading} className="rounded-md bg-coral px-4 py-2 font-black text-white disabled:opacity-50">
            {aiLoading ? "Curating..." : "Run AI Curation"}
          </button>
        </div>
        {aiStatus && <div className="rounded-md bg-white/60 p-3 text-sm font-bold">{aiStatus}</div>}
      </section>

      <section className="space-y-3 rounded-md border border-black/10 p-4">
        <h2 className="font-black">Or curate manually: search CJ Dropshipping</h2>
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="e.g. pet hair remover"
            className="min-w-[240px] flex-1 rounded-md border border-black/10 p-2"
          />
          <label className="flex items-center gap-2 text-sm font-bold">
            <input type="checkbox" checked={trendingOnly} onChange={(event) => setTrendingOnly(event.target.checked)} />
            CJ-flagged trending only
          </label>
          <button onClick={search} disabled={loading} className="rounded-md bg-ink px-4 py-2 font-bold text-white">
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {results.map((product) => (
            <button
              key={product.id}
              onClick={() => pick(product)}
              className={`rounded-md border p-3 text-left text-sm ${selected?.id === product.id ? "border-coral bg-coral/5" : "border-black/10"}`}
            >
              <div className="font-bold">{product.nameEn}</div>
              <div className="mt-1 text-ink/60">
                ${product.sellPrice} · listed {product.listedNum}x elsewhere · {product.totalVerifiedInventory ?? 0} verified stock
              </div>
            </button>
          ))}
        </div>
      </section>

      {selected && (
        <section className="space-y-3 rounded-md border border-black/10 p-4">
          <h2 className="font-black">2. Add your trend judgment for &quot;{selected.nameEn}&quot;</h2>
          <p className="text-sm text-ink/60">
            Price, inventory, and listing count above are real CJ data. Everything below is your call as the
            curator — that&apos;s the honest replacement for the old fabricated signals.
          </p>

          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Country">
              <input
                value={form.country}
                onChange={(event) => setForm({ ...form, country: event.target.value })}
                className="w-full rounded-md border border-black/10 p-2"
              />
            </Field>
            <Field label="Best ad platform">
              <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} className="w-full rounded-md border border-black/10 p-2">
                {platforms.map((p) => <option key={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Saturation">
              <select value={form.saturation} onChange={(e) => setForm({ ...form, saturation: e.target.value })} className="w-full rounded-md border border-black/10 p-2">
                {saturations.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Your selling price ($)">
              <input
                type="number"
                value={form.suggestedPrice}
                onChange={(event) => setForm({ ...form, suggestedPrice: Number(event.target.value) })}
                className="w-full rounded-md border border-black/10 p-2"
              />
            </Field>
            <Field label="Landed cost ($, from CJ price)">
              <input
                type="number"
                value={form.estimatedCost}
                onChange={(event) => setForm({ ...form, estimatedCost: Number(event.target.value) })}
                className="w-full rounded-md border border-black/10 p-2"
              />
            </Field>
            <Field label="Your trend confidence (1-100)">
              <input
                type="number"
                value={form.curatorTrendAssessment}
                onChange={(event) => setForm({ ...form, curatorTrendAssessment: Number(event.target.value) })}
                className="w-full rounded-md border border-black/10 p-2"
              />
            </Field>
          </div>

          <TextField label="Target audience" value={form.targetAudience} onChange={(v) => setForm({ ...form, targetAudience: v })} />
          <TextField label="Why it's trending (what you actually observed)" value={form.whyTrending} onChange={(v) => setForm({ ...form, whyTrending: v })} />
          <TextField label="Trend forecast note" value={form.trendForecast} onChange={(v) => setForm({ ...form, trendForecast: v })} />
          <TextField label="Ad angles (comma separated)" value={form.adAngles} onChange={(v) => setForm({ ...form, adAngles: v })} />
          <TextField label="Risks (comma separated)" value={form.risks} onChange={(v) => setForm({ ...form, risks: v })} />
          <TextField label="Similar alternatives (comma separated)" value={form.similarAlternatives} onChange={(v) => setForm({ ...form, similarAlternatives: v })} />
          <TextField label="Internal curator notes (not shown to users)" value={form.curatorNotes} onChange={(v) => setForm({ ...form, curatorNotes: v })} />

          <button onClick={saveCurated} disabled={loading} className="rounded-md bg-coral px-5 py-2 font-black text-white">
            {loading ? "Saving..." : "Save to live catalog"}
          </button>
        </section>
      )}

      <section className="space-y-3 rounded-md border border-black/10 p-4">
        <h2 className="font-black">Currently live ({curated.filter((p) => p.status === "active").length})</h2>
        <div className="space-y-2">
          {curated.map((product) => (
            <div key={product.id} className="flex items-center justify-between rounded-md border border-black/10 p-3 text-sm">
              <div>
                <span className="font-bold">{product.name}</span> — {product.category} — {product.saturation} saturation —{" "}
                {product.status} — ${product.suggested_price}
              </div>
              {product.status === "active" && (
                <button onClick={() => archive(product.id)} className="rounded-md bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                  Archive
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-bold">
      {label}
      <div className="mt-1 font-normal">{children}</div>
    </label>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm font-bold">
      {label}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={2}
        className="mt-1 w-full rounded-md border border-black/10 p-2 text-sm font-normal"
      />
    </label>
  );
}
