import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Building2, Landmark, LineChart as LineIcon, PiggyBank, Plus, Trash2 } from "lucide-react";
import type { Mp2Mode, WatchItem } from "../types";
import { useStore } from "../state/store";
import { coopPayoutEstimate, mp2Projection, savingsInterest } from "../lib/finance";
import { fmtDate } from "../lib/dates";
import { formatPHPWhole, formatPct, pesos } from "../lib/money";
import { uid } from "../lib/defaults";
import { Badge, Button, Card, CardTitle, EmptyHint, Money, MoneyInput, PageTitle, PercentInput, Segmented, TextInput } from "../components/ui";

// Validated two-series palette for the dark surface (see dataviz checks).
const SERIES = { contributed: "#3b82f6", dividends: "#059669" };
const AXIS = { grid: "#334155", tick: "#94a3b8" };

export default function Investments() {
  return (
    <>
      <PageTitle title="Wealth & investment hub" sub="Estimates for growing your money. Every rate is editable." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Mp2 />
        <div className="space-y-4">
          <Coop />
          <Savings />
        </div>
      </div>
      <div className="mt-4">
        <Watchlist />
      </div>
    </>
  );
}

function Mp2() {
  const { state, update, today } = useStore();
  const mp2 = state.mp2;
  const [monthly, setMonthly] = useState(Math.min(500_000, Math.max(50_000, mp2.monthlyContribution || 50_000)));
  const rows = mp2Projection(mp2.balance, monthly, mp2.annualRate, mp2.years, mp2.mode);
  const last = rows.at(-1)!;
  const set = (patch: Partial<typeof mp2>) => update((s) => ({ ...s, mp2: { ...s.mp2, ...patch } }));
  const data = rows.map((r) => ({ year: `Yr ${r.year}`, contributed: r.contributed / 100, dividends: r.dividends / 100 }));

  return (
    <Card id="mp2">
      <CardTitle icon={<Landmark className="size-4" />} sub={`Pag-IBIG MP2 · ${mp2.years}-year estimate`} action={<Badge tone="sky">Tax-free</Badge>}>
        MP2 savings calculator
      </CardTitle>

      <div className="flex items-baseline justify-between">
        <label htmlFor="mp2-slider" className="text-sm font-medium text-slate-200">
          Monthly contribution
        </label>
        <span className="text-xl font-bold tabular-nums text-white">
          <Money c={monthly} whole />
        </span>
      </div>
      <input id="mp2-slider" type="range" min={50_000} max={500_000} step={10_000} value={monthly} onChange={(e) => setMonthly(Number(e.target.value))} className="mt-2 w-full accent-emerald-500" />
      <div className="flex justify-between text-xs text-slate-400 tabular-nums">
        <span>₱500</span>
        <span>₱5,000</span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Tile label="You put in" value={<Money c={last.contributed} whole />} />
        <Tile label="Dividends" value={<Money c={last.dividends} whole />} accent />
        <Tile label={mp2.mode === "compounded" ? "At maturity" : "Balance"} value={<Money c={last.balance} whole />} />
      </div>

      <div className="mt-4 h-52" aria-hidden>
        {state.settings.hideAmounts ? (
          <div className="grid h-full place-items-center text-sm text-slate-400">Amounts hidden</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 0 }} barCategoryGap="28%">
              <CartesianGrid vertical={false} stroke={AXIS.grid} strokeDasharray="3 3" />
              <XAxis dataKey="year" tick={{ fill: AXIS.tick, fontSize: 11 }} tickLine={false} axisLine={{ stroke: AXIS.grid }} />
              <YAxis tick={{ fill: AXIS.tick, fontSize: 11 }} tickLine={false} axisLine={false} width={52} tickFormatter={(v: number) => `₱${Math.round(v / 1000)}k`} />
              <Tooltip
                cursor={{ fill: "#33415555" }}
                contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 12, color: "#f1f5f9" }}
                labelStyle={{ color: "#94a3b8" }}
                formatter={(v, name) => [formatPHPWhole(Number(v) * 100), name === "contributed" ? "Contributed" : "Dividends"]}
              />
              <Bar dataKey="contributed" stackId="a" fill={SERIES.contributed} stroke="#1e293b" strokeWidth={2} isAnimationActive={false} />
              <Bar dataKey="dividends" stackId="a" fill={SERIES.dividends} stroke="#1e293b" strokeWidth={2} radius={[4, 4, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      <ul className="mt-2 flex gap-4 text-xs text-slate-300" aria-label="Legend">
        <li className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm" style={{ background: SERIES.contributed }} aria-hidden /> Contributed
        </li>
        <li className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm" style={{ background: SERIES.dividends }} aria-hidden /> Dividends
        </li>
      </ul>
      <details className="mt-2 text-sm">
        <summary className="cursor-pointer text-slate-400 hover:text-white">Show as a table</summary>
        <table className="mt-2 w-full text-sm tabular-nums">
          <thead className="text-xs text-slate-400">
            <tr>
              <th className="py-1 text-left font-medium">Year</th>
              <th className="py-1 text-right font-medium">Contributed</th>
              <th className="py-1 text-right font-medium">Dividend</th>
              <th className="py-1 text-right font-medium">Balance</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.year} className="border-t border-slate-800">
                <td className="py-1">{r.year}</td>
                <td className="py-1 text-right"><Money c={r.contributed} whole /></td>
                <td className="py-1 text-right"><Money c={r.dividend} whole /></td>
                <td className="py-1 text-right"><Money c={r.balance} whole /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <PercentInput label="Dividend rate (per year)" value={mp2.annualRate} onChange={(r) => set({ annualRate: r ?? 0 })} max={20} hint="Historical, not guaranteed." />
        <MoneyInput label="Current MP2 balance" value={mp2.asOf ? mp2.balance : null} nullable onChange={(c) => set({ balance: c ?? 0, asOf: c === null ? null : today })} hint={mp2.asOf ? `As of ${fmtDate(mp2.asOf)}` : "Enter it to include it in your net worth."} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Segmented<Mp2Mode>
          label="Dividend option"
          value={mp2.mode}
          onChange={(m) => set({ mode: m })}
          options={[
            { value: "compounded", label: "Compounded" },
            { value: "annual-payout", label: "Yearly payout" },
          ]}
        />
        {monthly !== mp2.monthlyContribution && (
          <Button size="sm" variant="primary" onClick={() => set({ monthlyContribution: monthly })}>
            Save <Money c={monthly} whole /> as my monthly MP2
          </Button>
        )}
      </div>
      <p className="mt-3 text-xs text-slate-400">
        Estimate: contributions at the start of each month; each year's dividend is the rate × that year's average balance. Pag-IBIG's actual rate is declared yearly.
      </p>
    </Card>
  );
}

const Tile = ({ label, value, accent }: { label: string; value: React.ReactNode; accent?: boolean }) => (
  <div className="rounded-xl bg-slate-900/70 p-2">
    <p className="text-xs text-slate-400">{label}</p>
    <p className={accent ? "font-bold tabular-nums text-emerald-300" : "font-bold tabular-nums text-white"}>{value}</p>
  </div>
);

function Coop() {
  const { state, update, today } = useStore();
  const sc = state.shareCapital;
  const est = coopPayoutEstimate(state, today);
  const set = (patch: Partial<typeof sc>) => update((s) => ({ ...s, shareCapital: { ...s.shareCapital, ...patch } }));
  return (
    <Card id="coop">
      <CardTitle icon={<Building2 className="size-4" />} sub={`Next payout: ${fmtDate(est.payoutDate)} (estimate)`}>
        {sc.name}
      </CardTitle>
      <div className="grid grid-cols-2 gap-2">
        <Tile label="Share capital (CBU)" value={<Money c={sc.balance} whole />} />
        <Tile label="Estimated payout" value={<Money c={est.total} whole />} accent />
      </div>
      <dl className="mt-3 space-y-1 text-sm">
        <div className="flex justify-between">
          <dt className="text-slate-400">Dividend on share capital</dt>
          <dd className="tabular-nums">{est.dividend === null ? <span className="text-amber-300">enter rate</span> : <Money c={est.dividend} />}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-400">
            Patronage refund ({formatPct(sc.patronageRefundRate)} of <Money c={est.interestPaid} whole /> interest paid)
          </dt>
          <dd className="tabular-nums">
            <Money c={est.patronage} />
          </dd>
        </div>
      </dl>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <MoneyInput label="Share capital balance" value={sc.balance} onChange={(c) => set({ balance: c ?? 0, asOf: today })} />
        <PercentInput label="Dividend rate on share capital" value={sc.dividendRate} nullable onChange={(r) => set({ dividendRate: r })} max={50} hint="Use the rate the coop declared." />
        <PercentInput label="Patronage refund rate" value={sc.patronageRefundRate} onChange={(r) => set({ patronageRefundRate: r ?? 0 })} max={100} hint="Share of loan interest paid this year." />
      </div>
    </Card>
  );
}

function Savings() {
  const { state, update } = useStore();
  const accounts = state.savings;
  const first = accounts[0];
  const [amount, setAmount] = useState<number | null>(first?.balance ?? pesos(10_000));
  const rate = first?.annualRate ?? 0.045;
  const tax = first?.withholdingTax ?? 0.2;
  const r = savingsInterest(amount ?? 0, rate, tax);
  return (
    <Card id="savings">
      <CardTitle icon={<PiggyBank className="size-4" />} sub="Interest credited daily, after 20% final withholding tax.">
        High-yield savings
      </CardTitle>
      {accounts.length === 0 ? (
        <EmptyHint>Add a savings account in Settings.</EmptyHint>
      ) : (
        <ul className="mb-3 space-y-2">
          {accounts.map((a) => (
            <li key={a.id} className="flex items-center justify-between rounded-xl bg-slate-900/70 px-3 py-2 text-sm">
              <span>
                {a.name} {a.isEmergencyFund && <Badge tone="emerald">Emergency</Badge>}
                <span className="block text-xs text-slate-400">{formatPct(a.annualRate)} p.a.</span>
              </span>
              <Money c={a.balance} className="font-semibold text-white" />
            </li>
          ))}
        </ul>
      )}
      <MoneyInput label={`Try an amount at ${formatPct(rate)}`} value={amount} onChange={setAmount} />
      <table className="mt-3 w-full text-sm tabular-nums">
        <thead className="text-xs text-slate-400">
          <tr>
            <th className="py-1 text-left font-medium" />
            <th className="py-1 text-right font-medium">Before tax</th>
            <th className="py-1 text-right font-medium">You keep</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t border-slate-800">
            <td className="py-1 text-slate-400">Per day</td>
            <td className="py-1 text-right"><Money c={r.dailyGross} /></td>
            <td className="py-1 text-right font-semibold text-emerald-300"><Money c={r.dailyNet} /></td>
          </tr>
          <tr className="border-t border-slate-800">
            <td className="py-1 text-slate-400">Per month</td>
            <td className="py-1 text-right"><Money c={r.monthlyGross} /></td>
            <td className="py-1 text-right font-semibold text-emerald-300"><Money c={r.monthlyNet} /></td>
          </tr>
          <tr className="border-t border-slate-800">
            <td className="py-1 text-slate-400">Per year</td>
            <td className="py-1 text-right"><Money c={r.yearlyGross} /></td>
            <td className="py-1 text-right font-semibold text-emerald-300"><Money c={r.yearlyNet} /></td>
          </tr>
        </tbody>
      </table>
      {first && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <PercentInput
            label={`${first.name} rate`}
            value={first.annualRate}
            max={20}
            onChange={(v) => update((s) => ({ ...s, savings: s.savings.map((a) => (a.id === first.id ? { ...a, annualRate: v ?? 0 } : a)) }))}
          />
          <PercentInput
            label="Withholding tax"
            value={first.withholdingTax}
            onChange={(v) => update((s) => ({ ...s, savings: s.savings.map((a) => (a.id === first.id ? { ...a, withholdingTax: v ?? 0 } : a)) }))}
          />
        </div>
      )}
    </Card>
  );
}

function Watchlist() {
  const { state, update, today } = useStore();
  const [per, setPer] = useState<number | null>(pesos(10_000));
  const setItem = (id: string, patch: Partial<WatchItem>) =>
    update((s) => ({ ...s, watchlist: s.watchlist.map((w) => (w.id === id ? { ...w, ...patch, asOf: today } : w)) }));
  return (
    <Card id="reits">
      <CardTitle
        icon={<LineIcon className="size-4" />}
        sub="Philippine REITs you're watching. Tracking only: yields and prices change; update them from the PSE."
        action={
          <Button
            size="sm"
            onClick={() => update((s) => ({ ...s, watchlist: [...s.watchlist, { id: uid(), ticker: "NEW", name: "", price: null, dividendYield: 0, dividendTax: 0.1, asOf: today }] }))}
          >
            <Plus className="size-4" aria-hidden /> Add
          </Button>
        }
      >
        REIT watchlist
      </CardTitle>
      <div className="mb-4 max-w-xs">
        <MoneyInput label="If I invest" value={per} onChange={setPer} />
      </div>
      {state.watchlist.length === 0 ? (
        <EmptyHint>No REITs on your watchlist.</EmptyHint>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {state.watchlist.map((w) => {
            const net = w.dividendYield * (1 - w.dividendTax);
            return (
              <div key={w.id} className="rounded-xl border border-slate-700 bg-slate-900/60 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-white">{w.ticker}</p>
                    <p className="text-xs text-slate-400">{w.name || "—"}{w.asOf ? ` · updated ${fmtDate(w.asOf)}` : ""}</p>
                  </div>
                  <button
                    type="button"
                    className="grid size-9 place-items-center rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white"
                    aria-label={`Remove ${w.ticker}`}
                    onClick={() => update((s) => ({ ...s, watchlist: s.watchlist.filter((x) => x.id !== w.id) }))}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <p className="mt-2 text-sm text-slate-300">
                  Net yield after {formatPct(w.dividendTax)} tax: <span className="font-semibold text-emerald-300">{formatPct(net)}</span>
                </p>
                <p className="text-sm text-slate-300">
                  ≈ <Money c={(per ?? 0) * net} whole className="font-semibold text-white" /> a year, <Money c={((per ?? 0) * net) / 12} whole /> a month
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <TextInput label="Ticker" value={w.ticker} maxLength={12} onChange={(v) => setItem(w.id, { ticker: v.toUpperCase() })} />
                  <PercentInput label="Dividend yield" value={w.dividendYield} max={30} onChange={(v) => setItem(w.id, { dividendYield: v ?? 0 })} />
                  <MoneyInput label="Price per share" value={w.price} nullable onChange={(c) => setItem(w.id, { price: c })} />
                  <PercentInput label="Dividend tax" value={w.dividendTax} onChange={(v) => setItem(w.id, { dividendTax: v ?? 0 })} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
