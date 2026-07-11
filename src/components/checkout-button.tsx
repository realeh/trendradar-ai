"use client";

import { useState } from "react";
import { Loader2, Radar } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

export function CheckoutButton({ plan }: { plan: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function checkout() {
    setLoading(true);
    setError("");

    const supabase = createBrowserSupabaseClient();
    const session = supabase ? (await supabase.auth.getSession()).data.session : null;

    if (supabase && !session) {
      // Subscribing requires an account so the webhook can tie the payment
      // back to a user. Send them to log in, then straight back here.
      window.location.href = `/login?next=${encodeURIComponent("/pricing")}`;
      return;
    }

    const response = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(session ? { Authorization: `Bearer ${session.access_token}` } : {})
      },
      body: JSON.stringify({ plan })
    });

    const data = (await response.json()) as { checkoutUrl?: string; error?: string };
    setLoading(false);

    if (!response.ok || !data.checkoutUrl) {
      setError(data.error ?? "Could not start checkout.");
      return;
    }

    window.location.href = data.checkoutUrl;
  }

  return (
    <div>
      <button
        type="button"
        onClick={checkout}
        disabled={loading}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-ink px-4 py-3 font-black text-paper dark:bg-paper dark:text-ink disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : <Radar size={18} />}
        Start {plan}
      </button>
      {error && <p className="mt-3 text-sm font-bold text-coral">{error}</p>}
    </div>
  );
}
