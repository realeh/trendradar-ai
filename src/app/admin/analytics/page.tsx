"use client";

import { useState } from "react";

type AnalyticsData = {
  totals: {
    signups: number;
    checkoutStarted: number;
    checkoutCompleted: number;
    subscriptionsCancelled: number;
    activeSubscriptions: number;
  };
  conversionRate: number | null;
  churnRate: number | null;
  subscriptionStatusBreakdown: Record<string, number>;
  recentSignups: { id: string; created_at: string }[];
  recentCheckoutStarts: { id: string; created_at: string; metadata: { plan?: string } }[];
};

export default function AdminAnalyticsPage() {
  const [secret, setSecret] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/analytics", { headers: { "x-admin-secret": secret } });
      const json = await res.json();
      if (json.error) {
        setStatus(json.error);
        return;
      }
      setData(json as AnalyticsData);
      setUnlocked(true);
    } finally {
      setLoading(false);
    }
  }

  if (!unlocked) {
    return (
      <div className="mx-auto max-w-md space-y-4 p-8">
        <h1 className="text-2xl font-black">Analytics admin</h1>
        <p className="text-sm text-ink/60">Enter your ADMIN_SECRET to view signup, conversion, and churn data.</p>
        <input
          type="password"
          value={secret}
          onChange={(event) => setSecret(event.target.value)}
          placeholder="Admin secret"
          className="w-full rounded-md border border-black/10 p-3"
        />
        <button onClick={load} disabled={!secret || loading} className="rounded-md bg-ink px-4 py-2 font-bold text-white disabled:opacity-50">
          {loading ? "Loading..." : "Unlock"}
        </button>
        {status && <p className="text-sm text-red-600">{status}</p>}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Signups, conversion & churn</h1>
          <p className="mt-1 text-sm text-ink/60">
            Built from real Supabase data: signups and checkout starts logged by the app, checkout completions and
            cancellations from Stripe webhook events. No third-party analytics tool needed.
          </p>
        </div>
        <button onClick={load} disabled={loading} className="rounded-md border border-black/10 px-4 py-2 text-sm font-bold">
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Signups" value={data.totals.signups} />
        <Stat label="Checkouts started" value={data.totals.checkoutStarted} />
        <Stat label="Checkouts completed" value={data.totals.checkoutCompleted} />
        <Stat label="Active subscriptions" value={data.totals.activeSubscriptions} />
        <Stat label="Cancellations" value={data.totals.subscriptionsCancelled} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-md border border-black/10 p-5">
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-ink/48">Checkout conversion</div>
          <div className="mt-2 text-3xl font-black">
            {data.conversionRate === null ? "—" : `${data.conversionRate}%`}
          </div>
          <p className="mt-1 text-xs text-ink/50">Completed ÷ started checkouts</p>
        </div>
        <div className="rounded-md border border-black/10 p-5">
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-ink/48">Churn rate</div>
          <div className="mt-2 text-3xl font-black">{data.churnRate === null ? "—" : `${data.churnRate}%`}</div>
          <p className="mt-1 text-xs text-ink/50">Cancellations ÷ (active + cancelled)</p>
        </div>
      </div>

      <div className="rounded-md border border-black/10 p-5">
        <h2 className="font-black">Subscription status breakdown</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          {Object.entries(data.subscriptionStatusBreakdown).map(([status, count]) => (
            <span key={status} className="rounded-md bg-ink/5 px-3 py-2 text-sm font-bold">
              {status}: {count}
            </span>
          ))}
          {Object.keys(data.subscriptionStatusBreakdown).length === 0 && (
            <span className="text-sm text-ink/50">No profiles yet.</span>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-md border border-black/10 p-5">
          <h2 className="font-black">Recent signups</h2>
          <div className="mt-3 space-y-2 text-sm">
            {data.recentSignups.length === 0 && <p className="text-ink/50">None yet.</p>}
            {data.recentSignups.map((row) => (
              <div key={row.id} className="rounded-md bg-ink/5 px-3 py-2">
                {new Date(row.created_at).toLocaleString()}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-md border border-black/10 p-5">
          <h2 className="font-black">Recent checkout starts</h2>
          <div className="mt-3 space-y-2 text-sm">
            {data.recentCheckoutStarts.length === 0 && <p className="text-ink/50">None yet.</p>}
            {data.recentCheckoutStarts.map((row) => (
              <div key={row.id} className="rounded-md bg-ink/5 px-3 py-2">
                {new Date(row.created_at).toLocaleString()} — {row.metadata?.plan ?? "unknown plan"}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-black/10 p-4">
      <div className="text-xs font-bold uppercase tracking-[0.16em] text-ink/48">{label}</div>
      <div className="mt-2 text-3xl font-black">{value}</div>
    </div>
  );
}
