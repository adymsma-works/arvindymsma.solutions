// localStorage access for Pitaka. Only ENCRYPTED data is written here,
// plus a small non-sensitive lockout counter. All keys are namespaced.
import type { AppState } from "../types";
import { isVault, open, seal, type Vault, type VaultKey } from "./crypto";
import { parseState } from "./schema";

const KEYS = {
  vault: "pitaka.vault.v1",
  lockout: "pitaka.lockout.v1",
} as const;

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function write(key: string, value: string) {
  localStorage.setItem(key, value); // let quota/private-mode errors surface to the caller
}
function remove(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function storageAvailable(): boolean {
  try {
    const k = "pitaka.probe";
    localStorage.setItem(k, "1");
    localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

export function loadVault(): Vault | null {
  const raw = read(KEYS.vault);
  if (!raw) return null;
  try {
    const v = JSON.parse(raw);
    return isVault(v) ? v : null;
  } catch {
    return null;
  }
}

export const hasVault = () => loadVault() !== null;

// Once wiped, block any late save (e.g. a debounced save firing during reload).
let wiped = false;

export async function saveState(state: AppState, vk: VaultKey): Promise<void> {
  if (wiped) return;
  const vault = await seal({ ...state, updatedAt: new Date().toISOString() }, vk);
  write(KEYS.vault, JSON.stringify(vault));
}

export type UnlockResult = { ok: true; state: AppState; vk: VaultKey } | { ok: false; reason: "wrong-pin" | "corrupt"; error?: string };

/** Re-enable saving after a wipe (used when creating a new PIN). */
export const resetWipeFlag = () => {
  wiped = false;
};

export async function unlock(pin: string): Promise<UnlockResult> {
  const vault = loadVault();
  if (!vault) return { ok: false, reason: "corrupt", error: "No saved data" };
  try {
    const { data, vk } = await open(vault, pin);
    const parsed = parseState(data);
    if (!parsed.ok) return { ok: false, reason: "corrupt", error: parsed.error };
    return { ok: true, state: parsed.state, vk };
  } catch {
    return { ok: false, reason: "wrong-pin" };
  }
}

/* Wrong-PIN backoff: 1s, 2s, 4s … capped at 60s. Survives reloads. */
interface Lockout {
  fails: number;
  until: number; // epoch ms
}

export function getLockout(): Lockout {
  try {
    const l = JSON.parse(read(KEYS.lockout) ?? "") as Lockout;
    if (typeof l.fails === "number" && typeof l.until === "number") return l;
  } catch {
    /* fall through */
  }
  return { fails: 0, until: 0 };
}

export function registerFailure(now = Date.now()): Lockout {
  const fails = getLockout().fails + 1;
  const delay = Math.min(60, 2 ** (fails - 1)) * 1000;
  const l = { fails, until: now + delay };
  try {
    write(KEYS.lockout, JSON.stringify(l));
  } catch {
    /* ignore */
  }
  return l;
}

export const clearLockout = () => remove(KEYS.lockout);

/** Delete everything Pitaka stored in this browser. */
export function wipeAll() {
  wiped = true;
  remove(KEYS.vault);
  remove(KEYS.lockout);
}

/* Backups */
export function downloadJSON(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function readJSONFile(file: File): Promise<unknown> {
  if (file.size > 5_000_000) throw new Error("File is too large to be a Pitaka backup.");
  return JSON.parse(await file.text());
}
