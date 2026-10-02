// Runtime validation for everything that comes from outside the code:
// decrypted storage, imported backups and the preset file.
import { z } from "zod";
import { SCHEMA_VERSION, type AppState } from "../types";

const centavos = z.number().int().safe();
const rate = z.number().min(0).max(1);
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");
const monthDay = z.string().regex(/^\d{2}-\d{2}$/, "Use MM-DD");
const id = z.string().min(1).max(64);
const text = (max = 120) => z.string().max(max);

export const appStateSchema = z.object({
  schemaVersion: z.literal(SCHEMA_VERSION),
  updatedAt: z.string(),
  profile: z.object({ name: text(60), role: text(80), city: text(80) }),
  dependents: z
    .array(
      z.object({
        id,
        name: text(60),
        relation: text(40),
        birthday: monthDay,
        birthYear: z.number().int().min(1900).max(2100).nullable(),
        note: text(300),
      }),
    )
    .max(20),
  income: z.object({
    monthlySalary: centavos.nonnegative(),
    basis: z.enum(["gross", "take-home", "unset"]),
    weekendRule: z.enum(["previous-business-day", "as-is"]),
  }),
  deductions: z.array(z.object({ id, name: text(60), monthly: centavos.nonnegative(), note: text(200) })).max(20),
  budget: z.object({ householdSupport: centavos.nonnegative().nullable(), essentials: centavos.nonnegative().nullable() }),
  debts: z
    .array(
      z.object({
        id,
        name: text(60),
        lender: text(60),
        kind: z.enum(["loan", "family", "credit"]),
        principal: centavos.nonnegative(),
        financeCost: centavos.nonnegative(),
        monthlyPayment: centavos.nonnegative(),
        autoDeduct: z.boolean(),
        termMonths: z.number().int().min(1).max(600).nullable(),
        startDate: isoDate.nullable(),
        dueDate: isoDate.nullable(),
        openingPaid: centavos.nonnegative(),
        openingPaidAsOf: isoDate.nullable(),
        annualCostRate: z.number().min(0).max(10),
        priority: z.number().int(),
        earnsPatronage: z.boolean(),
        note: text(300),
      }),
    )
    .max(50),
  payments: z.array(z.object({ id, debtId: id, amount: centavos.positive(), date: isoDate, note: text(200) })).max(5000),
  savings: z
    .array(
      z.object({
        id,
        name: text(60),
        balance: centavos,
        annualRate: rate,
        withholdingTax: rate,
        isEmergencyFund: z.boolean(),
        asOf: isoDate.nullable(),
      }),
    )
    .max(20),
  shareCapital: z.object({
    name: text(60),
    balance: centavos.nonnegative(),
    dividendRate: rate.nullable(),
    patronageRefundRate: rate,
    payoutDate: monthDay,
    asOf: isoDate.nullable(),
  }),
  mp2: z.object({
    balance: centavos.nonnegative(),
    monthlyContribution: centavos.nonnegative(),
    annualRate: rate,
    years: z.number().int().min(1).max(30),
    mode: z.enum(["compounded", "annual-payout"]),
    asOf: isoDate.nullable(),
  }),
  watchlist: z
    .array(
      z.object({
        id,
        ticker: text(12),
        name: text(60),
        price: centavos.nonnegative().nullable(),
        dividendYield: rate,
        dividendTax: rate,
        asOf: isoDate.nullable(),
      }),
    )
    .max(50),
  settings: z.object({
    autoLockMinutes: z.number().int().min(1).max(60),
    hideAmounts: z.boolean(),
    strategy: z.enum(["custom", "snowball", "avalanche"]),
    extraPerMonth: centavos.nonnegative().nullable(),
  }),
}) satisfies z.ZodType<AppState>;

/** Upgrade older saved data to the current schema. Add a case per new version. */
export function migrate(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") return raw;
  const data = raw as { schemaVersion?: number };
  switch (data.schemaVersion) {
    case SCHEMA_VERSION:
      return data;
    default:
      return data; // unknown version: let validation report it
  }
}

export type ParseResult = { ok: true; state: AppState } | { ok: false; error: string };

export function parseState(raw: unknown): ParseResult {
  const result = appStateSchema.safeParse(migrate(raw));
  if (result.success) return { ok: true, state: result.data };
  const issue = result.error.issues[0];
  return { ok: false, error: issue ? `${issue.path.join(".") || "file"}: ${issue.message}` : "Invalid data" };
}
