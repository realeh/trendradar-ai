"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  BarChart3,
  CreditCard,
  Gem,
  LayoutDashboard,
  LogIn,
  Menu,
  Radar,
  Search,
  Sparkles,
  Store,
  Wand2,
  X
} from "lucide-react";
import { clsx } from "clsx";
import { ThemeToggle } from "./theme-toggle";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import { hasActiveAccess } from "@/lib/stripe-plans";

// Founder-only tools (/admin/curate, /admin/analytics) are deliberately left
// off this customer-facing nav — they're gated by ADMIN_SECRET, not by
// subscription, and there's no reason to advertise them to paying customers.
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

type Gate = "public" | "auth" | "subscription";

export function AppShell({ children, gate = "subscription" }: { children: React.ReactNode; gate?: Gate }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [checking, setChecking] = useState(gate !== "public");
  const [allowed, setAllowed] = useState(gate === "public");
  const [planInfo, setPlanInfo] = useState<{ plan: string | null; status: string | null } | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Access gate: below "public", every protected page requires a logged-in
  // session, and "subscription" pages additionally require an active/trialing
  // plan on the user's profile. This runs client-side (the app is already a
  // client-component-heavy codebase), so middleware.ts is a defense-in-depth
  // login check ahead of this, not a replacement for it.
  useEffect(() => {
    let cancelled = false;

    if (gate !== "public") {
      setChecking(true);
      setAllowed(false);
    }

    (async () => {
      const supabase = createBrowserSupabaseClient();
      if (!supabase) {
        // Supabase isn't configured (local/demo mode) — fail open rather
        // than lock the whole app out with no way to log in at all.
        if (!cancelled) {
          setAllowed(true);
          setChecking(false);
        }
        return;
      }

      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!cancelled) setLoggedIn(Boolean(session));

      if (gate === "public") return;

      if (!session) {
        router.replace(`/login?next=${encodeURIComponent(pathname)}`);
        return;
      }

      if (gate === "auth") {
        if (!cancelled) {
          setAllowed(true);
          setChecking(false);
        }
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("plan, subscription_status")
        .eq("id", session.user.id)
        .maybeSingle();

      if (!hasActiveAccess(profile?.subscription_status)) {
        router.replace("/pricing?upgrade=required");
        return;
      }

      if (!cancelled) {
        setPlanInfo({ plan: profile?.plan ?? null, status: profile?.subscription_status ?? null });
        setAllowed(true);
        setChecking(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [gate, pathname, router]);

  if (checking) {
    return (
      <div className="grid min-h-screen place-items-center bg-paper text-ink dark:bg-night dark:text-paper">
        <div className="flex items-center gap-3 text-sm font-bold text-ink/55 dark:text-paper/55">
          <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Checking your account...
        </div>
      </div>
    );
  }

  if (!allowed) return null;

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
            {planInfo?.plan ? `${capitalize(planInfo.plan)} plan` : "Account"}
          </div>
          <p className="mt-2 text-sm leading-5 text-ink/65 dark:text-paper/65">
            {planInfo?.status
              ? `Subscription status: ${capitalize(planInfo.status)}.`
              : "Forecasts and launch scoring run on your curated catalog."}
          </p>
          <Link
            href="/account"
            className="mt-3 inline-block text-xs font-black text-tide underline dark:text-cyan-200"
          >
            Manage billing
          </Link>
        </div>
      </aside>

      {menuOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm dark:bg-black/60"
          />
          <div className="absolute inset-y-0 left-0 w-[82%] max-w-xs animate-fade-up overflow-y-auto border-r border-black/10 bg-[#fbfaf6] px-4 py-5 shadow-lift dark:border-white/10 dark:bg-[#0d0f12]">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3" onClick={() => setMenuOpen(false)}>
                <span className="grid size-10 place-items-center rounded-md bg-ink text-paper shadow-panel dark:bg-paper dark:text-ink">
                  <Radar size={21} />
                </span>
                <span>
                  <span className="block font-display text-xl leading-none">TrendRadar AI</span>
                  <span className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-ink/48 dark:text-paper/48">Commerce OS</span>
                </span>
              </Link>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
                className="grid size-9 place-items-center rounded-md border border-black/10 dark:border-white/10"
              >
                <X size={18} />
              </button>
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
                      "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-bold transition",
                      active
                        ? "bg-ink text-paper shadow-panel dark:bg-paper dark:text-ink"
                        : "text-ink/70 hover:bg-black/[0.045] dark:text-paper/70 dark:hover:bg-white/[0.065]"
                    )}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      <main className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-black/10 bg-[#fbfaf6]/78 backdrop-blur-2xl dark:border-white/10 dark:bg-[#0d0f12]/78">
          <div className="flex min-h-[4.25rem] items-center justify-between gap-3 px-4 sm:px-7">
            <div className="flex items-center gap-2 lg:hidden">
              <button
                type="button"
                aria-label="Open menu"
                onClick={() => setMenuOpen(true)}
                className="grid size-10 place-items-center rounded-md border border-black/10 bg-white/55 text-ink transition hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/[0.055] dark:text-paper dark:hover:bg-white/10"
              >
                <Menu size={18} />
              </button>
              <Link href="/" className="flex items-center gap-2 font-display text-xl">
                <Radar size={22} />
                TrendRadar AI
              </Link>
            </div>
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
                href={loggedIn ? "/account" : "/login"}
                className="rounded-md bg-ink px-4 py-2 text-sm font-black text-paper shadow-panel transition hover:-translate-y-0.5 hover:bg-ink/88 dark:bg-paper dark:text-ink dark:hover:bg-paper/88"
              >
                {loggedIn ? "Account" : "Login"}
              </Link>
            </div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
