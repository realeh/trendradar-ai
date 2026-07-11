"use client";

import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, LogIn } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setMessage("Supabase keys are not configured yet. Continuing in local demo mode.");
      window.location.href = next;
      return;
    }

    const result =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/dashboard`
            }
          });

    setLoading(false);

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    if (mode === "signup" && !result.data.session) {
      setMessage("Check your email to confirm your account.");
      return;
    }

    window.location.href = next;
  }

  async function sendResetEmail() {
    if (!email) {
      setMessage("Enter your email above first, then click \"Forgot password?\" again.");
      return;
    }
    setLoading(true);
    setMessage("");

    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setMessage("Supabase keys are not configured yet.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    setLoading(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setResetSent(true);
    setMessage(`If an account exists for ${email}, a password reset link is on its way.`);
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <label className="block text-sm font-black">
        Email
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-2 w-full rounded-md border border-black/10 bg-paper px-3 py-3 outline-none focus:ring-2 focus:ring-tide dark:border-white/10 dark:bg-ink"
        />
      </label>
      <label className="block text-sm font-black">
        Password
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 w-full rounded-md border border-black/10 bg-paper px-3 py-3 outline-none focus:ring-2 focus:ring-tide dark:border-white/10 dark:bg-ink"
        />
      </label>

      {mode === "login" && !resetSent && (
        <button
          type="button"
          onClick={sendResetEmail}
          disabled={loading}
          className="text-sm font-bold text-tide underline disabled:opacity-60 dark:text-cyan-200"
        >
          Forgot password?
        </button>
      )}

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`rounded-md border px-3 py-2 text-sm font-black ${mode === "login" ? "border-ink bg-ink text-paper dark:border-paper dark:bg-paper dark:text-ink" : "border-black/10 dark:border-white/10"}`}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`rounded-md border px-3 py-2 text-sm font-black ${mode === "signup" ? "border-ink bg-ink text-paper dark:border-paper dark:bg-paper dark:text-ink" : "border-black/10 dark:border-white/10"}`}
        >
          Sign up
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-coral px-4 py-3 text-center font-black text-white disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
        Continue
      </button>

      {message && <p className="rounded-md bg-ink/5 p-3 text-sm leading-6 text-ink/68 dark:bg-white/8 dark:text-paper/68">{message}</p>}
    </form>
  );
}
