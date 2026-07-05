import Link from "next/link";
import { Radar } from "lucide-react";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="soft-grid grid min-h-screen place-items-center bg-paper px-4 text-ink dark:bg-ink dark:text-paper">
      <section className="w-full max-w-md rounded-md border border-black/10 bg-white/72 p-6 shadow-panel dark:border-white/10 dark:bg-white/6">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-md bg-ink text-paper dark:bg-paper dark:text-ink">
            <Radar size={21} />
          </span>
          <span className="font-display text-2xl">TrendRadar AI</span>
        </Link>
        <h1 className="mt-8 text-3xl font-black">Login or create account</h1>
        <p className="mt-2 text-sm leading-6 text-ink/62 dark:text-paper/62">
          Supabase auth-ready screen for email sign-in. The MVP keeps it local until project keys are connected.
        </p>
        <LoginForm />
      </section>
    </main>
  );
}
