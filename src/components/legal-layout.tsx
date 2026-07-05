import Link from "next/link";
import { ArrowLeft, Radar } from "lucide-react";

export function LegalLayout({
  title,
  updated,
  children
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-paper text-ink dark:bg-ink dark:text-paper">
      <div className="mx-auto max-w-3xl px-5 py-10">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-md bg-ink text-paper dark:bg-paper dark:text-ink">
              <Radar size={18} />
            </span>
            <span className="font-display text-xl">TrendRadar AI</span>
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-sm font-bold text-ink/60 hover:text-ink dark:text-paper/60 dark:hover:text-paper">
            <ArrowLeft size={15} />
            Back home
          </Link>
        </div>

        <h1 className="mt-8 font-display text-4xl">{title}</h1>
        <p className="mt-2 text-sm font-bold text-ink/50 dark:text-paper/50">Last updated: {updated}</p>

        <div className="legal-prose mt-8 space-y-6 text-sm leading-7 text-ink/78 dark:text-paper/78">
          {children}
        </div>
      </div>
    </main>
  );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-black text-ink dark:text-paper">{title}</h2>
      <div className="mt-2 space-y-3">{children}</div>
    </section>
  );
}
