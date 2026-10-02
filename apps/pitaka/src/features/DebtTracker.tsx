import { useMemo, useState, type ReactNode } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CalendarCheck, FlaskConical, History, Landmark, Plus, Trophy, Undo2 } from "lucide-react";
import type { Debt, Strategy } from "../types";
import { useStore } from "../state/store";
import {
  applySettlement,
  debtBalance,
  debtProgress,
  dti,
  emergencyBuffer,
  monthlySurplus,
  netWorth,
  orderDebts,
  paidSoFar,
  projectPayoff,
  runwayMonths,
  totalDebt,
  totalPayable,
} from "../lib/finance";
import { fmtDate, fmtMonthYear, relativeDays, todayManila } from "../lib/dates";
import { formatPHPWhole, formatPct, toCentavos } from "../lib/money";
import { uid } from "../lib/defaults";
import { go } from "../lib/nav";
import { cn } from "../lib/cn";
import { Badge, Button, Card, CardTitle, EmptyHint, Field, Modal, Money, Notice, PageTitle, Progress, Segmented, Toggle } from "../components/ui";

const CHART = { line: "#059669", grid: "#334155", axis: "#94a3b8" };

const STRATEGIES: { value: Strategy; label: string }[] = [
  { value: "custom", label: "My priority" },
  { value: "snowball", label: "Snowball" },
  { value: "avalanche", label: "Avalanche" },
];

const STRATEGY_HELP: Record<Strategy, string> = {
  custom: "Your own order (Settings → Debts → priority). Mom's debt is first by default.",
  snowball: "Smallest balance first — quick wins keep you motivated.",
  avalanche: "Most expensive interest first — saves the most money.",
};

export default function DebtTracker() {
  const { state, update, today } = useStore();
  const [paying, setPaying] = useState<Debt | null>(null);

  const progress = debtProgress(state, today);
  const surplus = monthlySurplus(state, today);
  const suggested = Math.max(0, surplus ?? 0);
  const extra = state.settings.extraPerMonth ?? suggested;
  const strategy = state.settings.strategy;
  const projection = useMemo(() => projectPayoff(state, today, strategy, extra), [state, today, strategy, extra]);

  if (state.debts.length === 0)
    return (
      <>
        <PageTitle title="Debts" />
        <EmptyHint>
          No debts yet.{" "}
          <button type="button" className="underline underline-offset-4" onClick={() => go("settings", "debts")}>
            Add them in Settings
          </button>
          .
        </EmptyHint>
      </>
    );

  const setSettings = (patch: Partial<typeof state.settings>) => update((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  const ordered = orderDebts(state, today, strategy);

  return (
    <>
      <PageTitle title="Debt eradication center" sub="Track every peso you pay down, and see when you'll be debt-free." />

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardTitle icon={<Trophy className="size-4" />}>Road to debt freedom</CardTitle>
          <p className="text-3xl font-bold tabular-nums text-white">{Math.round(progress.ratio * 100)}%</p>
          <p className="mb-3 text-sm text-slate-400">
            paid of <Money c={progress.original} whole />
          </p>
          <Progress value={progress.ratio} label="Share of all debt paid" />
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-slate-400">Still owed</dt>
              <dd className="text-lg font-semibold tabular-nums text-white">
                <Money c={progress.remaining} whole />
              </dd>
            </div>
            <div>
              <dt className="text-slate-400">Debt-free (estimate)</dt>
              <dd className="text-lg font-semibold text-white">{projection.debtFreeMonth ? fmtMonthYear(projection.debtFreeMonth) : "—"}</dd>
            </div>
          </dl>
          {!projection.debtFreeMonth && progress.remaining > 0 && (
            <p className="mt-2 text-xs text-amber-300">Some debts have no payment schedule. Add an extra monthly amount below to see a date.</p>
          )}
        </Card>

        <Card className="lg:col-span-3">
          <CardTitle icon={<CalendarCheck className="size-4" />} sub={STRATEGY_HELP[strategy]}>
            Payoff plan
          </CardTitle>
          <Segmented label="Payoff strategy" value={strategy} onChange={(v) => setSettings({ strategy: v })} options={STRATEGIES} />
          <div className="mt-5">
            <div className="flex items-baseline justify-between">
              <label htmlFor="extra" className="text-sm font-medium text-slate-200">
                Extra toward debts each month
              </label>
              <span className="text-lg font-semibold tabular-nums text-white">
                <Money c={extra} whole />
              </span>
            </div>
            <input
              id="extra"
              type="range"
              min={0}
              max={1_000_000}
              step={25_000}
              value={Math.min(extra, 1_000_000)}
              onChange={(e) => setSettings({ extraPerMonth: Number(e.target.value) })}
              className="mt-2 w-full accent-emerald-500"
            />
            <p className="mt-1 text-xs text-slate-400">
              On top of scheduled payments.{" "}
              {surplus !== null ? (
                <>
                  Your estimated monthly leftover is <Money c={surplus} whole />.{" "}
                  {state.settings.extraPerMonth !== null && (
                    <button type="button" className="underline underline-offset-2" onClick={() => setSettings({ extraPerMonth: null })}>
                      Use it
                    </button>
                  )}
                </>
              ) : (
                "Set support and essentials in Settings to get a suggested amount."
              )}
            </p>
          </div>
          <div className="mt-4 h-48" aria-hidden>
            <DebtChart points={projection.points} />
          </div>
          <details className="mt-2 text-sm">
            <summary className="cursor-pointer text-slate-400 hover:text-white">Show as a table</summary>
            <table className="mt-2 w-full text-left text-sm tabular-nums">
              <thead className="text-xs text-slate-400">
                <tr>
                  <th className="py-1 font-medium">Month</th>
                  <th className="py-1 text-right font-medium">Total owed</th>
                </tr>
              </thead>
              <tbody>
                {projection.points.slice(0, 37).map((p) => (
                  <tr key={p.month} className="border-t border-slate-800">
                    <td className="py-1">{fmtMonthYear(p.month)}</td>
                    <td className="py-1 text-right">
                      <Money c={p.total} whole />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </Card>
      </div>

      <h2 className="mt-6 mb-3 flex items-center gap-2 text-base font-semibold text-white">
        <Landmark className="size-4 text-emerald-400" aria-hidden /> Your debts, in payoff order
      </h2>
      <div className="grid gap-3 md:grid-cols-2">
        {ordered.map((d, i) => (
          <DebtCard key={d.id} debt={d} order={i + 1} payoff={projection.payoffMonth[d.id] ?? null} onPay={() => setPaying(d)} />
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <WhatIf />
        <PaymentLog />
      </div>

      <Modal open={paying !== null} onClose={() => setPaying(null)} title={paying ? `Record payment: ${paying.name}` : "Record payment"}>
        {paying && <PaymentForm debt={paying} onDone={() => setPaying(null)} />}
      </Modal>
    </>
  );
}

function DebtChart({ points }: { points: { month: string; total: number }[] }) {
  const data = points.slice(0, 61).map((p) => ({ label: fmtMonthYear(p.month), total: p.total / 100 }));
  const { state } = useStore();
  if (state.settings.hideAmounts) return <div className="grid h-full place-items-center text-sm text-slate-400">Amounts hidden</div>;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid vertical={false} stroke={CHART.grid} strokeDasharray="3 3" />
        <XAxis dataKey="label" tick={{ fill: CHART.axis, fontSize: 11 }} tickLine={false} axisLine={{ stroke: CHART.grid }} minTickGap={24} />
        <YAxis tick={{ fill: CHART.axis, fontSize: 11 }} tickLine={false} axisLine={false} width={56} tickFormatter={(v: number) => (v >= 1000 ? `₱${Math.round(v / 1000)}k` : `₱${v}`)} />
        <Tooltip
          cursor={{ stroke: CHART.axis, strokeDasharray: "3 3" }}
          contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 12, color: "#f1f5f9" }}
          labelStyle={{ color: "#94a3b8" }}
          formatter={(v) => [formatPHPWhole(Number(v) * 100), "Total owed"]}
        />
        <Line type="monotone" dataKey="total" stroke={CHART.line} strokeWidth={2} dot={false} activeDot={{ r: 5, stroke: "#0f172a", strokeWidth: 2 }} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

const KIND: Record<Debt["kind"], { label: string; tone: "sky" | "amber" | "slate" }> = {
  loan: { label: "Loan", tone: "sky" },
  family: { label: "Family", tone: "amber" },
  credit: { label: "Credit", tone: "slate" },
};

function DebtCard({ debt, order, payoff, onPay }: { debt: Debt; order: number; payoff: string | null; onPay: () => void }) {
  const { state, today } = useStore();
  const bal = debtBalance(debt, state, today);
  const paid = paidSoFar(debt, state, today);
  const total = totalPayable(debt);
  const done = bal === 0;
  const overdue = !done && debt.dueDate !== null && debt.dueDate < today;
  return (
    <article className={cn("rounded-2xl border bg-slate-800/70 p-4", done ? "border-emerald-700/60" : overdue ? "border-rose-700/70" : "border-slate-700/60")}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-slate-400">#{order} · {debt.lender || "—"}</p>
          <h3 className="truncate font-semibold text-white">{debt.name}</h3>
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-1">
          <Badge tone={KIND[debt.kind].tone}>{KIND[debt.kind].label}</Badge>
          {debt.autoDeduct && <Badge tone="emerald">Auto-deduct</Badge>}
          {done && <Badge tone="emerald">Paid off</Badge>}
          {overdue && <Badge tone="rose">Overdue</Badge>}
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold tabular-nums text-white">
        <Money c={bal} />
      </p>
      <p className="mb-2 text-xs text-slate-400">
        left of <Money c={total} whole />
        {debt.financeCost > 0 && (
          <>
            {" "}
            (incl. <Money c={debt.financeCost} whole /> finance charges)
          </>
        )}
      </p>
      <Progress value={total > 0 ? paid / total : 1} label={`${debt.name} paid`} />
      <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
        {debt.monthlyPayment > 0 && (
          <Item label="Monthly">
            <Money c={debt.monthlyPayment} whole />
            {debt.autoDeduct && <span className="text-slate-400"> ({<Money c={debt.monthlyPayment / 2} whole />}/payday)</span>}
          </Item>
        )}
        {debt.dueDate && !done && (
          <Item label="Due">
            {fmtDate(debt.dueDate)} <span className={overdue ? "text-rose-300" : "text-slate-400"}>· {relativeDays(today, debt.dueDate)}</span>
          </Item>
        )}
        {!done && <Item label="Paid off by">{payoff ? fmtMonthYear(payoff) : "—"}</Item>}
        {debt.autoDeduct && !debt.openingPaidAsOf && !debt.startDate && (
          <p className="col-span-2 text-xs text-amber-300">Enter what you've paid so far in Settings so payroll deductions are counted.</p>
        )}
      </dl>
      {!done && (
        <Button variant="secondary" size="sm" className="mt-3 w-full" onClick={onPay}>
          <Plus className="size-4" aria-hidden /> Record payment
        </Button>
      )}
    </article>
  );
}

const Item = ({ label, children }: { label: string; children: ReactNode }) => (
  <div>
    <dt className="text-xs text-slate-400">{label}</dt>
    <dd className="tabular-nums text-slate-100">{children}</dd>
  </div>
);

function PaymentForm({ debt, onDone }: { debt: Debt; onDone: () => void }) {
  const { state, update, today } = useStore();
  const bal = debtBalance(debt, state, today);
  const [amount, setAmount] = useState(((Math.min(bal, debt.monthlyPayment || bal) || bal) / 100).toFixed(2));
  const [date, setDate] = useState(todayManila());
  const [note, setNote] = useState("");
  const c = toCentavos(amount);
  const valid = c !== null && c > 0 && c <= bal && /^\d{4}-\d{2}-\d{2}$/.test(date);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!valid || c === null) return;
        update((s) => ({ ...s, payments: [...s.payments, { id: uid(), debtId: debt.id, amount: c, date, note: note.slice(0, 200) }] }));
        onDone();
      }}
    >
      <p className="text-sm text-slate-300">
        Balance now: <Money c={bal} />
      </p>
      <Field label="Amount paid" htmlFor="pay-amt" hint={c !== null && c > bal ? <span className="text-rose-300">More than the balance.</span> : undefined}>
        <input id="pay-amt" inputMode="decimal" className="min-h-11 w-full rounded-xl border border-slate-600 bg-slate-900 px-3 tabular-nums text-white" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </Field>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => setAmount((bal / 100).toFixed(2))}>
          Full balance
        </Button>
        {debt.monthlyPayment > 0 && debt.monthlyPayment < bal && (
          <Button size="sm" onClick={() => setAmount((debt.monthlyPayment / 100).toFixed(2))}>
            Monthly amount
          </Button>
        )}
      </div>
      <Field label="Date paid" htmlFor="pay-date">
        <input id="pay-date" type="date" max={todayManila()} className="min-h-11 w-full rounded-xl border border-slate-600 bg-slate-900 px-3 text-white" value={date} onChange={(e) => setDate(e.target.value)} />
      </Field>
      <Field label="Note (optional)" htmlFor="pay-note">
        <input id="pay-note" className="min-h-11 w-full rounded-xl border border-slate-600 bg-slate-900 px-3 text-white" value={note} maxLength={200} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Paid via GCash" />
      </Field>
      {debt.autoDeduct && (
        <Notice tone="info">This loan is auto-deducted from payroll and already counted each payday. Only record extra payments here.</Notice>
      )}
      <Button type="submit" variant="primary" className="w-full" disabled={!valid}>
        Save payment
      </Button>
    </form>
  );
}

function WhatIf() {
  const { state, today } = useStore();
  const open = state.debts.filter((d) => debtBalance(d, state, today) > 0);
  const [picked, setPicked] = useState<string[]>([]);
  const [fromSavings, setFromSavings] = useState(true);
  const after = useMemo(() => applySettlement(state, picked, today, fromSavings), [state, picked, today, fromSavings]);
  const extra = state.settings.extraPerMonth ?? Math.max(0, monthlySurplus(state, today) ?? 0);
  const before = projectPayoff(state, today, state.settings.strategy, extra).debtFreeMonth;
  const afterFree = projectPayoff(after, today, state.settings.strategy, extra).debtFreeMonth;
  const cost = picked.reduce((a, id) => a + debtBalance(state.debts.find((d) => d.id === id)!, state, today), 0);
  const bufferAfter = emergencyBuffer(after);
  const rB = dti(state, today);
  const rA = dti(after, today);
  const runB = runwayMonths(state);
  const runA = runwayMonths(after);

  return (
    <Card>
      <CardTitle icon={<FlaskConical className="size-4" />} sub="Try settling debts without changing your saved data.">
        What-if: settle now
      </CardTitle>
      {open.length === 0 ? (
        <EmptyHint>Everything's paid. 🎉</EmptyHint>
      ) : (
        <>
          <fieldset className="space-y-2">
            <legend className="sr-only">Debts to settle</legend>
            {open.map((d) => (
              <label key={d.id} className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-700 px-3 hover:bg-slate-800">
                <span className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="size-5 accent-emerald-500"
                    checked={picked.includes(d.id)}
                    onChange={(e) => setPicked((p) => (e.target.checked ? [...p, d.id] : p.filter((x) => x !== d.id)))}
                  />
                  <span className="text-sm text-slate-100">{d.name}</span>
                </span>
                <Money c={debtBalance(d, state, today)} whole className="text-sm text-slate-300" />
              </label>
            ))}
          </fieldset>
          <div className="mt-3">
            <Toggle label="Pay from emergency savings" checked={fromSavings} onChange={setFromSavings} hint="Off = pay from new money (e.g. bonus, 13th month)." />
          </div>
          {picked.length > 0 && (
            <>
              <table className="mt-4 w-full text-sm tabular-nums">
                <thead className="text-xs text-slate-400">
                  <tr>
                    <th className="py-1 text-left font-medium" />
                    <th className="py-1 text-right font-medium">Now</th>
                    <th className="py-1 text-right font-medium">After</th>
                  </tr>
                </thead>
                <tbody className="[&_td]:py-1.5 [&_tr]:border-t [&_tr]:border-slate-800">
                  <Cmp label="Net worth" a={<Money c={netWorth(state, today)} whole />} b={<Money c={netWorth(after, today)} whole />} />
                  <Cmp label="Total debt" a={<Money c={totalDebt(state, today)} whole />} b={<Money c={totalDebt(after, today)} whole />} />
                  <Cmp label="Emergency fund" a={<Money c={emergencyBuffer(state)} whole />} b={<Money c={bufferAfter} whole className={bufferAfter < 0 ? "text-rose-300" : undefined} />} />
                  <Cmp label="Runway" a={runB === null ? "—" : `${runB.toFixed(1)} mo`} b={runA === null ? "—" : `${runA.toFixed(1)} mo`} />
                  <Cmp label="DTI" a={rB === null ? "—" : formatPct(rB)} b={rA === null ? "—" : formatPct(rA)} />
                  <Cmp label="Debt-free" a={before ? fmtMonthYear(before) : "—"} b={afterFree ? fmtMonthYear(afterFree) : "—"} />
                </tbody>
              </table>
              <p className="mt-3 text-xs text-slate-400">
                Settling costs <Money c={cost} whole />.{" "}
                {fromSavings
                  ? "Paying from savings doesn't change net worth: it swaps cash for less debt. Watch the runway — keep at least 3 months."
                  : "Paying with new money raises your net worth by the same amount."}
              </p>
              {fromSavings && bufferAfter < 0 && <Notice tone="bad" className="mt-2">Not enough in your emergency fund to cover this.</Notice>}
            </>
          )}
        </>
      )}
    </Card>
  );
}

const Cmp = ({ label, a, b }: { label: string; a: ReactNode; b: ReactNode }) => (
  <tr>
    <td className="text-slate-400">{label}</td>
    <td className="text-right text-slate-300">{a}</td>
    <td className="text-right font-semibold text-white">{b}</td>
  </tr>
);

function PaymentLog() {
  const { state, update } = useStore();
  const name = (id: string) => state.debts.find((d) => d.id === id)?.name ?? "Deleted debt";
  const recent = [...state.payments].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 15);
  return (
    <Card>
      <CardTitle icon={<History className="size-4" />} sub="Payroll deductions are counted automatically and aren't listed.">
        Payments you recorded
      </CardTitle>
      {recent.length === 0 ? (
        <EmptyHint>No payments yet. Use "Record payment" on a debt.</EmptyHint>
      ) : (
        <ul className="divide-y divide-slate-800">
          {recent.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-sm text-slate-100">{name(p.debtId)}</p>
                <p className="text-xs text-slate-400">
                  {fmtDate(p.date)}
                  {p.note && ` · ${p.note}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Money c={p.amount} className="text-sm font-semibold text-white" />
                <button
                  type="button"
                  onClick={() => update((s) => ({ ...s, payments: s.payments.filter((x) => x.id !== p.id) }))}
                  className="grid size-9 place-items-center rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white"
                  aria-label={`Undo payment of ${formatPHPWhole(p.amount)} to ${name(p.debtId)}`}
                  title="Undo"
                >
                  <Undo2 className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
