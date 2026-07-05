"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-paper px-4 text-ink dark:bg-night dark:text-paper">
      <section className="premium-card w-full max-w-lg rounded-md p-6 text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-md bg-coral/12 text-coral">
          <AlertTriangle size={22} />
        </div>
        <h1 className="mt-5 text-2xl font-black">Something did not load</h1>
        <p className="mt-2 text-sm leading-6 text-ink/62 dark:text-paper/62">
          The app caught the issue safely. Try again, and if it repeats, check the local server logs.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-black text-paper dark:bg-paper dark:text-ink"
        >
          <RefreshCw size={16} />
          Retry
        </button>
      </section>
    </main>
  );
}
