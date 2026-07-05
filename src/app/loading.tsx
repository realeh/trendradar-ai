import { Radar } from "lucide-react";

export default function Loading() {
  return (
    <main className="grid min-h-screen place-items-center bg-paper px-4 text-ink dark:bg-night dark:text-paper">
      <div className="premium-card w-full max-w-md rounded-md p-6 text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-md bg-ink text-paper dark:bg-paper dark:text-ink">
          <Radar size={22} className="animate-soft-pulse" />
        </div>
        <h1 className="mt-5 text-xl font-black">Loading intelligence</h1>
        <p className="mt-2 text-sm leading-6 text-ink/62 dark:text-paper/62">Preparing forecasts, scores, and recommendations.</p>
        <div className="mt-5 space-y-3">
          <div className="mx-auto h-2 w-10/12 rounded-full bg-ink/10 dark:bg-white/10" />
          <div className="mx-auto h-2 w-7/12 rounded-full bg-ink/10 dark:bg-white/10" />
        </div>
      </div>
    </main>
  );
}
