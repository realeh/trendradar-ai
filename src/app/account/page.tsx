import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
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

export default function AccountPage() {
  return (
    <AppShell>
      <div className="space-y-5 p-4 sm:p-6">
        <PageHeader
          eyebrow="Account"
          title="Subscription workspace"
          description="A ready account surface for auth state, plan status, billing actions, and integration setup."
        />
        <section className="rounded-md border border-black/10 bg-white/68 p-5 shadow-panel dark:border-white/10 dark:bg-white/6">
          <div className="grid gap-4 md:grid-cols-3">
            <Panel label="Current plan" value="Growth Trial" detail="Sample state until Stripe is connected" />
            <Panel label="Billing cycle" value="Monthly" detail="Stripe checkout pending" />
            <Panel label="AI credits" value="1,250" detail="Demo usage balance" />
          </div>
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
