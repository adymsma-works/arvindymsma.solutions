import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { AppState } from "../types";
import type { VaultKey } from "../lib/crypto";
import { newVaultKey, seal, type Vault } from "../lib/crypto";
import { saveState } from "../lib/storage";
import { todayManila } from "../lib/dates";

interface Store {
  state: AppState;
  today: string;
  /** Immutable update: return the next state. Saved (encrypted) automatically. */
  update: (fn: (s: AppState) => AppState) => void;
  replace: (s: AppState) => void;
  lock: () => void;
  changePin: (pin: string) => Promise<void>;
  saveError: string | null;
  pinLength: number;
  /** Encrypted copy of the current data (opens with the current PIN). */
  exportVault: () => Promise<Vault>;
}

const Ctx = createContext<Store | null>(null);

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore must be used inside <StoreProvider>");
  return s;
}

export function StoreProvider({
  initial,
  vaultKey,
  onLock,
  children,
}: {
  initial: AppState;
  vaultKey: VaultKey;
  onLock: () => void;
  children: ReactNode;
}) {
  const [state, setState] = useState(initial);
  const [today, setToday] = useState(() => todayManila());
  const [saveError, setSaveError] = useState<string | null>(null);
  const vk = useRef(vaultKey);
  const [pinLength, setPinLength] = useState(vaultKey.pinLength);
  const first = useRef(true);
  const stateRef = useRef(state);
  stateRef.current = state;
  const dirty = useRef(false);

  const flush = useCallback(async () => {
    if (!dirty.current) return;
    await saveState(stateRef.current, vk.current);
    dirty.current = false;
  }, []);

  // Keep "today" current (Manila time) if the app stays open past midnight.
  useEffect(() => {
    const id = setInterval(() => setToday(todayManila()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Encrypt + save shortly after every change.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    dirty.current = true;
    const t = setTimeout(() => {
      flush()
        .then(() => setSaveError(null))
        .catch((e: unknown) => setSaveError(e instanceof Error ? e.message : "Could not save"));
    }, 250);
    return () => clearTimeout(t);
  }, [state, flush]);

  // Save right away when the tab is hidden (phone switches apps, tab closes).
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden") void flush();
    };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, [flush]);

  const lock = useCallback(() => {
    flush().finally(onLock);
  }, [flush, onLock]);

  const update = useCallback((fn: (s: AppState) => AppState) => setState((s) => fn(s)), []);
  const replace = useCallback((s: AppState) => setState(s), []);

  const changePin = useCallback(
    async (pin: string) => {
      const next = await newVaultKey(pin);
      await saveState(stateRef.current, next);
      vk.current = next;
      dirty.current = false;
      setPinLength(next.pinLength);
    },
    [],
  );

  const exportVault = useCallback(() => seal(stateRef.current, vk.current), []);

  const value = useMemo<Store>(
    () => ({ state, today, update, replace, lock, changePin, saveError, pinLength, exportVault }),
    [state, today, update, replace, lock, changePin, saveError, pinLength, exportVault],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
