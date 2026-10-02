// Pitaka data model.
// Money is ALWAYS integer centavos (₱1.00 = 100) to avoid floating-point drift.
// Rates are decimals (4.5% = 0.045). Dates are "YYYY-MM-DD" in Asia/Manila.

export type Centavos = number;
export type ISODate = string; // "2026-10-15"
export type MonthDay = string; // "11-27"

export const SCHEMA_VERSION = 1 as const;

export interface Profile {
  name: string;
  role: string;
  city: string;
}

export interface Dependent {
  id: string;
  name: string;
  relation: string;
  birthday: MonthDay;
  birthYear: number | null;
  note: string;
}

export type SalaryBasis = "gross" | "take-home" | "unset";
export type WeekendRule = "previous-business-day" | "as-is";

export interface Income {
  monthlySalary: Centavos;
  /** Is monthlySalary before (gross) or after (take-home) SSS/PhilHealth/Pag-IBIG/tax? */
  basis: SalaryBasis;
  /** Paydays: the 15th and the 30th (or the month's last day when it has no 30th). */
  weekendRule: WeekendRule;
}

/** Statutory deductions. Only applied when the salary basis is "gross". */
export interface Deduction {
  id: string;
  name: string;
  monthly: Centavos;
  note: string;
}

export interface Budget {
  /** Monthly support sent to Mom & Lola. null = not entered yet. */
  householdSupport: Centavos | null;
  /** Arvin's own monthly essentials (food, transport, load, bills). null = not entered yet. */
  essentials: Centavos | null;
}

export type DebtKind = "loan" | "family" | "credit";

export interface Debt {
  id: string;
  name: string;
  lender: string;
  kind: DebtKind;
  /** Amount borrowed. */
  principal: Centavos;
  /** Interest / finance charges over the whole term (add-on loans). 0 for interest-free debts. */
  financeCost: Centavos;
  /** Scheduled payment per month; 0 if there is no schedule (e.g. family debt). */
  monthlyPayment: Centavos;
  /** Paid automatically from each payday (e.g. coop loan via payroll). */
  autoDeduct: boolean;
  termMonths: number | null;
  startDate: ISODate | null;
  dueDate: ISODate | null;
  /** Amount already paid before tracking started, as of `openingPaidAsOf`. */
  openingPaid: Centavos;
  openingPaidAsOf: ISODate | null;
  /** Annual cost in % for the avalanche strategy (0 = interest-free). */
  annualCostRate: number;
  /** Lower number = pay first in the "custom" strategy. */
  priority: number;
  /** Interest paid on this loan earns the coop's patronage refund. */
  earnsPatronage: boolean;
  note: string;
}

export interface Payment {
  id: string;
  debtId: string;
  amount: Centavos;
  date: ISODate;
  note: string;
}

export interface SavingsAccount {
  id: string;
  name: string;
  balance: Centavos;
  annualRate: number;
  /** Final withholding tax on interest (PH banks/e-wallets: 20%). */
  withholdingTax: number;
  isEmergencyFund: boolean;
  asOf: ISODate | null;
}

export interface ShareCapital {
  name: string;
  balance: Centavos;
  /** Interest on share capital declared by the coop. null = not known yet. */
  dividendRate: number | null;
  /** Patronage refund as a share of loan interest paid during the year. */
  patronageRefundRate: number;
  payoutDate: MonthDay;
  asOf: ISODate | null;
}

export type Mp2Mode = "compounded" | "annual-payout";

export interface Mp2Account {
  balance: Centavos;
  monthlyContribution: Centavos;
  annualRate: number;
  years: number;
  mode: Mp2Mode;
  asOf: ISODate | null;
}

export interface WatchItem {
  id: string;
  ticker: string;
  name: string;
  price: Centavos | null;
  dividendYield: number;
  /** Final tax on REIT cash dividends for individuals. */
  dividendTax: number;
  asOf: ISODate | null;
}

export type Strategy = "custom" | "snowball" | "avalanche";

export interface Settings {
  autoLockMinutes: number;
  hideAmounts: boolean;
  strategy: Strategy;
  /** Extra amount per month put toward debts on top of scheduled payments. null = use suggested leftover. */
  extraPerMonth: Centavos | null;
}

export interface AppState {
  schemaVersion: typeof SCHEMA_VERSION;
  updatedAt: string;
  profile: Profile;
  dependents: Dependent[];
  income: Income;
  deductions: Deduction[];
  budget: Budget;
  debts: Debt[];
  payments: Payment[];
  savings: SavingsAccount[];
  shareCapital: ShareCapital;
  mp2: Mp2Account;
  watchlist: WatchItem[];
  settings: Settings;
}
