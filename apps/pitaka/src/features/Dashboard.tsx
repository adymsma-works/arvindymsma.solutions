import { CalendarClock, CircleAlert, HandCoins, HeartPulse, PiggyBank, Scale, ShieldCheck, Wallet } from "lucide-react";
import { useStore } from "../state/store";
import { debtProgress, dti, dtiLevel, emergencyBuffer, monthlyExpenses, netWorth, planCutoffs, runwayMonths, totalDebt, upcoming, type CutoffPlan } from "../lib/finance";
import { fmtDow, fmtShort, relativeDays } from "../lib/dates";
import { missingInputs } from "../lib/checklist";
import { isEmpty } from "../lib/defaults";
import { go } from "../lib/nav";
import { cn } from "../lib/cn";
import { Badge, Card, CardTitle, EmptyHint, Money, Notice, PageTitle, Pct, Stat } from "../components/ui";
import ImportPanel from "../components/ImportPanel";

export default function Dashboard() {
  const { state, today } = useStore();

  if (isEmpty(state)) return <Welcome />;

  const nw = netWorth(state, today);
  const buffer = emergencyBuffer(state);
  const debt = totalDebt(state, today);
  const progress = debtProgress(state, today);
  const ratio = dti(state, today);
  const level = dtiLevel(ratio);
  const missing = missingInputs(state);
  const hello = state.profile.name ? `Hi, ${state.profile.name}` : "Dashboard";

  return (
    <>
      <PageTitle title={hello} sub="Where your money stands today." />

      {missing.length > 0 && (
        <Notice tone="warn" title={`Pitaka needs ${missing.length} number${missing.length > 1 ? "s" : ""} from you`} className="mb-4">
          <ul className="mt-1 space-y-1">
            {missing.map((m) => (
              <li key={m.id}>
                <button type="button" onClick={() => go(m.tab, m.anchor)} className="text-left underline decoration-amber-400/50 underline-offset-4 hover:decoration-amber-300">
                  {m.text}
                </button>
              </li>
            ))}
          </ul>
        </Notice>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Net worth" icon={<Scale className="size-3.5" />} value={<Money c={nw} whole />} tone={nw >= 0 ? "default" : "bad"} hint="Assets minus everything owed" />
        <Stat
          label="Emergency buffer"
          icon={<ShieldCheck className="size-3.5" />}
          value={<Money c={buffer} whole />}
          hint={runwayMonths(state) !== null ? `${runwayMonths(state)!.toFixed(1)} months of support` : "Set monthly costs for runway"}
        />
        <Stat label="Total debt" icon={<HandCoins className="size-3.5" />} value={<Money c={debt} whole />} hint={`${Math.round(progress.ratio * 100)}% paid off`} tone={debt === 0 ? "good" : "default"} />
        <Stat
          label="Debt-to-income"
          icon={<Wallet className="size-3.5" />}
          value={ratio === null ? "—" : <Pct r={ratio} />}
          tone={level === "good" ? "good" : level === "warn" ? "warn" : level === "bad" ? "bad" : "default"}
          hint={level === "good" ? "Healthy (under 20%)" : level === "warn" ? "Watch it (20–35%)" : level === "bad" ? "High (over 35%)" : "Add your salary"}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-3">
          <Paydays />
        </div>
        <div className="space-y-4 lg:col-span-2">
          <Runway />
          <Upcoming />
        </div>
      </div>
    </>
  );
}

function Welcome() {
  return (
    <>
      <PageTitle title="Welcome to Pitaka" sub="Your money, kinsenas to katapusan. Everything stays encrypted in this browser." />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardTitle icon={<PiggyBank className="size-4" />}>Start with your preset</CardTitle>
          <p className="mb-4 text-sm text-slate-300">
            If you have a <code className="rounded bg-slate-900 px-1">pitaka-preset.json</code> file, import it to fill in your salary, debts and savings in one step.
          </p>
          <ImportPanel cta="Import preset file" />
        </Card>
        <Card>
          <CardTitle icon={<CircleAlert className="size-4" />}>Or enter numbers yourself</CardTitle>
          <p className="mb-4 text-sm text-slate-300">Add your salary, debts and savings in Settings. You can change everything later.</p>
          <button type="button" onClick={() => go("settings", "income")} className="text-sm font-semibold text-emerald-300 underline underline-offset-4">
            Go to Settings →
          </button>
        </Card>
      </div>
    </>
  );
}

function Paydays() {
  const { state, today } = useStore();
  if (state.income.monthlySalary <= 0)
    return (
      <Card>
        <CardTitle icon={<CalendarClock className="size-4" />}>Payday plan</CardTitle>
        <EmptyHint>Add your monthly salary in Settings to see each payday's plan.</EmptyHint>
      </Card>
    );
  const plans = planCutoffs(state, today);
  return (
    <Card>
      <CardTitle icon={<CalendarClock className="size-4" />} sub="Suggested order: bills due first, then family, essentials, MP2, priority debt, savings.">
        Next two paydays
      </CardTitle>
      {monthlyExpenses(state) === null && (
        <Notice tone="warn" className="mb-3">
          Support and essentials aren't set, so the leftover below is overstated.
        </Notice>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {plans.map((p) => (
          <CutoffCard key={p.payday.date} plan={p} today={today} />
        ))}
      </div>
    </Card>
  );
}

function CutoffCard({ plan, today }: { plan: CutoffPlan; today: string }) {
  const { payday } = plan;
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-3">
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-semibold text-white">
          {fmtDow(payday.date)}, {fmtShort(payday.date)}
        </p>
        <Badge tone="emerald">{relativeDays(today, payday.date)}</Badge>
      </div>
      <p className="text-xs text-slate-400">
        {payday.cutoff === 1 ? "Kinsenas" : "Katapusan"}
        {payday.date !== payday.nominal && " · moved before the weekend"}
      </p>
      <dl className="mt-3 space-y-1 text-sm">
        <Line label="Salary (½)" value={<Money c={plan.gross} />} />
        {plan.statutory > 0 && <Line label="SSS · PhilHealth · Pag-IBIG · tax" value={<Money c={-plan.statutory} />} muted />}
        {plan.autoDebts.map((a) => (
          <Line key={a.name} label={`${a.name} (auto)`} value={<Money c={-a.amount} />} muted />
        ))}
        <div className="flex justify-between border-t border-slate-700 pt-1 font-semibold">
          <dt>Net to allocate</dt>
          <dd>
            <Money c={plan.net} />
          </dd>
        </div>
      </dl>
      <ol className="mt-3 space-y-1.5 text-sm">
        {plan.allocations.map((a, i) => (
          <li key={i} className="flex items-start justify-between gap-2">
            <span className="min-w-0">
              <span className={cn("mr-2 inline-block size-2 rounded-full align-middle", dot[a.kind])} aria-hidden />
              {a.label}
              {a.note && <span className={cn("block pl-4 text-xs", a.warn ? "text-amber-300" : "text-slate-400")}>{a.note}</span>}
            </span>
            <Money c={a.amount} className="shrink-0" />
          </li>
        ))}
        {plan.leftover < 0 && (
          <li className="flex justify-between font-semibold text-rose-300">
            <span>Short by</span>
            <Money c={-plan.leftover} />
          </li>
        )}
      </ol>
    </div>
  );
}

const dot = {
  bill: "bg-rose-400",
  household: "bg-sky-400",
  essentials: "bg-slate-400",
  mp2: "bg-violet-400",
  debt: "bg-amber-400",
  savings: "bg-emerald-400",
} as const;

function Line({ label, value, muted }: { label: string; value: React.ReactNode; muted?: boolean }) {
  return (
    <div className={cn("flex justify-between gap-2", muted && "text-slate-400")}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function Runway() {
  const { state } = useStore();
  const months = runwayMonths(state);
  const exp = monthlyExpenses(state);
  const max = 6;
  const tone = months === null ? "slate" : months < 1 ? "rose" : months < 3 ? "amber" : "emerald";
  return (
    <Card>
      <CardTitle icon={<HeartPulse className="size-4" />} sub="How long your emergency fund covers support for Mom & Lola plus your essentials.">
        Emergency runway
      </CardTitle>
      {months === null ? (
        <EmptyHint>
          <button type="button" className="underline underline-offset-4" onClick={() => go("settings", "budget")}>
            Enter monthly support and essentials
          </button>{" "}
          to see your runway.
        </EmptyHint>
      ) : (
        <>
          <p className="text-3xl font-bold tabular-nums text-white">
            {months.toFixed(1)} <span className="text-base font-medium text-slate-400">months</span>
          </p>
          <div className="relative mt-3" role="meter" aria-label="Emergency runway in months" aria-valuemin={0} aria-valuemax={max} aria-valuenow={Math.min(months, max)}>
            <div className="flex h-3 overflow-hidden rounded-full bg-slate-700">
              <div className={cn("h-full rounded-full", tone === "rose" ? "bg-rose-500" : tone === "amber" ? "bg-amber-400" : "bg-emerald-500")} style={{ width: `${(Math.min(months, max) / max) * 100}%` }} />
            </div>
            {/* 3–6 month target band */}
            <div className="pointer-events-none absolute inset-y-0 left-1/2 right-0 rounded-r-full border-2 border-dashed border-emerald-400/40" aria-hidden />
          </div>
          <div className="mt-1 flex justify-between text-xs text-slate-400 tabular-nums">
            <span>0</span>
            <span>3 · target starts</span>
            <span>6+</span>
          </div>
          <p className="mt-3 text-sm text-slate-300">
            Monthly need: <Money c={exp ?? 0} whole />.{" "}
            {months < 3 ? (
              <>
                To reach 3 months, add <Money c={Math.max(0, 3 * (exp ?? 0) - emergencyBuffer(state))} whole />.
              </>
            ) : (
              "You're in the target range."
            )}
          </p>
        </>
      )}
    </Card>
  );
}

function Upcoming() {
  const { state, today } = useStore();
  const events = upcoming(state, today, 60);
  return (
    <Card>
      <CardTitle icon={<CalendarClock className="size-4" />}>Next 60 days</CardTitle>
      {events.length === 0 ? (
        <EmptyHint>Nothing scheduled.</EmptyHint>
      ) : (
        <ol className="space-y-3">
          {events.map((e, i) => (
            <li key={i} className="flex gap-3">
              <div className="w-12 shrink-0 text-center">
                <p className="text-xs uppercase text-slate-400">{fmtDow(e.date)}</p>
                <p className="text-sm font-semibold tabular-nums text-white">{fmtShort(e.date)}</p>
              </div>
              <div className="min-w-0 flex-1 border-l border-slate-700 pl-3">
                <p className={cn("text-sm font-medium", e.warn ? "text-rose-300" : "text-slate-100")}>
                  {e.title}
                  {e.amount !== undefined && (
                    <>
                      {" · "}
                      <Money c={e.amount} whole className="text-slate-300" />
                    </>
                  )}
                </p>
                <p className="text-xs text-slate-400">
                  {relativeDays(today, e.date)}
                  {e.detail && ` · ${e.detail}`}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
