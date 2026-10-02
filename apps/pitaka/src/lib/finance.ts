// Pitaka's money math. Pure functions only: no React, no storage, no clock.
// Every function takes `today` explicitly so results are testable and stable.
import type { AppState, Centavos, Debt, ISODate, Mp2Mode, Strategy } from "../types";
import { addMonths, fmtShort, nextAnniversary, nextPaydays, paydaysBetween, type Payday } from "./dates";
import { roundC, sum } from "./money";

/* ------------------------------------------------------------------ */
/* Debts                                                                */
/* ------------------------------------------------------------------ */

export const totalPayable = (d: Debt): Centavos => d.principal + d.financeCost;

/** Share of each peso paid that is interest/finance charge (add-on loans). */
export const financeShare = (d: Debt) => (totalPayable(d) > 0 ? d.financeCost / totalPayable(d) : 0);

/** Payroll deductions that have happened since tracking started (auto-deduct loans only). */
export function autoDeducted(d: Debt, today: ISODate, state: Pick<AppState, "income">): Centavos {
  if (!d.autoDeduct || d.monthlyPayment <= 0) return 0;
  const from = d.openingPaidAsOf ?? d.startDate;
  if (!from) return 0; // we don't know when deductions began; ask the user
  const perCutoff = d.monthlyPayment / 2;
  return roundC(paydaysBetween(from, today, state.income.weekendRule).length * perCutoff);
}

export function paidSoFar(d: Debt, state: Pick<AppState, "payments" | "income">, today: ISODate): Centavos {
  const manual = sum(state.payments.filter((p) => p.debtId === d.id && p.date <= today).map((p) => p.amount));
  return Math.min(totalPayable(d), d.openingPaid + autoDeducted(d, today, state) + manual);
}

/** What is still owed (including remaining finance charges). */
export const debtBalance = (d: Debt, state: Pick<AppState, "payments" | "income">, today: ISODate): Centavos =>
  Math.max(0, totalPayable(d) - paidSoFar(d, state, today));

export const totalDebt = (state: AppState, today: ISODate): Centavos =>
  sum(state.debts.map((d) => debtBalance(d, state, today)));

export function debtProgress(state: AppState, today: ISODate) {
  const original = sum(state.debts.map(totalPayable));
  const remaining = totalDebt(state, today);
  return { original, remaining, paid: original - remaining, ratio: original > 0 ? (original - remaining) / original : 1 };
}

/** This month's required debt payments (for DTI). Credit lines due in full count in full. */
export function monthlyDebtPayments(state: AppState, today: ISODate): Centavos {
  return sum(
    state.debts.map((d) => {
      const bal = debtBalance(d, state, today);
      if (bal === 0) return 0;
      if (d.monthlyPayment > 0) return Math.min(d.monthlyPayment, bal);
      if (d.kind === "credit" && d.dueDate) return bal;
      return 0;
    }),
  );
}

/** Debt-to-income: required monthly debt payments ÷ monthly salary. */
export function dti(state: AppState, today: ISODate): number | null {
  if (state.income.monthlySalary <= 0) return null;
  return monthlyDebtPayments(state, today) / state.income.monthlySalary;
}

export const dtiLevel = (r: number | null): "good" | "warn" | "bad" | "unknown" =>
  r === null ? "unknown" : r < 0.2 ? "good" : r <= 0.35 ? "warn" : "bad";

/* ------------------------------------------------------------------ */
/* Assets, net worth, runway                                            */
/* ------------------------------------------------------------------ */

export const emergencyBuffer = (state: AppState): Centavos =>
  sum(state.savings.filter((s) => s.isEmergencyFund).map((s) => s.balance));

export const totalAssets = (state: AppState): Centavos =>
  sum(state.savings.map((s) => s.balance)) + state.shareCapital.balance + state.mp2.balance;

export const netWorth = (state: AppState, today: ISODate): Centavos => totalAssets(state) - totalDebt(state, today);

export const monthlyExpenses = (state: AppState): Centavos | null => {
  const { householdSupport, essentials } = state.budget;
  if (householdSupport === null && essentials === null) return null;
  return (householdSupport ?? 0) + (essentials ?? 0);
};

/** Months the emergency buffer covers household support + essentials. */
export function runwayMonths(state: AppState): number | null {
  const exp = monthlyExpenses(state);
  if (exp === null || exp <= 0) return null;
  return emergencyBuffer(state) / exp;
}

/* ------------------------------------------------------------------ */
/* Paydays                                                              */
/* ------------------------------------------------------------------ */

export const statutoryMonthly = (state: AppState): Centavos =>
  state.income.basis === "gross" ? sum(state.deductions.map((d) => d.monthly)) : 0;

export const takeHomeMonthly = (state: AppState): Centavos => state.income.monthlySalary - statutoryMonthly(state);

export interface Allocation {
  label: string;
  amount: Centavos;
  kind: "bill" | "household" | "essentials" | "mp2" | "debt" | "savings";
  note?: string;
  warn?: boolean;
}

export interface CutoffPlan {
  payday: Payday;
  gross: Centavos;
  statutory: Centavos;
  autoDebts: { name: string; amount: Centavos }[];
  net: Centavos;
  allocations: Allocation[];
  leftover: Centavos; // negative = shortfall
}

/** Pay plan for the next two paydays, with suggested allocations in priority order. */
export function planCutoffs(state: AppState, today: ISODate, strategy: Strategy = state.settings.strategy): CutoffPlan[] {
  const days = nextPaydays(today, 3, state.income.weekendRule);
  const allocatedTo = new Map<string, Centavos>();
  const order = orderDebts(state, today, strategy);

  return [0, 1].map((i) => {
    const payday = days[i]!;
    const nextDate = days[i + 1]!.date;
    const gross = roundC(state.income.monthlySalary / 2);
    const statutory = roundC(statutoryMonthly(state) / 2);

    const autoDebts = state.debts
      .filter((d) => d.autoDeduct && d.monthlyPayment > 0)
      .map((d) => {
        // Balance just before this payday's deduction.
        const remaining = debtBalance(d, state, addDaysISO(payday.date, -1));
        return { name: d.name, amount: Math.min(roundC(d.monthlyPayment / 2), Math.max(0, remaining)) };
      })
      .filter((a) => a.amount > 0);

    const net = gross - statutory - sum(autoDebts.map((a) => a.amount));
    const allocations: Allocation[] = [];

    // 1. Bills due before the following payday (and anything already due).
    for (const d of state.debts) {
      if (d.autoDeduct || !d.dueDate) continue;
      const bal = debtBalance(d, state, today) - (allocatedTo.get(d.id) ?? 0);
      if (bal <= 0) continue;
      const inWindow = d.dueDate < nextDate && (i === 0 || d.dueDate >= payday.date);
      if (!inWindow) continue;
      const late = d.dueDate < payday.date;
      allocations.push({
        label: d.name,
        amount: bal,
        kind: "bill",
        note: late ? `Due ${fmtShort(d.dueDate)}, before this payday: pay from savings if needed` : `Due ${fmtShort(d.dueDate)}`,
        warn: late,
      });
      allocatedTo.set(d.id, (allocatedTo.get(d.id) ?? 0) + bal);
    }

    // 2. Household support and own essentials (half per cutoff).
    if (state.budget.householdSupport)
      allocations.push({ label: "Support for Mom & Lola", amount: roundC(state.budget.householdSupport / 2), kind: "household" });
    if (state.budget.essentials)
      allocations.push({ label: "My essentials", amount: roundC(state.budget.essentials / 2), kind: "essentials" });

    // 3. MP2 once a month, from the 15th.
    if (payday.cutoff === 1 && state.mp2.monthlyContribution > 0)
      allocations.push({ label: "Pag-IBIG MP2", amount: state.mp2.monthlyContribution, kind: "mp2" });

    let left = net - sum(allocations.map((a) => a.amount));

    // 4. Leftover → the top-priority debt without a due date (e.g. Mom's debt), then savings.
    if (left > 0) {
      const target = order.find(
        (d) => !d.autoDeduct && !d.dueDate && debtBalance(d, state, today) - (allocatedTo.get(d.id) ?? 0) > 0,
      );
      if (target) {
        const room = debtBalance(target, state, today) - (allocatedTo.get(target.id) ?? 0);
        const amt = Math.min(left, room);
        allocations.push({ label: target.name, amount: amt, kind: "debt", note: "Priority debt" });
        allocatedTo.set(target.id, (allocatedTo.get(target.id) ?? 0) + amt);
        left -= amt;
      }
    }
    if (left > 0) {
      allocations.push({ label: "Savings / emergency fund", amount: left, kind: "savings" });
      left = 0;
    }

    return { payday, gross, statutory, autoDebts, net, allocations, leftover: left };
  });
}

/** Money left each month after statutory deductions, payroll debts, support, essentials and MP2. */
export function monthlySurplus(state: AppState, today: ISODate): Centavos | null {
  const exp = monthlyExpenses(state);
  if (exp === null) return null;
  const autoDebts = sum(
    state.debts.filter((d) => d.autoDeduct && debtBalance(d, state, today) > 0).map((d) => d.monthlyPayment),
  );
  return takeHomeMonthly(state) - autoDebts - exp - state.mp2.monthlyContribution;
}

/* ------------------------------------------------------------------ */
/* Payoff strategy & projection                                         */
/* ------------------------------------------------------------------ */

export function orderDebts(state: AppState, today: ISODate, strategy: Strategy): Debt[] {
  const bal = (d: Debt) => debtBalance(d, state, today);
  const list = [...state.debts];
  if (strategy === "snowball") return list.sort((a, b) => bal(a) - bal(b));
  if (strategy === "avalanche") return list.sort((a, b) => b.annualCostRate - a.annualCostRate || bal(a) - bal(b));
  return list.sort((a, b) => a.priority - b.priority);
}

export interface ProjectionPoint {
  month: ISODate; // first day of the month
  total: Centavos;
}

export interface Projection {
  points: ProjectionPoint[];
  debtFreeMonth: ISODate | null;
  payoffMonth: Record<string, ISODate | null>;
}

/**
 * Month-by-month payoff: scheduled payments first, credit lines in full in the
 * month they're due, then `extraPerMonth` toward debts in strategy order.
 */
export function projectPayoff(
  state: AppState,
  today: ISODate,
  strategy: Strategy,
  extraPerMonth: Centavos,
  maxMonths = 120,
): Projection {
  const order = orderDebts(state, today, strategy);
  const bal = new Map(order.map((d) => [d.id, debtBalance(d, state, today)]));
  const payoffMonth: Record<string, ISODate | null> = Object.fromEntries(
    order.map((d) => [d.id, bal.get(d.id)! === 0 ? today.slice(0, 8) + "01" : null]),
  );
  const start = today.slice(0, 8) + "01";
  const total = () => sum([...bal.values()]);
  const points: ProjectionPoint[] = [{ month: start, total: total() }];

  for (let m = 0; m < maxMonths && total() > 0; m++) {
    const month = addMonths(start, m);
    const monthEnd = addMonths(start, m + 1);
    for (const d of order) {
      const b = bal.get(d.id)!;
      if (b <= 0) continue;
      let pay = 0;
      if (d.monthlyPayment > 0) pay = d.monthlyPayment;
      else if (d.kind === "credit" && d.dueDate && d.dueDate < monthEnd) pay = b; // due this month (or overdue)
      bal.set(d.id, Math.max(0, b - pay));
    }
    let extra = extraPerMonth;
    for (const d of order) {
      if (extra <= 0) break;
      const b = bal.get(d.id)!;
      if (b <= 0) continue;
      const pay = Math.min(b, extra);
      bal.set(d.id, b - pay);
      extra -= pay;
    }
    for (const d of order) if (bal.get(d.id)! === 0 && payoffMonth[d.id] === null) payoffMonth[d.id] = month;
    points.push({ month: monthEnd, total: total() });
  }
  return { points, debtFreeMonth: total() === 0 ? points[points.length - 1]!.month : null, payoffMonth };
}

/** A copy of the state with the chosen debts settled today (optionally paid from the emergency fund). */
export function applySettlement(state: AppState, debtIds: string[], today: ISODate, fromSavings: boolean): AppState {
  const payments = [...state.payments];
  let cost = 0;
  for (const id of debtIds) {
    const d = state.debts.find((x) => x.id === id);
    if (!d) continue;
    const b = debtBalance(d, state, today);
    if (b <= 0) continue;
    cost += b;
    payments.push({ id: `whatif-${id}`, debtId: id, amount: b, date: today, note: "what-if" });
  }
  let savings = state.savings;
  if (fromSavings && cost > 0) {
    let remaining = cost;
    savings = state.savings.map((s) => {
      if (!s.isEmergencyFund || remaining <= 0) return s;
      const take = Math.min(s.balance, remaining);
      remaining -= take;
      return { ...s, balance: s.balance - take };
    });
    if (remaining > 0) {
      // Not enough savings: show the hole as a negative balance on the first emergency account.
      const idx = savings.findIndex((s) => s.isEmergencyFund);
      if (idx >= 0) savings = savings.map((s, i) => (i === idx ? { ...s, balance: s.balance - remaining } : s));
    }
  }
  return { ...state, payments, savings };
}

/* ------------------------------------------------------------------ */
/* Investments                                                          */
/* ------------------------------------------------------------------ */

export interface Mp2Row {
  year: number;
  contributed: Centavos; // cumulative
  dividend: Centavos; // earned this year
  dividends: Centavos; // cumulative
  balance: Centavos; // end of year (after payout in annual-payout mode)
}

/**
 * MP2 estimate. Monthly contributions at the start of each month; the yearly
 * dividend is the rate × the year's average monthly balance
 * (opening balance + 6.5 × the monthly contribution). Compounded mode adds the
 * dividend to the balance; annual-payout mode pays it out.
 */
export function mp2Projection(opening: Centavos, monthly: Centavos, rate: number, years: number, mode: Mp2Mode): Mp2Row[] {
  const rows: Mp2Row[] = [];
  let balance = opening;
  let contributed = opening;
  let dividends = 0;
  for (let y = 1; y <= years; y++) {
    const avg = balance + monthly * 6.5;
    const dividend = roundC(avg * rate);
    contributed += monthly * 12;
    balance += monthly * 12 + (mode === "compounded" ? dividend : 0);
    dividends += dividend;
    rows.push({ year: y, contributed, dividend, dividends, balance });
  }
  return rows;
}

export interface InterestBreakdown {
  dailyGross: number;
  dailyNet: number;
  monthlyGross: number;
  monthlyNet: number;
  yearlyGross: number;
  yearlyNet: number;
}

/** Savings interest credited daily, with final withholding tax deducted on each credit. */
export function savingsInterest(balance: Centavos, annualRate: number, tax: number): InterestBreakdown {
  const dailyRate = annualRate / 365;
  const netDaily = dailyRate * (1 - tax);
  return {
    dailyGross: balance * dailyRate,
    dailyNet: balance * netDaily,
    monthlyGross: balance * (Math.pow(1 + dailyRate, 365 / 12) - 1),
    monthlyNet: balance * (Math.pow(1 + netDaily, 365 / 12) - 1),
    yearlyGross: balance * (Math.pow(1 + dailyRate, 365) - 1),
    yearlyNet: balance * (Math.pow(1 + netDaily, 365) - 1),
  };
}

/** Finance charges paid to the coop between Jan 1 and `until` (for the patronage refund). */
export function patronageInterest(state: AppState, until: ISODate): Centavos {
  const yearStart = `${until.slice(0, 4)}-01-01`;
  return roundC(
    sum(
      state.debts
        .filter((d) => d.earnsPatronage)
        .map((d) => {
          const share = financeShare(d);
          // Recorded payments this year
          const manual = sum(
            state.payments.filter((p) => p.debtId === d.id && p.date >= yearStart && p.date <= until).map((p) => p.amount),
          );
          // Payroll deductions this year (actual up to today, scheduled after)
          let auto = 0;
          if (d.autoDeduct && d.monthlyPayment > 0) {
            const from = d.openingPaidAsOf ?? d.startDate;
            if (from) {
              const after = from > yearStart ? from : addDaysISO(yearStart, -1);
              const n = paydaysBetween(after, until, state.income.weekendRule).length;
              const cap = Math.max(0, totalPayable(d) - d.openingPaid);
              auto = Math.min(cap, n * (d.monthlyPayment / 2));
            }
          }
          // Opening amount counts if it was paid this year
          const opening = d.openingPaidAsOf && d.openingPaidAsOf >= yearStart && (!d.startDate || d.startDate >= yearStart) ? d.openingPaid : 0;
          return (manual + auto + opening) * share;
        }),
    ),
  );
}

const addDaysISO = (d: ISODate, n: number) => {
  const x = new Date(`${d}T12:00:00Z`);
  x.setUTCDate(x.getUTCDate() + n);
  return x.toISOString().slice(0, 10);
};

export function coopPayoutEstimate(state: AppState, today: ISODate) {
  const payout = nextAnniversary(state.shareCapital.payoutDate, today);
  const dividend = state.shareCapital.dividendRate === null ? null : roundC(state.shareCapital.balance * state.shareCapital.dividendRate);
  const interest = patronageInterest(state, payout);
  const patronage = roundC(interest * state.shareCapital.patronageRefundRate);
  return { payoutDate: payout, dividend, interestPaid: interest, patronage, total: (dividend ?? 0) + patronage };
}

/* ------------------------------------------------------------------ */
/* Upcoming                                                             */
/* ------------------------------------------------------------------ */

export interface UpcomingEvent {
  date: ISODate;
  title: string;
  detail?: string;
  kind: "payday" | "due" | "birthday" | "payout";
  amount?: Centavos;
  warn?: boolean;
}

export function upcoming(state: AppState, today: ISODate, horizonDays = 60): UpcomingEvent[] {
  const until = addDaysISO(today, horizonDays);
  const ev: UpcomingEvent[] = [];

  for (const p of nextPaydays(today, 6, state.income.weekendRule))
    if (p.date <= until && state.income.monthlySalary > 0)
      ev.push({
        date: p.date,
        title: p.cutoff === 1 ? "Payday (kinsenas)" : "Payday (katapusan)",
        detail: p.date !== p.nominal ? `Moved from ${fmtShort(p.nominal)} (weekend)` : undefined,
        kind: "payday",
        amount: roundC(takeHomeMonthly(state) / 2),
      });

  for (const d of state.debts) {
    if (!d.dueDate) continue;
    const bal = debtBalance(d, state, today);
    if (bal <= 0 || d.dueDate > until) continue;
    ev.push({ date: d.dueDate, title: `${d.name} due`, kind: "due", amount: bal, warn: d.dueDate < today });
  }

  for (const p of state.dependents) {
    if (!p.birthday) continue;
    const date = nextAnniversary(p.birthday, today);
    if (date > until) continue;
    const age = p.birthYear ? Number(date.slice(0, 4)) - p.birthYear : null;
    ev.push({
      date,
      title: `${p.name}'s birthday${age ? ` — turns ${age}` : ""}`,
      detail: age === 60 ? "Apply for her Senior Citizen ID at the local OSCA office (20% discount + VAT exemption on many purchases)." : p.note || undefined,
      kind: "birthday",
    });
  }

  const coop = coopPayoutEstimate(state, today);
  if (coop.payoutDate <= until && state.shareCapital.balance > 0)
    ev.push({ date: coop.payoutDate, title: `${state.shareCapital.name} payout (estimate)`, kind: "payout", amount: coop.total });

  return ev.sort((a, b) => a.date.localeCompare(b.date));
}
