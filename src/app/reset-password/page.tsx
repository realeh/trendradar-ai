"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Radar } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

export default function ResetPasswordPage() {
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Supabase's password-recovery email links land here with a recovery
    // token in the URL; supabase-js reads it automatically and fires this
    // event once it has turned that into a real (temporary) session.
    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setMessage("Supabase keys are not configured yet.");
      return;
    }

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });

    // Cover the case where the event already fired before this listener
    // was attached.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setMessage("");

    if (password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setMessage("Passwords don't match.");
      return;
    }

    setLoading(true);
    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setMessage("Supabase keys are not configured yet.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setDone(true);
    setMessage("Password updated. You can now log in with your new password.");
  }

  return (
    <main className="soft-grid grid min-h-screen place-items-center bg-paper px-4 text-ink dark:bg-ink dark:text-paper">
      <section className="w-full max-w-md rounded-md border border-black/10 bg-white/72 p-6 shadow-panel dark:border-white/10 dark:bg-white/6">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-md bg-ink text-paper dark:bg-paper dark:text-ink">
            <Radar size={21} />
          </span>
          <span className="font-display text-2xl">TrendRadar AI</span>
        </Link>
        <h1 className="mt-8 text-3xl font-black">Set a new password</h1>

        {!ready && !done && (
          <p className="mt-4 rounded-md bg-ink/5 p-3 text-sm leading-6 text-ink/68 dark:bg-white/8 dark:text-paper/68">
            Open this page from the password reset link in your email. If you got here directly, request a new
            link from the <Link href="/login" className="underline">login page</Link>.
          </p>
        )}

        {ready && !done && (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block text-sm font-black">
              New password
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-md border border-black/10 bg-paper px-3 py-3 outline-none focus:ring-2 focus:ring-tide dark:border-white/10 dark:bg-ink"
              />
            </label>
            <label className="block text-sm font-black">
              Confirm new password
              <input
                type="password"
                required
                minLength={8}
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                className="mt-2 w-full rounded-md border border-black/10 bg-paper px-3 py-3 outline-none focus:ring-2 focus:ring-tide dark:border-white/10 dark:bg-ink"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-coral px-4 py-3 text-center font-black text-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              Update password
            </button>
          </form>
        )}

        {message && <p className="mt-4 rounded-md bg-ink/5 p-3 text-sm leading-6 text-ink/68 dark:bg-white/8 dark:text-paper/68">{message}</p>}

        {done && (
          <Link href="/login" className="mt-4 inline-block rounded-md bg-ink px-4 py-3 text-sm font-black text-paper dark:bg-paper dark:text-ink">
            Go to login
          </Link>
        )}
      </section>
    </main>
  );
}
