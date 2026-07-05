import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-paper px-4 text-ink dark:bg-night dark:text-paper">
      <section className="premium-card w-full max-w-lg rounded-md p-6 text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-md bg-ink text-paper dark:bg-paper dark:text-ink">
          <SearchX size={22} />
        </div>
        <h1 className="mt-5 text-2xl font-black">Page not found</h1>
        <p className="mt-2 text-sm leading-6 text-ink/62 dark:text-paper/62">
          That route is not part of the commerce intelligence workspace.
        </p>
        <Link href="/dashboard" className="mt-5 inline-block rounded-md bg-coral px-4 py-2 text-sm font-black text-white">
          Return to dashboard
        </Link>
      </section>
    </main>
  );
}
