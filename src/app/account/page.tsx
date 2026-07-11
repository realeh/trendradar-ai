"use client";

import { useEffect, useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import { getAIConfigStatus, getAIProvider, getStripeConfigStatus, getSupabaseConfigStatus } from "@/lib/integrations";

const aiProvider = getAIProvider();

const checks = [
  { label: "Supabase auth/database", ready: getSupabaseConfigStatus(), env: "NEXT_PUBLIC_SUPABASE_URL" },
  { label: "Stripe subscriptions", ready: getStripeConfigStatus(), env: "STRIPE_SECRET_KEY" },
  {
    label: aiProvider === "claude" ? "Claude AI responses" : aiProvider === "openai" ? "OpenAI responses" : "AI responses",
    ready: getAIConfigStatus(),
    env: "ANTHROPIC_API_KEY or OPENAI_API_KEY"
  }
];

type Profile = {
  email: string | null;
  plan: string | null;
  subscription_status: string | null;
  stripe_customer_id: string | null;
};

export default function AccountPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState("");

  useEffect(() => {
    (async () => {
      const supabase = createBrowserSupabaseClient();
      if (!supabase) {
        setLoading(false);
        return;
      }
      const {
        data: { session }
      } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("email, plan, subscription_status, stripe_customer_id")
        .eq("id", session.user.id)
        .maybeSingle();
      setProfile(data ?? null);
      setLoading(false);
    })();
  }, []);

  async function openBillingPortal() {
    setPortalLoading(true);
    setPortalError("");

    const supabase = createBrowserSupabaseClient();
    const session = supabase ? (await supabase.auth.getSession()).data.session : null;
    if (!session) {
      setPortalError("Please log in again.");
      setPortalLoading(false);
      return;
    }

    const response = await fetch("/api/stripe/portal", {
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}` }
    });
    const data = (await response.json()) as { url?: string; error?: string };
    setPortalLoading(false);

    if (!response.ok || !data.url) {
      setPortalError(data.error ?? "Could not open billing portal.");
      return;
    }

    window.location.href = data.url;
  }

  const planLabel = profile?.plan ? profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1) : "No plan yet";
  const statusLabel = profile?.subscription_status
    ? profile.subscription_status.charAt(0).toUpperCase() + profile.subscription_status.slice(1)
    : "Not subscribed";
  const hasBillingAccount = Boolean(profile?.stripe_customer_id);

  return (
    <AppShell gate="auth">
      <div className="space-y-5 p-4 sm:p-6">
        <PageHeader
          eyebrow="Account"
          title="Subscription workspace"
          description="Your real plan, subscription status, and billing controls — pulled from your account, not sample data."
        />
        <section className="rounded-md border border-black/10 bg-white/68 p-5 shadow-panel dark:border-white/10 dark:bg-white/6">
          {loading ? (
            <div className="flex items-center gap-2 text-sm font-bold text-ink/55 dark:text-paper/55">
              <Loader2 size={16} className="animate-spin" /> Loading your account...
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <Panel label="Current plan" value={planLabel} detail={profile?.email ?? ""} />
                <Panel label="Subscription status" value={statusLabel} detail="Synced live from Stripe" />
                <Panel
                  label="Billing"
                  value={hasBillingAccount ? "Active" : "None yet"}
                  detail={hasBillingAccount ? "Manage below" : "Subscribe on the Pricing page"}
                />
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                {hasBillingAccount ? (
                  <button
                    type="button"
                    onClick={openBillingPortal}
                    disabled={portalLoading}
                    className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-3 text-sm font-black text-paper disabled:cursor-not-allowed disabled:opacity-70 dark:bg-paper dark:text-ink"
                  >
                    {portalLoading ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
                    Manage billing (cancel, update card, invoices)
                  </button>
                ) : (
                  <a
                    href="/pricing"
                    className="inline-flex items-center gap-2 rounded-md bg-coral px-4 py-3 text-sm font-black text-white"
                  >
                    <CreditCard size={16} />
                    View plans
                  </a>
                )}
              </div>
              {portalError && <p className="mt-3 text-sm font-bold text-coral">{portalError}</p>}
            </>
          )}
        </section>
        <section className="rounded-md border border-black/10 bg-white/68 p-5 shadow-panel dark:border-white/10 dark:bg-white/6">
          <h2 className="text-xl font-black">Integration readiness</h2>
          <div className="mt-4 space-y-3">
            {checks.map((check) => (
              <div key={check.label} className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-ink/5 px-4 py-3 dark:bg-white/8">
                <div>
                  <div className="font-bold">{check.label}</div>
                  <div className="text-sm text-ink/55 dark:text-paper/55">{check.env}</div>
                </div>
                <span className={check.ready ? "text-sm font-black text-emerald-600" : "text-sm font-black text-coral"}>
                  {check.ready ? "Configured" : "Needs keys"}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function Panel({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-md bg-ink/5 p-4 dark:bg-white/8">
      <div className="text-xs font-bold uppercase tracking-[0.18em] text-ink/48 dark:text-paper/48">{label}</div>
      <div className="mt-2 text-2xl font-black">{value}</div>
      <div className="mt-1 text-sm text-ink/60 dark:text-paper/60">{detail}</div>
    </div>
  );
}
