// The PUBLIC starting state: no personal numbers. Real values come from the
// private preset file (imported in Settings) or are typed in by the user.
import { SCHEMA_VERSION, type AppState } from "../types";

export const uid = () =>
  globalThis.crypto?.randomUUID?.().slice(0, 12) ?? Math.random().toString(36).slice(2, 14);

export function emptyState(): AppState {
  return {
    schemaVersion: SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
    profile: { name: "", role: "", city: "" },
    dependents: [],
    income: { monthlySalary: 0, basis: "unset", weekendRule: "previous-business-day" },
    // Statutory deductions: amounts are placeholders the user confirms from a payslip.
    deductions: [
      { id: "sss", name: "SSS", monthly: 0, note: "Employee share — check your payslip" },
      { id: "philhealth", name: "PhilHealth", monthly: 0, note: "Employee share — check your payslip" },
      { id: "pagibig", name: "Pag-IBIG", monthly: 0, note: "Employee share — check your payslip" },
      { id: "tax", name: "Withholding tax", monthly: 0, note: "Often ₱0 at lower salaries — check your payslip" },
    ],
    budget: { householdSupport: null, essentials: null },
    debts: [],
    payments: [],
    savings: [],
    shareCapital: {
      name: "Coop share capital",
      balance: 0,
      dividendRate: null,
      patronageRefundRate: 0,
      payoutDate: "12-15",
      asOf: null,
    },
    mp2: { balance: 0, monthlyContribution: 0, annualRate: 0.07, years: 5, mode: "compounded", asOf: null },
    watchlist: [],
    settings: { autoLockMinutes: 5, hideAmounts: false, strategy: "custom", extraPerMonth: null },
  };
}

/** True when the user hasn't entered anything yet. */
export const isEmpty = (s: AppState) => s.income.monthlySalary === 0 && s.debts.length === 0 && s.savings.length === 0;
