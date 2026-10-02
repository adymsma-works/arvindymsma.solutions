import { useRef, useState } from "react";
import { FileUp, KeyRound } from "lucide-react";
import type { AppState } from "../types";
import { isVault, open } from "../lib/crypto";
import { parseState } from "../lib/schema";
import { readJSONFile } from "../lib/storage";
import { emergencyBuffer, totalDebt } from "../lib/finance";
import { useStore } from "../state/store";
import { Button, Money, Notice } from "./ui";

/** Import a backup or the private preset: validate, preview, then confirm. */
export default function ImportPanel({ cta = "Import a backup or preset", onDone }: { cta?: string; onDone?: () => void }) {
  const { state, replace, today } = useStore();
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<AppState | null>(null);
  const [locked, setLocked] = useState<unknown>(null);
  const [filePin, setFilePin] = useState("");
  const [busy, setBusy] = useState(false);

  const accept = (raw: unknown) => {
    const r = parseState(raw);
    if (!r.ok) return setError(`This file isn't valid Pitaka data (${r.error}).`);
    setPending(r.state);
  };

  const onFile = async (file: File | undefined) => {
    setError(null);
    setPending(null);
    setLocked(null);
    if (!file) return;
    try {
      const raw = await readJSONFile(file);
      if (isVault(raw)) setLocked(raw);
      else accept(raw);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't read that file.");
    } finally {
      if (input.current) input.current.value = "";
    }
  };

  const unlockFile = async () => {
    if (!isVault(locked)) return;
    setBusy(true);
    try {
      const { data } = await open(locked, filePin);
      setLocked(null);
      setFilePin("");
      accept(data);
    } catch {
      setError("That PIN doesn't open this backup.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <input ref={input} type="file" accept="application/json,.json" className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => onFile(e.target.files?.[0])} />
      {!pending && !locked && (
        <Button variant="primary" onClick={() => input.current?.click()}>
          <FileUp className="size-4" aria-hidden /> {cta}
        </Button>
      )}

      {locked !== null && (
        <div className="space-y-2 rounded-xl border border-slate-700 p-3">
          <p className="flex items-center gap-2 text-sm text-slate-200">
            <KeyRound className="size-4 text-emerald-400" aria-hidden /> This backup is encrypted. Enter the PIN it was saved with.
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              inputMode="numeric"
              autoComplete="off"
              aria-label="Backup PIN"
              className="min-h-11 flex-1 rounded-xl border border-slate-600 bg-slate-900 px-3 text-white"
              value={filePin}
              onChange={(e) => setFilePin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              onKeyDown={(e) => e.key === "Enter" && unlockFile()}
            />
            <Button variant="primary" onClick={unlockFile} disabled={busy || filePin.length < 4}>
              {busy ? "Opening…" : "Open"}
            </Button>
            <Button variant="ghost" onClick={() => setLocked(null)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {pending && (
        <div className="space-y-3 rounded-xl border border-emerald-700/50 bg-emerald-950/20 p-3">
          <p className="text-sm font-semibold text-emerald-200">Ready to import. This replaces what's in Pitaka now:</p>
          <dl className="grid grid-cols-[auto_1fr_1fr] gap-x-4 gap-y-1 text-sm">
            <dt className="text-slate-400" />
            <dd className="text-xs uppercase tracking-wide text-slate-400">Now</dd>
            <dd className="text-xs uppercase tracking-wide text-slate-400">After import</dd>
            <Row label="Name" a={state.profile.name || "—"} b={pending.profile.name || "—"} />
            <Row label="Salary" a={<Money c={state.income.monthlySalary} />} b={<Money c={pending.income.monthlySalary} />} />
            <Row label="Debts" a={`${state.debts.length} · `} a2={<Money c={totalDebt(state, today)} whole />} b={`${pending.debts.length} · `} b2={<Money c={totalDebt(pending, today)} whole />} />
            <Row label="Emergency fund" a={<Money c={emergencyBuffer(state)} whole />} b={<Money c={emergencyBuffer(pending)} whole />} />
            <Row label="Payments logged" a={state.payments.length} b={pending.payments.length} />
          </dl>
          <div className="flex gap-2">
            <Button
              variant="primary"
              onClick={() => {
                replace({ ...pending, updatedAt: new Date().toISOString() });
                setPending(null);
                onDone?.();
              }}
            >
              Replace my data
            </Button>
            <Button variant="ghost" onClick={() => setPending(null)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {error && <Notice tone="bad">{error}</Notice>}
    </div>
  );
}

function Row({ label, a, b, a2, b2 }: { label: string; a: React.ReactNode; b: React.ReactNode; a2?: React.ReactNode; b2?: React.ReactNode }) {
  return (
    <>
      <dt className="text-slate-400">{label}</dt>
      <dd className="tabular-nums text-slate-300">
        {a}
        {a2}
      </dd>
      <dd className="tabular-nums font-medium text-white">
        {b}
        {b2}
      </dd>
    </>
  );
}
