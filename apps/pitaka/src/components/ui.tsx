import { useEffect, useId, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { AlertTriangle, Info, X } from "lucide-react";
import { cn } from "../lib/cn";
import { formatPHP, formatPHPWhole, formatPct, toCentavos } from "../lib/money";
import { useStore } from "../state/store";
import type { Centavos } from "../types";

/* Layout ------------------------------------------------------------ */

export function Card({ className, children, id }: { className?: string; children: ReactNode; id?: string }) {
  return (
    <section id={id} className={cn("rounded-2xl border border-slate-700/60 bg-slate-800/70 p-4 sm:p-5 scroll-mt-20", className)}>
      {children}
    </section>
  );
}

export function CardTitle({ icon, children, action, sub }: { icon?: ReactNode; children: ReactNode; action?: ReactNode; sub?: ReactNode }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-100">
          {icon && <span className="text-emerald-400" aria-hidden>{icon}</span>}
          {children}
        </h2>
        {sub && <p className="mt-0.5 text-sm text-slate-400">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function PageTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-4">
      <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">{title}</h1>
      {sub && <p className="mt-1 text-sm text-slate-400">{sub}</p>}
    </div>
  );
}

/* Money ------------------------------------------------------------- */

/** Formats centavos as pesos; respects the "hide amounts" privacy toggle. */
export function Money({ c, whole, className, signed }: { c: Centavos | number; whole?: boolean; className?: string; signed?: boolean }) {
  const { state } = useStore();
  if (state.settings.hideAmounts) return <span className={cn("whitespace-nowrap tabular-nums", className)} aria-label="hidden amount">₱ ••••</span>;
  const v = Math.round(c);
  const text = (signed && v > 0 ? "+" : "") + (whole ? formatPHPWhole(v) : formatPHP(v));
  // Real minus sign (U+2212) so negatives never wrap away from the amount.
  return <span className={cn("whitespace-nowrap tabular-nums", className)}>{text.replace("-", "−")}</span>;
}

export const Pct = ({ r, className }: { r: number; className?: string }) => <span className={cn("tabular-nums", className)}>{formatPct(r)}</span>;

/* Stat tile --------------------------------------------------------- */

export function Stat({ label, value, hint, tone = "default", icon }: { label: string; value: ReactNode; hint?: ReactNode; tone?: "default" | "good" | "warn" | "bad"; icon?: ReactNode }) {
  const toneCls = { default: "text-white", good: "text-emerald-300", warn: "text-amber-300", bad: "text-rose-300" }[tone];
  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-800/70 p-4">
      <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
        {icon && <span aria-hidden className="text-slate-400">{icon}</span>}
        {label}
      </p>
      <p className={cn("mt-2 text-xl font-bold tabular-nums sm:text-2xl", toneCls)}>{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

/* Buttons ----------------------------------------------------------- */

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger"; size?: "sm" | "md" };

export function Button({ variant = "secondary", size = "md", className, ...rest }: BtnProps) {
  return (
    <button
      type="button"
      {...rest}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400",
        size === "md" ? "min-h-11 px-4 text-sm" : "min-h-9 px-3 text-xs",
        variant === "primary" && "bg-emerald-500 text-slate-950 hover:bg-emerald-400",
        variant === "secondary" && "border border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700",
        variant === "ghost" && "text-slate-300 hover:bg-slate-800 hover:text-white",
        variant === "danger" && "bg-rose-600 text-white hover:bg-rose-500",
        className,
      )}
    />
  );
}

/* Feedback ---------------------------------------------------------- */

export function Notice({ tone = "info", title, children, className }: { tone?: "info" | "warn" | "bad"; title?: string; children: ReactNode; className?: string }) {
  const Icon = tone === "info" ? Info : AlertTriangle;
  return (
    <div
      role={tone === "info" ? "note" : "alert"}
      className={cn(
        "flex gap-3 rounded-xl border p-3 text-sm",
        tone === "info" && "border-sky-800/60 bg-sky-950/40 text-sky-100",
        tone === "warn" && "border-amber-700/60 bg-amber-950/40 text-amber-100",
        tone === "bad" && "border-rose-700/60 bg-rose-950/40 text-rose-100",
        className,
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        <div className={cn(title && "mt-0.5", "opacity-90")}>{children}</div>
      </div>
    </div>
  );
}

export function Badge({ children, tone = "slate" }: { children: ReactNode; tone?: "slate" | "emerald" | "amber" | "rose" | "sky" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        tone === "slate" && "bg-slate-700 text-slate-200",
        tone === "emerald" && "bg-emerald-500/15 text-emerald-300",
        tone === "amber" && "bg-amber-500/15 text-amber-300",
        tone === "rose" && "bg-rose-500/15 text-rose-300",
        tone === "sky" && "bg-sky-500/15 text-sky-300",
      )}
    >
      {children}
    </span>
  );
}

export function Progress({ value, label, tone = "emerald" }: { value: number; label: string; tone?: "emerald" | "amber" | "rose" }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} className="h-2.5 w-full overflow-hidden rounded-full bg-slate-700">
      <div
        className={cn("h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none", tone === "emerald" && "bg-emerald-500", tone === "amber" && "bg-amber-400", tone === "rose" && "bg-rose-500")}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/* Form fields ------------------------------------------------------- */

const inputCls =
  "w-full min-h-11 rounded-xl border border-slate-600 bg-slate-900 px-3 text-base text-white placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 tabular-nums";

export function Field({ label, hint, children, htmlFor }: { label: string; hint?: ReactNode; children: ReactNode; htmlFor?: string }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-200">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

/** Peso input. Shows pesos, stores centavos. Commits on blur / Enter. */
export function MoneyInput({
  label,
  value,
  onChange,
  hint,
  nullable,
  placeholder,
}: {
  label: string;
  value: Centavos | null;
  onChange: (c: Centavos | null) => void;
  hint?: ReactNode;
  nullable?: boolean;
  placeholder?: string;
}) {
  const id = useId();
  const show = (v: Centavos | null) => (v === null ? "" : (v / 100).toLocaleString("en-PH", { maximumFractionDigits: 2 }));
  const [text, setText] = useState(show(value));
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => setText(show(value)), [value]);

  const commit = () => {
    if (text.trim() === "") {
      if (nullable) {
        onChange(null);
        setErr(null);
      } else setText(show(value));
      return;
    }
    const c = toCentavos(text);
    if (c === null || c < 0) {
      setErr("Enter an amount like 1,250.50");
      return;
    }
    setErr(null);
    onChange(c);
  };

  return (
    <Field label={label} htmlFor={id} hint={err ? <span className="text-rose-300">{err}</span> : hint}>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400" aria-hidden>
          ₱
        </span>
        <input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          className={cn(inputCls, "pl-7")}
          value={text}
          placeholder={placeholder ?? (nullable ? "Not set" : "0")}
          onChange={(e) => setText(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
          aria-invalid={!!err}
        />
      </div>
    </Field>
  );
}

/** Percent input. Shows "4.5", stores 0.045. */
export function PercentInput({
  label,
  value,
  onChange,
  hint,
  nullable,
  max = 100,
}: {
  label: string;
  value: number | null;
  onChange: (r: number | null) => void;
  hint?: ReactNode;
  nullable?: boolean;
  max?: number;
}) {
  const id = useId();
  const show = (v: number | null) => (v === null ? "" : String(+(v * 100).toFixed(4)));
  const [text, setText] = useState(show(value));
  useEffect(() => setText(show(value)), [value]);
  const commit = () => {
    if (text.trim() === "" && nullable) return onChange(null);
    const n = Number(text.replace(/[%\s]/g, ""));
    if (!Number.isFinite(n) || n < 0 || n > max) return setText(show(value));
    onChange(n / 100);
  };
  return (
    <Field label={label} htmlFor={id} hint={hint}>
      <div className="relative">
        <input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          className={cn(inputCls, "pr-8")}
          value={text}
          placeholder={nullable ? "Not set" : "0"}
          onChange={(e) => setText(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
        />
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400" aria-hidden>
          %
        </span>
      </div>
    </Field>
  );
}

export function TextInput({ label, value, onChange, hint, placeholder, type = "text", maxLength = 60 }: { label: string; value: string; onChange: (v: string) => void; hint?: ReactNode; placeholder?: string; type?: "text" | "date"; maxLength?: number }) {
  const id = useId();
  return (
    <Field label={label} htmlFor={id} hint={hint}>
      <input id={id} type={type} className={inputCls} value={value} placeholder={placeholder} maxLength={maxLength} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}

export function NumberInput({ label, value, onChange, min, max, hint }: { label: string; value: number | null; onChange: (n: number | null) => void; min?: number; max?: number; hint?: ReactNode }) {
  const id = useId();
  return (
    <Field label={label} htmlFor={id} hint={hint}>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        className={inputCls}
        value={value ?? ""}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
      />
    </Field>
  );
}

export function Select<T extends string>({ label, value, onChange, options, hint }: { label: string; value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; hint?: ReactNode }) {
  const id = useId();
  return (
    <Field label={label} htmlFor={id} hint={hint}>
      <select id={id} className={cn(inputCls, "appearance-none")} value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function Toggle({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: ReactNode }) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <label htmlFor={id} className="text-sm font-medium text-slate-200">
          {label}
        </label>
        {hint && <p className="text-xs text-slate-400">{hint}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400",
          checked ? "bg-emerald-500" : "bg-slate-600",
        )}
      >
        <span className={cn("inline-block size-5 rounded-full bg-white shadow transition-transform motion-reduce:transition-none", checked ? "translate-x-6" : "translate-x-1")} />
      </button>
    </div>
  );
}

export function Segmented<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-xl border border-slate-700 bg-slate-900 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "min-h-9 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-emerald-400",
            value === o.value ? "bg-emerald-500 text-slate-950" : "text-slate-300 hover:text-white",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* Modal (native <dialog>: focus trap + Esc built in) ------------------ */

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby={`${title}-t`}
      className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-2xl border border-slate-700 bg-slate-800 p-0 text-slate-100 backdrop:bg-slate-950/70 backdrop:backdrop-blur-sm"
    >
      <div className="flex items-center justify-between border-b border-slate-700 px-5 py-3">
        <h2 id={`${title}-t`} className="font-semibold">
          {title}
        </h2>
        <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-700 hover:text-white" aria-label="Close">
          <X className="size-4" />
        </button>
      </div>
      <div className="space-y-4 p-5">{open && children}</div>
    </dialog>
  );
}

export function EmptyHint({ children }: { children: ReactNode }) {
  return <p className="rounded-xl border border-dashed border-slate-700 p-4 text-center text-sm text-slate-400">{children}</p>;
}
