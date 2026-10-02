import { lazy, Suspense, useEffect, useState } from "react";
import { Eye, EyeOff, Landmark, LayoutDashboard, Lock, Settings as SettingsIcon, TrendingUp, Wallet } from "lucide-react";
import SecurityWrapper from "./components/SecurityWrapper";
// Loaded only after unlocking, so the lock screen stays small and fast.
const Dashboard = lazy(() => import("./features/Dashboard"));
const DebtTracker = lazy(() => import("./features/DebtTracker"));
const Investments = lazy(() => import("./features/Investments"));
const Settings = lazy(() => import("./features/Settings"));
import { useStore } from "./state/store";
import { cn } from "./lib/cn";
import type { Tab } from "./lib/checklist";

const TABS: { id: Tab; label: string; icon: typeof Wallet }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "debts", label: "Debts", icon: Landmark },
  { id: "invest", label: "Invest", icon: TrendingUp },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

const fromHash = (): { tab: Tab; anchor?: string } => {
  const [tab, anchor] = window.location.hash.slice(1).split("/");
  return TABS.some((t) => t.id === tab) ? { tab: tab as Tab, anchor } : { tab: "dashboard" };
};

function Shell() {
  const { state, update, lock, saveError } = useStore();
  const [{ tab, anchor }, setRoute] = useState(fromHash);

  useEffect(() => {
    const onHash = () => setRoute(fromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    if (anchor) document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth", block: "start" });
    else window.scrollTo({ top: 0 });
    document.getElementById("main")?.focus({ preventScroll: true });
  }, [tab, anchor]);

  const hidden = state.settings.hideAmounts;
  const toggleHidden = () => update((s) => ({ ...s, settings: { ...s.settings, hideAmounts: !s.settings.hideAmounts } }));

  return (
    <div className="min-h-dvh pb-24 md:pb-10">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-emerald-500 focus:px-3 focus:py-2 focus:text-slate-950">
        Skip to content
      </a>
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
          <a href="#dashboard" className="flex items-center gap-2 font-bold tracking-tight text-white">
            <span className="grid size-8 place-items-center rounded-lg bg-emerald-500/15 text-emerald-400">
              <Wallet className="size-4" aria-hidden />
            </span>
            Pitaka
          </a>
          <nav aria-label="Sections" className="ml-6 hidden gap-1 md:flex">
            {TABS.map((t) => (
              <a
                key={t.id}
                href={`#${t.id}`}
                aria-current={tab === t.id ? "page" : undefined}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  tab === t.id ? "bg-slate-800 text-emerald-300" : "text-slate-400 hover:bg-slate-800/60 hover:text-white",
                )}
              >
                {t.label}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={toggleHidden}
              aria-pressed={hidden}
              className="grid size-11 place-items-center rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white focus-visible:outline-2 focus-visible:outline-emerald-400"
              aria-label={hidden ? "Show amounts" : "Hide amounts"}
              title={hidden ? "Show amounts" : "Hide amounts"}
            >
              {hidden ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
            <button
              type="button"
              onClick={lock}
              className="flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white focus-visible:outline-2 focus-visible:outline-emerald-400"
            >
              <Lock className="size-4" aria-hidden /> Lock
            </button>
          </div>
        </div>
      </header>

      {saveError && (
        <p role="alert" className="bg-rose-900/60 px-4 py-2 text-center text-sm text-rose-100">
          Couldn't save: {saveError}. Export a backup from Settings.
        </p>
      )}

      <main id="main" tabIndex={-1} className="mx-auto max-w-5xl px-4 py-5 outline-none">
        <Suspense fallback={<p className="py-10 text-center text-sm text-slate-400">Loading…</p>}>
          {tab === "dashboard" && <Dashboard />}
          {tab === "debts" && <DebtTracker />}
          {tab === "invest" && <Investments />}
          {tab === "settings" && <Settings />}
        </Suspense>
        <footer className="mt-10 border-t border-slate-800 pt-4 text-xs leading-relaxed text-slate-400">
          Not financial advice. Rates are editable assumptions; verify with Maya, Pag-IBIG, your coop and the PSE. Your data is
          encrypted and stays in this browser.
        </footer>
      </main>

      <nav aria-label="Sections" className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-800 bg-slate-900/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        <ul className="mx-auto grid max-w-md grid-cols-4">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <li key={t.id}>
                <a
                  href={`#${t.id}`}
                  aria-current={active ? "page" : undefined}
                  className={cn("flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-medium", active ? "text-emerald-400" : "text-slate-400")}
                >
                  <Icon className="size-5" aria-hidden />
                  {t.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <SecurityWrapper>
      <Shell />
    </SecurityWrapper>
  );
}
