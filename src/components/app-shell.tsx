"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BarChart3,
  CreditCard,
  Gem,
  LayoutDashboard,
  LogIn,
  Radar,
  Search,
  Sparkles,
  Store,
  Wand2
} from "lucide-react";
import { clsx } from "clsx";
import { ThemeToggle } from "./theme-toggle";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ai-discovery", label: "AI Discovery", icon: Search },
  { href: "/trending", label: "Trending", icon: BarChart3 },
  { href: "/new-store", label: "New Store Mode", icon: Store },
  { href: "/hidden-gems", label: "Hidden Gems", icon: Gem },
  { href: "/simulator", label: "Simulator", icon: Wand2 },
  { href: "/pricing", label: "Pricing", icon: CreditCard },
  { href: "/account", label: "Account", icon: LogIn }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-paper text-ink dark:bg-night dark:text-paper">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-black/10 bg-[#fbfaf6]/82 px-4 py-5 backdrop-blur-2xl dark:border-white/10 dark:bg-[#0d0f12]/88 lg:block">
        <Link href="/" className="group flex items-center gap-3 rounded-md px-2 py-1.5 transition hover:bg-black/[0.035] dark:hover:bg-white/[0.055]">
          <span className="grid size-10 place-items-center rounded-md bg-ink text-paper shadow-panel transition group-hover:scale-[1.03] dark:bg-paper dark:text-ink">
            <Radar size={21} />
          </span>
          <span>
            <span className="block font-display text-[1.55rem] leading-none">TrendRadar AI</span>
            <span className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-ink/48 dark:text-paper/48">Commerce OS</span>
          </span>
        </Link>

        <div className="mt-6 rounded-md border border-black/10 bg-white/58 p-3 dark:border-white/10 dark:bg-white/[0.045]">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.16em] text-ink/48 dark:text-paper/48">
            Workspace
            <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_18px_rgba(16,185,129,.8)]" />
          </div>
          <div className="mt-2 text-sm font-black">Ecommerce Intelligence</div>
        </div>

        <nav className="mt-6 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-bold transition",
                  active
                    ? "bg-ink text-paper shadow-panel dark:bg-paper dark:text-ink"
                    : "text-ink/64 hover:bg-black/[0.045] hover:text-ink dark:text-paper/62 dark:hover:bg-white/[0.065] dark:hover:text-paper"
                )}
              >
                {active && <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-coral" />}
                <Icon size={18} className="transition group-hover:scale-105" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-5 left-4 right-4 rounded-md border border-black/10 bg-white/62 p-4 shadow-panel dark:border-white/10 dark:bg-white/[0.055]">
          <div className="flex items-center gap-2 text-sm font-black">
            <Sparkles size={16} />
            Pro Trial
          </div>
          <p className="mt-2 text-sm leading-5 text-ink/65 dark:text-paper/65">
            Forecasts, launch scoring, and simulator outputs are running on mock intelligence.
          </p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
            <div className="h-full w-[68%] rounded-full bg-coral" />
          </div>
        </div>
      </aside>

      <main className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-black/10 bg-[#fbfaf6]/78 backdrop-blur-2xl dark:border-white/10 dark:bg-[#0d0f12]/78">
          <div className="flex min-h-[4.25rem] items-center justify-between gap-3 px-4 sm:px-7">
            <Link href="/" className="flex items-center gap-2 font-display text-xl lg:hidden">
              <Radar size={22} />
              TrendRadar AI
            </Link>
            <div className="hidden lg:block">
              <div className="text-sm font-black">Commerce Intelligence Console</div>
              <div className="mt-0.5 text-xs text-ink/52 dark:text-paper/52">Forecasting, simulation, and launch strategy in one workspace</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                title="Notifications"
                className="grid size-10 place-items-center rounded-md border border-black/10 bg-white/55 text-ink transition hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/[0.055] dark:text-paper dark:hover:bg-white/10"
              >
                <Bell size={17} />
              </button>
              <ThemeToggle />
              <Link
                href="/login"
                className="rounded-md bg-ink px-4 py-2 text-sm font-black text-paper shadow-panel transition hover:-translate-y-0.5 hover:bg-ink/88 dark:bg-paper dark:text-ink dark:hover:bg-paper/88"
              >
                Login
              </Link>
            </div>
          </div>
          <nav className="flex gap-2 overflow-x-auto px-4 pb-3 lg:hidden">
            {navItems.slice(0, 6).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "whitespace-nowrap rounded-md border px-3 py-2 text-xs font-bold transition",
                  pathname === item.href
                    ? "border-ink bg-ink text-paper shadow-panel dark:border-paper dark:bg-paper dark:text-ink"
                    : "border-black/10 bg-white/60 dark:border-white/10 dark:bg-white/5"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        {children}
      </main>
    </div>
  );
}
