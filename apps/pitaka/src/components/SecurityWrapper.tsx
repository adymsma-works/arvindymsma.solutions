import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Delete, Loader2, Lock, ShieldCheck, Wallet } from "lucide-react";
import type { AppState } from "../types";
import { isValidPin, newVaultKey, type VaultKey } from "../lib/crypto";
import { emptyState } from "../lib/defaults";
import { clearLockout, getLockout, loadVault, registerFailure, resetWipeFlag, saveState, storageAvailable, unlock, wipeAll } from "../lib/storage";
import { StoreProvider, useStore } from "../state/store";
import { cn } from "../lib/cn";
import { Button, Notice } from "./ui";

type Phase =
  | { kind: "checking" }
  | { kind: "unsupported"; reason: string }
  | { kind: "setup" }
  | { kind: "locked" }
  | { kind: "unlocked"; state: AppState; vk: VaultKey };

/**
 * Nothing financial renders until the PIN is entered. The decrypted state and
 * key live only in memory and are dropped on lock.
 */
export default function SecurityWrapper({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<Phase>({ kind: "checking" });

  useEffect(() => {
    if (!globalThis.crypto?.subtle) return setPhase({ kind: "unsupported", reason: "This browser can't encrypt data here. Open Pitaka over https (the GitHub Pages link), not a file or http address." });
    if (!storageAvailable()) return setPhase({ kind: "unsupported", reason: "This browser is blocking local storage (private mode or site data turned off), so Pitaka can't keep your data." });
    setPhase(loadVault() ? { kind: "locked" } : { kind: "setup" });
  }, []);

  const lock = useCallback(() => setPhase({ kind: "locked" }), []);

  switch (phase.kind) {
    case "checking":
      return <Splash />;
    case "unsupported":
      return (
        <Shell>
          <Notice tone="bad" title="Pitaka can't run in this browser">
            {phase.reason}
          </Notice>
        </Shell>
      );
    case "setup":
      return <SetupPin onDone={(state, vk) => setPhase({ kind: "unlocked", state, vk })} />;
    case "locked":
      return <UnlockPin onUnlock={(state, vk) => setPhase({ kind: "unlocked", state, vk })} onWiped={() => setPhase({ kind: "setup" })} />;
    case "unlocked":
      return (
        <StoreProvider initial={phase.state} vaultKey={phase.vk} onLock={lock}>
          <AutoLock />
          {children}
        </StoreProvider>
      );
  }
}

/* Auto-lock on inactivity, and after the tab is hidden for a minute ---- */

function AutoLock() {
  const { state, lock } = useStore();
  const minutes = state.settings.autoLockMinutes;
  const last = useRef(Date.now());
  const hiddenAt = useRef<number | null>(null);

  useEffect(() => {
    const bump = () => (last.current = Date.now());
    const events = ["pointerdown", "keydown", "wheel", "touchstart"] as const;
    events.forEach((e) => window.addEventListener(e, bump, { passive: true }));
    const timer = setInterval(() => {
      if (Date.now() - last.current > minutes * 60_000) lock();
    }, 10_000);
    const onVis = () => {
      if (document.visibilityState === "hidden") hiddenAt.current = Date.now();
      else if (hiddenAt.current && Date.now() - hiddenAt.current > 60_000) lock();
      else hiddenAt.current = null;
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      events.forEach((e) => window.removeEventListener(e, bump));
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [minutes, lock]);

  return null;
}

/* Screens ------------------------------------------------------------- */

function Shell({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 grid size-14 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-400">
            <Wallet className="size-7" aria-hidden />
          </div>
          <p className="text-2xl font-bold tracking-tight text-white">Pitaka</p>
          <p className="text-sm text-slate-400">Kinsenas to katapusan, all in your browser.</p>
        </div>
        {children}
      </div>
    </main>
  );
}

function Splash() {
  return (
    <Shell>
      <p className="flex items-center justify-center gap-2 text-sm text-slate-400">
        <Loader2 className="size-4 animate-spin" aria-hidden /> Loading…
      </p>
    </Shell>
  );
}

function PinDots({ length, filled, error }: { length: number; filled: number; error?: boolean }) {
  return (
    <div className={cn("flex justify-center gap-3", error && "motion-safe:animate-[shake_.3s]")} aria-hidden>
      {Array.from({ length }, (_, i) => (
        <span key={i} className={cn("size-3.5 rounded-full border-2", i < filled ? "border-emerald-400 bg-emerald-400" : "border-slate-500", error && "border-rose-400 bg-rose-400/0")} />
      ))}
    </div>
  );
}

/** On-screen keypad that also accepts the physical keyboard. */
function Keypad({ value, onChange, max, disabled, onSubmit }: { value: string; onChange: (v: string) => void; max: number; disabled?: boolean; onSubmit?: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (disabled) return;
      if (/^\d$/.test(e.key) && value.length < max) onChange(value + e.key);
      else if (e.key === "Backspace") onChange(value.slice(0, -1));
      else if (e.key === "Enter") onSubmit?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [value, onChange, max, disabled, onSubmit]);

  const key = (label: ReactNode, onClick: () => void, aria?: string) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={aria}
      className="grid h-16 w-full place-items-center rounded-2xl bg-slate-800 text-2xl font-semibold text-white transition-colors hover:bg-slate-700 active:bg-slate-600 disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-emerald-400"
    >
      {label}
    </button>
  );
  return (
    <div className="mt-8 grid grid-cols-3 gap-3">
      {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
        <div key={d}>{key(d, () => value.length < max && onChange(value + d), `Digit ${d}`)}</div>
      ))}
      <div />
      {key("0", () => value.length < max && onChange(value + "0"), "Digit 0")}
      {key(<Delete className="size-6" aria-hidden />, () => onChange(value.slice(0, -1)), "Delete digit")}
    </div>
  );
}

function SetupPin({ onDone }: { onDone: (s: AppState, vk: VaultKey) => void }) {
  const [length, setLength] = useState<4 | 6>(6);
  const [pin, setPin] = useState("");
  const [first, setFirst] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handle = useCallback(
    async (value: string) => {
      setPin(value);
      setError(null);
      if (value.length < length) return;
      if (first === null) {
        setFirst(value);
        setPin("");
        return;
      }
      if (value !== first) {
        setError("PINs didn't match. Start again.");
        setFirst(null);
        setPin("");
        return;
      }
      if (!isValidPin(value)) return;
      setBusy(true);
      try {
        const vk = await newVaultKey(value);
        const state = emptyState();
        resetWipeFlag();
        await saveState(state, vk);
        clearLockout();
        onDone(state, vk);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not create the vault");
        setBusy(false);
      }
    },
    [first, length, onDone],
  );

  return (
    <Shell>
      <h1 className="text-center text-lg font-semibold text-white">{first === null ? "Create your PIN" : "Confirm your PIN"}</h1>
      <p className="mt-1 mb-6 text-center text-sm text-slate-400">
        Your data is encrypted with this PIN and stays on this device. There's no "forgot PIN" recovery.
      </p>
      <PinDots length={length} filled={pin.length} error={!!error} />
      <p className="mt-3 min-h-5 text-center text-sm text-rose-300" role="status">
        {busy ? "Securing your vault…" : error}
      </p>
      <Keypad value={pin} onChange={handle} max={length} disabled={busy} />
      {first === null && (
        <div className="mt-6 text-center">
          <button
            type="button"
            className="text-sm text-slate-400 underline underline-offset-4 hover:text-white"
            onClick={() => {
              setLength(length === 6 ? 4 : 6);
              setPin("");
            }}
          >
            {length === 6 ? "Use a 4-digit PIN instead (weaker)" : "Use a 6-digit PIN (recommended)"}
          </button>
          {length === 4 && <p className="mt-2 text-xs text-amber-300">A 4-digit PIN has only 10,000 combinations.</p>}
        </div>
      )}
    </Shell>
  );
}

function UnlockPin({ onUnlock, onWiped }: { onUnlock: (s: AppState, vk: VaultKey) => void; onWiped: () => void }) {
  const length = loadVault()?.pinLength ?? 6;
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wait, setWait] = useState(0);
  const [forgot, setForgot] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  // Countdown for the wrong-PIN delay.
  useEffect(() => {
    const tick = () => setWait(Math.max(0, Math.ceil((getLockout().until - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, []);

  const attempt = useCallback(
    async (value: string) => {
      setPin(value);
      setError(null);
      if (value.length < length || busy) return;
      if (getLockout().until > Date.now()) return;
      setBusy(true);
      const res = await unlock(value);
      setBusy(false);
      if (res.ok) {
        clearLockout();
        onUnlock(res.state, res.vk);
        return;
      }
      setPin("");
      if (res.reason === "wrong-pin") {
        const l = registerFailure();
        setError(`Wrong PIN (${l.fails} ${l.fails === 1 ? "try" : "tries"}).`);
      } else setError(`Saved data couldn't be read: ${res.error ?? "unknown error"}. Restore a backup after wiping.`);
    },
    [length, busy, onUnlock],
  );

  if (forgot)
    return (
      <Shell>
        <h1 className="text-lg font-semibold text-white">Forgot your PIN?</h1>
        <p className="mt-2 text-sm text-slate-300">
          Pitaka can't recover it, and nobody else can either: the data is encrypted with your PIN. The only option is to
          <strong> wipe this device's Pitaka data</strong> and start again, then import a backup if you have one.
        </p>
        <label className="mt-5 block text-sm text-slate-300" htmlFor="wipe-confirm">
          Type <span className="font-mono font-semibold text-white">WIPE</span> to confirm
        </label>
        <input
          id="wipe-confirm"
          className="mt-2 min-h-11 w-full rounded-xl border border-slate-600 bg-slate-900 px-3 text-white"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          autoComplete="off"
        />
        <div className="mt-4 flex gap-3">
          <Button variant="secondary" onClick={() => setForgot(false)} className="flex-1">
            Cancel
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            disabled={confirmText !== "WIPE"}
            onClick={() => {
              wipeAll();
              onWiped();
            }}
          >
            Wipe and start over
          </Button>
        </div>
      </Shell>
    );

  return (
    <Shell>
      <h1 className="flex items-center justify-center gap-2 text-center text-lg font-semibold text-white">
        <Lock className="size-4 text-emerald-400" aria-hidden /> Enter your PIN
      </h1>
      <div className="mt-6">
        <PinDots length={length} filled={pin.length} error={!!error} />
      </div>
      <p className="mt-3 min-h-5 text-center text-sm text-rose-300" role="status" aria-live="polite">
        {busy ? <span className="text-slate-400">Unlocking…</span> : wait > 0 ? `${error ?? ""} Try again in ${wait}s.` : error}
      </p>
      <Keypad value={pin} onChange={attempt} max={length} disabled={busy || wait > 0} />
      <div className="mt-6 flex flex-col items-center gap-2 text-center">
        <button type="button" className="text-sm text-slate-400 underline underline-offset-4 hover:text-white" onClick={() => setForgot(true)}>
          Forgot PIN?
        </button>
        <p className="flex items-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck className="size-3.5" aria-hidden /> Encrypted on this device. Nothing is sent anywhere.
        </p>
      </div>
    </Shell>
  );
}
