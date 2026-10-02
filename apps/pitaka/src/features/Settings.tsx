import { useState, type ReactNode } from "react";
import { Database, HandCoins, HeartHandshake, KeyRound, PiggyBank, Plus, ShieldAlert, Trash2, UserRound, Users } from "lucide-react";
import type { AppState, Debt, DebtKind, SalaryBasis, SavingsAccount, WeekendRule } from "../types";
import { useStore } from "../state/store";
import { isValidPin } from "../lib/crypto";
import { downloadJSON, unlock, wipeAll } from "../lib/storage";
import { debtBalance, paidSoFar } from "../lib/finance";
import { uid } from "../lib/defaults";
import { fmtDate } from "../lib/dates";
import {
  Badge,
  Button,
  Card,
  CardTitle,
  EmptyHint,
  Field,
  Money,
  MoneyInput,
  Notice,
  NumberInput,
  PageTitle,
  PercentInput,
  Select,
  TextInput,
  Toggle,
} from "../components/ui";
import ImportPanel from "../components/ImportPanel";

export default function Settings() {
  return (
    <>
      <PageTitle title="Settings" sub="Your numbers, security and backups. Changes save automatically (encrypted)." />
      <div className="space-y-4">
        <IncomeSection />
        <BudgetSection />
        <DebtsSection />
        <SavingsSection />
        <DependentsSection />
        <SecuritySection />
        <DataSection />
      </div>
    </>
  );
}

const Grid = ({ children }: { children: ReactNode }) => <div className="grid gap-3 sm:grid-cols-2">{children}</div>;

/* Income ---------------------------------------------------------------- */

function IncomeSection() {
  const { state, update } = useStore();
  const setIncome = (p: Partial<AppState["income"]>) => update((s) => ({ ...s, income: { ...s.income, ...p } }));
  const setProfile = (p: Partial<AppState["profile"]>) => update((s) => ({ ...s, profile: { ...s.profile, ...p } }));
  return (
    <Card id="income">
      <CardTitle icon={<UserRound className="size-4" />}>Profile & salary</CardTitle>
      <Grid>
        <TextInput label="Name" value={state.profile.name} onChange={(v) => setProfile({ name: v })} />
        <TextInput label="Role" value={state.profile.role} onChange={(v) => setProfile({ role: v })} maxLength={80} />
        <MoneyInput label="Monthly salary" value={state.income.monthlySalary} onChange={(c) => setIncome({ monthlySalary: c ?? 0 })} hint="Paid half on the 15th, half on the 30th." />
        <Select<SalaryBasis>
          label="That salary is…"
          value={state.income.basis}
          onChange={(v) => setIncome({ basis: v })}
          options={[
            { value: "unset", label: "Not sure yet" },
            { value: "gross", label: "Before deductions (gross)" },
            { value: "take-home", label: "What I actually receive (take-home)" },
          ]}
          hint="Check your payslip. If gross, enter the deductions below."
        />
        <Select<WeekendRule>
          label="If payday lands on a weekend"
          value={state.income.weekendRule}
          onChange={(v) => setIncome({ weekendRule: v })}
          options={[
            { value: "previous-business-day", label: "Paid the Friday before" },
            { value: "as-is", label: "Paid on the date itself" },
          ]}
        />
      </Grid>
      {state.income.basis === "gross" && (
        <div className="mt-5">
          <h3 className="mb-1 text-sm font-semibold text-slate-200">Monthly deductions (employee share)</h3>
          <p className="mb-3 text-xs text-slate-400">Copy these from your payslip. Contribution tables change; Pitaka doesn't guess them.</p>
          <Grid>
            {state.deductions.map((d) => (
              <MoneyInput
                key={d.id}
                label={d.name}
                value={d.monthly}
                hint={d.note}
                onChange={(c) => update((s) => ({ ...s, deductions: s.deductions.map((x) => (x.id === d.id ? { ...x, monthly: c ?? 0 } : x)) }))}
              />
            ))}
          </Grid>
        </div>
      )}
    </Card>
  );
}

/* Budget ---------------------------------------------------------------- */

function BudgetSection() {
  const { state, update } = useStore();
  const set = (p: Partial<AppState["budget"]>) => update((s) => ({ ...s, budget: { ...s.budget, ...p } }));
  return (
    <Card id="budget">
      <CardTitle icon={<HeartHandshake className="size-4" />} sub="Used for the payday plan and the emergency runway.">
        Monthly costs
      </CardTitle>
      <Grid>
        <MoneyInput label="Support for Mom & Lola" value={state.budget.householdSupport} nullable onChange={(c) => set({ householdSupport: c })} hint="Food, medicine, bills you cover for them each month." />
        <MoneyInput label="My own essentials" value={state.budget.essentials} nullable onChange={(c) => set({ essentials: c })} hint="Food, transport, load, rent/utilities." />
      </Grid>
    </Card>
  );
}

/* Debts ----------------------------------------------------------------- */

function newDebt(priority: number): Debt {
  return {
    id: uid(),
    name: "New debt",
    lender: "",
    kind: "credit",
    principal: 0,
    financeCost: 0,
    monthlyPayment: 0,
    autoDeduct: false,
    termMonths: null,
    startDate: null,
    dueDate: null,
    openingPaid: 0,
    openingPaidAsOf: null,
    annualCostRate: 0,
    priority,
    earnsPatronage: false,
    note: "",
  };
}

function DebtsSection() {
  const { state, update } = useStore();
  return (
    <Card id="debts">
      <CardTitle
        icon={<HandCoins className="size-4" />}
        sub="Lower priority number = paid first in “My priority” strategy."
        action={
          <Button size="sm" onClick={() => update((s) => ({ ...s, debts: [...s.debts, newDebt(s.debts.length + 1)] }))}>
            <Plus className="size-4" aria-hidden /> Add debt
          </Button>
        }
      >
        Debts
      </CardTitle>
      {state.debts.length === 0 ? <EmptyHint>No debts. Nice.</EmptyHint> : <div className="space-y-2">{state.debts.map((d) => <DebtEditor key={d.id} debt={d} />)}</div>}
    </Card>
  );
}

function DebtEditor({ debt }: { debt: Debt }) {
  const { state, update, today } = useStore();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const set = (p: Partial<Debt>) => update((s) => ({ ...s, debts: s.debts.map((d) => (d.id === debt.id ? { ...d, ...p } : d)) }));
  const needs = (debt.autoDeduct && !debt.openingPaidAsOf && !debt.startDate) || (debt.kind === "credit" && !debt.dueDate);
  return (
    <details className="group rounded-xl border border-slate-700 bg-slate-900/50" open={needs || undefined}>
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-3 py-2">
        <span className="min-w-0">
          <span className="font-medium text-white">{debt.name}</span>
          {needs && (
            <span className="ml-2">
              <Badge tone="amber">needs info</Badge>
            </span>
          )}
          <span className="block text-xs text-slate-400">
            Owes <Money c={debtBalance(debt, state, today)} whole /> · paid <Money c={paidSoFar(debt, state, today)} whole />
          </span>
        </span>
        <span className="text-slate-400 transition-transform group-open:rotate-90" aria-hidden>
          ›
        </span>
      </summary>
      <div className="space-y-3 border-t border-slate-700 p-3">
        <Grid>
          <TextInput label="Name" value={debt.name} onChange={(v) => set({ name: v })} />
          <TextInput label="Lender" value={debt.lender} onChange={(v) => set({ lender: v })} />
          <Select<DebtKind>
            label="Type"
            value={debt.kind}
            onChange={(v) => set({ kind: v })}
            options={[
              { value: "loan", label: "Loan (fixed payments)" },
              { value: "family", label: "Family / personal" },
              { value: "credit", label: "Credit line (Maya, GCash…)" },
            ]}
          />
          <NumberInput label="Priority (1 = first)" value={debt.priority} min={1} onChange={(n) => set({ priority: n ?? 1 })} />
          <MoneyInput label="Amount borrowed" value={debt.principal} onChange={(c) => set({ principal: c ?? 0 })} />
          <MoneyInput label="Finance charges over the term" value={debt.financeCost} onChange={(c) => set({ financeCost: c ?? 0 })} hint="e.g. ₱2,500 × 24 months − ₱50,000 = ₱10,000" />
          <MoneyInput label="Monthly payment" value={debt.monthlyPayment} onChange={(c) => set({ monthlyPayment: c ?? 0 })} hint="0 if there's no schedule." />
          <NumberInput label="Term (months)" value={debt.termMonths} min={1} onChange={(n) => set({ termMonths: n })} />
          <DateField label="Due date" value={debt.dueDate} onChange={(v) => set({ dueDate: v })} hint={debt.kind === "credit" ? "When the full balance is due." : "Leave empty if not applicable."} />
          <DateField label="Loan start date" value={debt.startDate} onChange={(v) => set({ startDate: v })} />
          <PercentInput label="Yearly cost (for avalanche)" value={debt.annualCostRate} max={500} onChange={(r) => set({ annualCostRate: r ?? 0 })} hint="0 for interest-free." />
        </Grid>
        <Toggle label="Auto-deducted from payroll" checked={debt.autoDeduct} onChange={(v) => set({ autoDeduct: v })} hint="Half the monthly payment is taken each payday and counted automatically." />
        {debt.autoDeduct && (
          <div className="rounded-xl border border-slate-700 p-3">
            <p className="mb-2 text-sm text-slate-300">How much have you paid on this loan so far?</p>
            <Grid>
              <MoneyInput label="Paid so far" value={debt.openingPaid} onChange={(c) => set({ openingPaid: c ?? 0, openingPaidAsOf: debt.openingPaidAsOf ?? today })} />
              <DateField label="As of" value={debt.openingPaidAsOf} onChange={(v) => set({ openingPaidAsOf: v })} hint="Deductions after this date are added automatically." />
            </Grid>
          </div>
        )}
        <Toggle label="Earns coop patronage refund" checked={debt.earnsPatronage} onChange={(v) => set({ earnsPatronage: v })} />
        <TextInput label="Note" value={debt.note} maxLength={300} onChange={(v) => set({ note: v })} />
        {confirmDelete ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-rose-200">Delete this debt and its payments?</span>
            <Button size="sm" variant="danger" onClick={() => update((s) => ({ ...s, debts: s.debts.filter((d) => d.id !== debt.id), payments: s.payments.filter((p) => p.debtId !== debt.id) }))}>
              Delete
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button size="sm" variant="ghost" className="text-rose-300" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="size-4" aria-hidden /> Delete debt
          </Button>
        )}
      </div>
    </details>
  );
}

function DateField({ label, value, onChange, hint }: { label: string; value: string | null; onChange: (v: string | null) => void; hint?: ReactNode }) {
  return (
    <TextInput
      label={label}
      type="date"
      value={value ?? ""}
      onChange={(v) => onChange(/^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null)}
      hint={hint}
    />
  );
}

/* Savings --------------------------------------------------------------- */

function SavingsSection() {
  const { state, update, today } = useStore();
  const set = (id: string, p: Partial<SavingsAccount>) =>
    update((s) => ({ ...s, savings: s.savings.map((a) => (a.id === id ? { ...a, ...p, asOf: today } : a)) }));
  return (
    <Card id="savings-accounts">
      <CardTitle
        icon={<PiggyBank className="size-4" />}
        action={
          <Button
            size="sm"
            onClick={() =>
              update((s) => ({ ...s, savings: [...s.savings, { id: uid(), name: "Savings", balance: 0, annualRate: 0, withholdingTax: 0.2, isEmergencyFund: true, asOf: today }] }))
            }
          >
            <Plus className="size-4" aria-hidden /> Add account
          </Button>
        }
      >
        Savings accounts
      </CardTitle>
      {state.savings.length === 0 ? (
        <EmptyHint>No savings accounts yet.</EmptyHint>
      ) : (
        <div className="space-y-3">
          {state.savings.map((a) => (
            <div key={a.id} className="space-y-3 rounded-xl border border-slate-700 bg-slate-900/50 p-3">
              <Grid>
                <TextInput label="Name" value={a.name} onChange={(v) => set(a.id, { name: v })} />
                <MoneyInput label="Balance" value={a.balance} onChange={(c) => set(a.id, { balance: c ?? 0 })} hint={a.asOf ? `Updated ${fmtDate(a.asOf)}` : undefined} />
                <PercentInput label="Interest rate (per year)" value={a.annualRate} max={20} onChange={(r) => set(a.id, { annualRate: r ?? 0 })} />
                <PercentInput label="Withholding tax on interest" value={a.withholdingTax} onChange={(r) => set(a.id, { withholdingTax: r ?? 0 })} />
              </Grid>
              <Toggle label="Counts as emergency fund" checked={a.isEmergencyFund} onChange={(v) => set(a.id, { isEmergencyFund: v })} />
              <Button size="sm" variant="ghost" className="text-rose-300" onClick={() => update((s) => ({ ...s, savings: s.savings.filter((x) => x.id !== a.id) }))}>
                <Trash2 className="size-4" aria-hidden /> Remove account
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

/* Dependents ------------------------------------------------------------ */

function DependentsSection() {
  const { state, update } = useStore();
  return (
    <Card id="dependents">
      <CardTitle
        icon={<Users className="size-4" />}
        sub="Birthdays show in your upcoming list."
        action={
          <Button size="sm" onClick={() => update((s) => ({ ...s, dependents: [...s.dependents, { id: uid(), name: "", relation: "", birthday: "01-01", birthYear: null, note: "" }] }))}>
            <Plus className="size-4" aria-hidden /> Add
          </Button>
        }
      >
        Family you support
      </CardTitle>
      {state.dependents.length === 0 ? (
        <EmptyHint>No one added yet.</EmptyHint>
      ) : (
        <div className="space-y-3">
          {state.dependents.map((p) => {
            const set = (patch: Partial<typeof p>) => update((s) => ({ ...s, dependents: s.dependents.map((x) => (x.id === p.id ? { ...x, ...patch } : x)) }));
            return (
              <div key={p.id} className="rounded-xl border border-slate-700 bg-slate-900/50 p-3">
                <div className="grid gap-3 sm:grid-cols-4">
                  <TextInput label="Name" value={p.name} onChange={(v) => set({ name: v })} />
                  <TextInput label="Relation" value={p.relation} maxLength={40} onChange={(v) => set({ relation: v })} />
                  <TextInput label="Birthday (MM-DD)" value={p.birthday} maxLength={5} placeholder="11-27" onChange={(v) => /^\d{0,2}-?\d{0,2}$/.test(v) && set({ birthday: v })} />
                  <NumberInput label="Birth year" value={p.birthYear} min={1900} max={2100} onChange={(n) => set({ birthYear: n })} />
                </div>
                <Button size="sm" variant="ghost" className="mt-2 text-rose-300" onClick={() => update((s) => ({ ...s, dependents: s.dependents.filter((x) => x.id !== p.id) }))}>
                  <Trash2 className="size-4" aria-hidden /> Remove
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

/* Security -------------------------------------------------------------- */

function SecuritySection() {
  const { state, update, changePin, pinLength } = useStore();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [again, setAgain] = useState("");
  const [msg, setMsg] = useState<{ tone: "info" | "bad"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setMsg(null);
    if (!isValidPin(next)) return setMsg({ tone: "bad", text: "New PIN must be 4 to 6 digits." });
    if (next !== again) return setMsg({ tone: "bad", text: "New PINs don't match." });
    setBusy(true);
    const check = await unlock(current);
    if (!check.ok) {
      setBusy(false);
      return setMsg({ tone: "bad", text: "Current PIN is wrong." });
    }
    await changePin(next);
    setBusy(false);
    setCurrent("");
    setNext("");
    setAgain("");
    setMsg({ tone: "info", text: "PIN changed. Your data was re-encrypted with the new PIN." });
  };

  const pinInput = (label: string, v: string, set: (s: string) => void) => (
    <Field label={label} htmlFor={label}>
      <input
        id={label}
        type="password"
        inputMode="numeric"
        autoComplete="off"
        className="min-h-11 w-full rounded-xl border border-slate-600 bg-slate-900 px-3 tracking-widest text-white"
        value={v}
        onChange={(e) => set(e.target.value.replace(/\D/g, "").slice(0, 6))}
      />
    </Field>
  );

  return (
    <Card id="security">
      <CardTitle icon={<KeyRound className="size-4" />} sub={`Current PIN: ${pinLength} digits.`}>
        Security
      </CardTitle>
      <Notice tone="info" className="mb-4">
        Your data is encrypted (AES-256) with a key made from your PIN, and stays in this browser. A short PIN stops casual access, but not someone who copies your browser data and
        tries every PIN. Use 6 digits, lock your phone, and keep regular backups.
      </Notice>
      <div className="grid gap-3 sm:grid-cols-3">
        {pinInput("Current PIN", current, setCurrent)}
        {pinInput("New PIN (4–6 digits)", next, setNext)}
        {pinInput("Repeat new PIN", again, setAgain)}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Button variant="primary" onClick={submit} disabled={busy || current.length < 4 || next.length < 4}>
          {busy ? "Re-encrypting…" : "Change PIN"}
        </Button>
        {msg && <span className={msg.tone === "bad" ? "text-sm text-rose-300" : "text-sm text-emerald-300"} role="status">{msg.text}</span>}
      </div>
      <div className="mt-5 max-w-xs">
        <Select<string>
          label="Auto-lock after"
          value={String(state.settings.autoLockMinutes)}
          onChange={(v) => update((s) => ({ ...s, settings: { ...s.settings, autoLockMinutes: Number(v) } }))}
          options={[1, 2, 5, 10, 15, 30].map((m) => ({ value: String(m), label: `${m} minute${m > 1 ? "s" : ""} of inactivity` }))}
          hint="Also locks when you leave the app for more than a minute."
        />
      </div>
    </Card>
  );
}

/* Data ------------------------------------------------------------------ */

function DataSection() {
  const { state, exportVault, today } = useStore();
  const [wipeText, setWipeText] = useState("");
  return (
    <Card id="data">
      <CardTitle icon={<Database className="size-4" />} sub="Back up regularly: if you clear your browser or forget your PIN, backups are the only way back.">
        Backup & restore
      </CardTitle>
      <div className="flex flex-wrap gap-2">
        <Button variant="primary" onClick={async () => downloadJSON(`pitaka-backup-${today}-encrypted.json`, await exportVault())}>
          Download encrypted backup
        </Button>
        <Button onClick={() => downloadJSON(`pitaka-backup-${today}.json`, state)}>Download readable backup</Button>
      </div>
      <p className="mt-2 text-xs text-slate-400">The encrypted backup opens with your current PIN. The readable one is plain text: anyone who gets the file can read it.</p>

      <h3 className="mt-6 mb-2 text-sm font-semibold text-slate-200">Restore or import</h3>
      <ImportPanel cta="Import backup or preset file" />

      <h3 className="mt-8 mb-2 flex items-center gap-2 text-sm font-semibold text-rose-200">
        <ShieldAlert className="size-4" aria-hidden /> Wipe all Pitaka data on this device
      </h3>
      <p className="mb-2 text-sm text-slate-400">Deletes everything and the PIN. This can't be undone.</p>
      <div className="flex flex-wrap items-end gap-2">
        <div className="w-48">
          <TextInput label='Type "WIPE" to confirm' value={wipeText} onChange={setWipeText} maxLength={4} />
        </div>
        <Button
          variant="danger"
          disabled={wipeText !== "WIPE"}
          onClick={() => {
            wipeAll();
            window.location.reload();
          }}
        >
          Wipe everything
        </Button>
      </div>
    </Card>
  );
}
