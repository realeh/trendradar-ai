"use client";

import { useState } from "react";
import { Loader2, Radar } from "lucide-react";

export function CheckoutButton({ plan }: { plan: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function checkout() {
    setLoading(true);
    setError("");

    const response = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
