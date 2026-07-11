"use client";

import { FormEvent, useEffect, useState } from "react";
import { Brain, Send, Sparkles } from "lucide-react";
import type { CommerceAIResponse } from "@/lib/types";
import { getAuthHeaders } from "@/lib/supabase-browser";
import { CommerceRecommendationCard } from "./commerce-recommendation-card";

const prompts = [
  "What products are trending in Australia?",
  "What products are likely to trend next month?",
  "Find me beginner-friendly products.",
  "What products have high margins but low saturation?",
  "I have a budget of $500 and only sell on TikTok. I don't want electronics."
];

type AiMode = "claude" | "openai" | "mock";

const modeLabel: Record<AiMode, string> = {
  claude: "Claude",
  openai: "OpenAI",
  mock: "Rules-based (no AI key set)"
};

export function CommerceChat({ compact = false }: { compact?: boolean }) {
  const [input, setInput] = useState(prompts[4]);
  const [question, setQuestion] = useState(prompts[4]);
  const [response, setResponse] = useState<CommerceAIResponse | null>(null);
  const [assistantMessage, setAssistantMessage] = useState<string | null>(null);
  const [mode, setMode] = useState<AiMode | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const authHeaders = await getAuthHeaders();
        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders },
          body: JSON.stringify({ query: question })
        });
        const data = await res.json();
        if (cancelled) return;
        if (data.error) {
          setError(data.error);
          return;
        }
        setResponse(data.response as CommerceAIResponse);
        setAssistantMessage(typeof data.assistantMessage === "string" ? data.assistantMessage : null);
        setMode((data.mode as AiMode) ?? null);
      } catch {
        if (!cancelled) setError("Could not reach the AI service. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [question]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!input.trim()) return;
    setQuestion(input.trim());
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[430px_1fr]">
      <section className="premium-card rounded-md p-5 animate-fade-up">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-md bg-ink text-paper shadow-panel dark:bg-paper dark:text-ink">
            <Brain size={20} />
          </span>
          <div>
            <h2 className="text-xl font-black">Commerce Consultant</h2>
            <p className="text-sm text-ink/58 dark:text-paper/58">Ask strategy questions in plain English.</p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <Bubble label="You" align="right" text={question} />
          {loading && <Bubble label="TrendRadar AI" text="Thinking..." />}
          {error && <Bubble label="TrendRadar AI" text={error} />}
          {response && !loading && (
            <>
              <Bubble label="TrendRadar AI" text={response.summary} />
              <div className="rounded-md border border-tide/15 bg-tide/10 p-4 text-sm leading-6 text-ink/72 dark:border-cyan-200/15 dark:bg-cyan-300/10 dark:text-paper/72">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 font-black text-tide dark:text-cyan-200">
                    <Sparkles size={17} />
                    Consultant note
                  </div>
                  {mode && (
                    <span className="rounded-md bg-tide/15 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-tide dark:bg-cyan-300/15 dark:text-cyan-200">
                      {modeLabel[mode]}
                    </span>
                  )}
                </div>
                {assistantMessage || response.consultantNote}
              </div>
            </>
          )}
        </div>

        <form onSubmit={submit} className="mt-5 flex gap-2">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            rows={compact ? 3 : 4}
            className="min-w-0 flex-1 resize-none rounded-md border border-black/10 bg-white/72 p-3 outline-none transition focus:border-tide focus:ring-2 focus:ring-tide/25 dark:border-white/10 dark:bg-white/[0.045]"
            placeholder="Ask about budget, country, platform, saturation, margin, or categories to avoid"
          />
          <button className="grid size-12 place-items-center rounded-md bg-coral text-white shadow-panel transition hover:-translate-y-0.5 hover:bg-coral/90" title="Send question">
            <Send size={18} />
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          {prompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => {
                setInput(prompt);
                setQuestion(prompt);
              }}
              className="rounded-md border border-black/10 bg-white/42 px-3 py-2 text-left text-xs font-bold leading-5 transition hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/[0.035] dark:hover:bg-white/[0.075]"
            >
              {prompt}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        {response && (
          <>
            <div className="premium-card rounded-md p-4 animate-fade-up">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-ink/45 dark:text-paper/45">Understood Intent</div>
              <div className="mt-3 flex flex-wrap gap-2 text-sm font-bold">
                <IntentChip label={response.intent.countries.length ? response.intent.countries.join(", ") : "Any market"} />
                <IntentChip label={response.intent.platforms.length ? response.intent.platforms.join(", ") : "Any platform"} />
                <IntentChip label={response.intent.budget ? `$${response.intent.budget} budget` : "No budget cap"} />
                {response.intent.beginnerFriendly && <IntentChip label="Beginner-friendly" />}
                {response.intent.highMargin && <IntentChip label="High margin" />}
                {response.intent.lowSaturation && <IntentChip label="Low saturation" />}
                {response.intent.forecastNextMonth && <IntentChip label="Forecast focus" />}
                {response.intent.excludedCategories.map((category) => (
                  <IntentChip key={category} label={`Avoid ${category}`} />
                ))}
              </div>
            </div>

            {response.recommendations.map((recommendation) => (
              <CommerceRecommendationCard key={recommendation.product.id} recommendation={recommendation} />
            ))}
          </>
        )}
      </section>
    </div>
  );
}

function Bubble({ label, text, align }: { label: string; text: string; align?: "right" }) {
  return (
    <div className={align === "right" ? "text-right" : ""}>
      <div className="text-xs font-bold uppercase tracking-[0.18em] text-ink/45 dark:text-paper/45">{label}</div>
      <div className="mt-1 inline-block max-w-full rounded-md bg-ink/[0.045] px-3 py-2 text-sm leading-6 dark:bg-white/[0.065]">{text}</div>
    </div>
  );
}

function IntentChip({ label }: { label: string }) {
  return <span className="rounded-md bg-ink/[0.045] px-3 py-2 dark:bg-white/[0.065]">{label}</span>;
}
