import { describe, expect, it } from "vitest";
import type { AppState, Debt } from "../types";
import { emptyState } from "./defaults";
import { adjustForWeekend, nextAnniversary, nextPaydays, paydaysBetween, paydaysInMonth } from "./dates";
import {
  applySettlement,
  coopPayoutEstimate,
  debtBalance,
  dti,
  emergencyBuffer,
  monthlyDebtPayments,
  mp2Projection,
  netWorth,
  planCutoffs,
  projectPayoff,
  runwayMonths,
  savingsInterest,
  upcoming,
} from "./finance";
import { pesos, toCentavos } from "./money";
import { parseState } from "./schema";

// Synthetic test data (not anyone's real finances).
const loan = (over: Partial<Debt> = {}): Debt => ({
  id: "loan",
  name: "Coop loan",
  lender: "Coop",
  kind: "loan",
  principal: pesos(10_000),
  financeCost: pesos(2_000),
  monthlyPayment: pesos(1_000),
  autoDeduct: true,
  termMonths: 12,
  startDate: null,
  dueDate: null,
  openingPaid: 0,
  openingPaidAsOf: "2026-01-01",
  annualCostRate: 0.1,
  priority: 3,
  earnsPatronage: true,
  note: "",
  ...over,
});

function fixture(): AppState {
  const s = emptyState();
  s.income = { monthlySalary: pesos(20_000), basis: "take-home", weekendRule: "previous-business-day" };
  s.budget = { householdSupport: pesos(6_000), essentials: pesos(4_000) };
  s.debts = [
    loan(),
    { ...loan(), id: "fam", name: "Family", kind: "family", principal: pesos(5_000), financeCost: 0, monthlyPayment: 0, autoDeduct: false, openingPaidAsOf: null, earnsPatronage: false, priority: 1, annualCostRate: 0 },
    { ...loan(), id: "cc", name: "Credit", kind: "credit", principal: pesos(1_500), financeCost: 0, monthlyPayment: 0, autoDeduct: false, dueDate: "2026-02-20", openingPaidAsOf: null, earnsPatronage: false, priority: 2, annualCostRate: 0 },
  ];
  s.savings = [{ id: "sv", name: "Savings", balance: pesos(20_000), annualRate: 0.04, withholdingTax: 0.2, isEmergencyFund: true, asOf: null }];
  s.shareCapital = { ...s.shareCapital, balance: pesos(2_000), dividendRate: 0.05, patronageRefundRate: 0.1 };
  s.mp2 = { ...s.mp2, monthlyContribution: pesos(500) };
  return s;
}

describe("money", () => {
  it("parses peso strings to integer centavos", () => {
    expect(toCentavos("1,250.50")).toBe(125_050);
    expect(toCentavos("₱ 19,000")).toBe(1_900_000);
    expect(toCentavos("abc")).toBeNull();
    expect(toCentavos(0.1 + 0.2)).toBe(30);
  });
});

describe("paydays", () => {
  it("uses the last day when a month has no 30th", () => {
    expect(paydaysInMonth(2027, 2, "as-is").map((p) => p.date)).toEqual(["2027-02-15", "2027-02-28"]);
  });
  it("moves weekend paydays to the previous Friday", () => {
    // 2026-11-15 is a Sunday
    expect(adjustForWeekend("2026-11-15", "previous-business-day")).toBe("2026-11-13");
    expect(adjustForWeekend("2026-11-15", "as-is")).toBe("2026-11-15");
  });
  it("lists the next paydays from a date", () => {
    expect(nextPaydays("2026-10-02", 3, "previous-business-day").map((p) => p.date)).toEqual(["2026-10-15", "2026-10-30", "2026-11-13"]);
  });
  it("counts paydays in a half-open range", () => {
    expect(paydaysBetween("2026-01-01", "2026-01-31", "as-is").length).toBe(2);
    expect(paydaysBetween("2026-01-15", "2026-01-31", "as-is").length).toBe(1);
  });
  it("finds the next anniversary across a year end", () => {
    expect(nextAnniversary("02-16", "2026-10-02")).toBe("2027-02-16");
    expect(nextAnniversary("11-27", "2026-10-02")).toBe("2026-11-27");
  });
});

describe("debts", () => {
  it("reduces auto-deduct loans on each payday", () => {
    const s = fixture();
    // Jan 15, Jan 30, Feb 13 (Feb 15 2026 is a Sunday) => 3 × ₱500
    expect(debtBalance(s.debts[0]!, s, "2026-02-14")).toBe(pesos(12_000 - 1_500));
  });
  it("never goes below zero", () => {
    const s = fixture();
    expect(debtBalance(s.debts[0]!, s, "2030-01-01")).toBe(0);
  });
  it("counts manual payments", () => {
    const s = fixture();
    s.payments.push({ id: "p", debtId: "fam", amount: pesos(1_000), date: "2026-02-01", note: "" });
    expect(debtBalance(s.debts[1]!, s, "2026-02-02")).toBe(pesos(4_000));
  });
  it("computes DTI from required monthly payments", () => {
    const s = fixture();
    // loan ₱1,000 + credit due in full ₱1,500 = ₱2,500 / ₱20,000
    expect(monthlyDebtPayments(s, "2026-02-01")).toBe(pesos(2_500));
    expect(dti(s, "2026-02-01")).toBeCloseTo(0.125);
  });
  it("net worth = assets − debts", () => {
    const s = fixture();
    // assets 20,000 + 2,000 ; debts 12,000 + 5,000 + 1,500 (as of the tracking start)
    expect(netWorth(s, "2026-01-01")).toBe(pesos(22_000 - 18_500));
  });
});

describe("runway", () => {
  it("is buffer ÷ monthly support + essentials", () => {
    expect(runwayMonths(fixture())).toBeCloseTo(2);
  });
  it("is unknown until expenses are entered", () => {
    const s = fixture();
    s.budget = { householdSupport: null, essentials: null };
    expect(runwayMonths(s)).toBeNull();
  });
});

describe("payday plan", () => {
  it("pays bills due before the next payday from the earlier cutoff, then the priority debt", () => {
    const s = fixture();
    const [first, second] = planCutoffs(s, "2026-02-02");
    expect(first!.payday.date).toBe("2026-02-13");
    expect(first!.net).toBe(pesos(10_000 - 500));
    const labels = first!.allocations.map((a) => a.label);
    expect(labels[0]).toBe("Credit"); // due Feb 20, before the Feb 27 payday
    expect(labels).toContain("Family");
    expect(second!.allocations.map((a) => a.label)).not.toContain("Credit");
    // Everything is allocated: leftover is zero (no shortfall)
    expect(first!.leftover).toBe(0);
  });
});

describe("payoff projection", () => {
  it("is debt-free sooner with an extra monthly amount", () => {
    const s = fixture();
    const none = projectPayoff(s, "2026-01-01", "custom", 0);
    const extra = projectPayoff(s, "2026-01-01", "custom", pesos(2_000));
    expect(none.debtFreeMonth).toBeNull(); // family debt has no schedule
    expect(extra.debtFreeMonth).not.toBeNull();
    expect(extra.points.at(-1)!.total).toBe(0);
  });
  it("snowball pays the smallest balance first", () => {
    const s = fixture();
    const p = projectPayoff(s, "2026-01-01", "snowball", pesos(1_000));
    expect(p.payoffMonth.cc! <= p.payoffMonth.fam!).toBe(true);
  });
});

describe("what-if", () => {
  it("settling from savings keeps net worth but lowers the buffer", () => {
    const s = fixture();
    const after = applySettlement(s, ["fam"], "2026-01-01", true);
    expect(netWorth(after, "2026-01-01")).toBe(netWorth(s, "2026-01-01"));
    expect(emergencyBuffer(after)).toBe(pesos(15_000));
    expect(s.payments.length).toBe(0); // original untouched
  });
});

describe("investments", () => {
  it("MP2 compounded: year 1 dividend on the average balance", () => {
    const rows = mp2Projection(0, pesos(500), 0.07, 5, "compounded");
    expect(rows[0]!.dividend).toBe(pesos(227.5)); // 7% × (500 × 6.5)
    expect(rows[0]!.balance).toBe(pesos(6_227.5));
    expect(rows[4]!.contributed).toBe(pesos(30_000));
    expect(rows[4]!.balance).toBeGreaterThan(pesos(35_000));
  });
  it("MP2 annual payout keeps the balance equal to contributions", () => {
    const rows = mp2Projection(0, pesos(500), 0.07, 5, "annual-payout");
    expect(rows[4]!.balance).toBe(pesos(30_000));
    expect(rows[4]!.dividends).toBeGreaterThan(0);
  });
  it("savings interest applies withholding tax", () => {
    const r = savingsInterest(pesos(10_000), 0.0365, 0.2);
    expect(r.dailyGross).toBeCloseTo(100); // centavos = ₱1.00/day
    expect(r.dailyNet).toBeCloseTo(80);
    expect(r.yearlyNet).toBeLessThan(r.yearlyGross);
  });
  it("estimates the coop payout from share capital and loan interest", () => {
    const s = fixture();
    const est = coopPayoutEstimate(s, "2026-06-01");
    expect(est.payoutDate).toBe("2026-12-15");
    expect(est.dividend).toBe(pesos(100)); // 5% × 2,000
    expect(est.interestPaid).toBeGreaterThan(0);
    expect(est.patronage).toBe(Math.round(est.interestPaid * 0.1));
  });
});

describe("upcoming", () => {
  it("lists paydays, dues and birthdays with the senior-citizen reminder at 60", () => {
    const s = fixture();
    s.dependents = [{ id: "m", name: "Mom", relation: "Mother", birthday: "02-27", birthYear: 1966, note: "" }];
    s.debts[2]!.dueDate = "2026-02-20";
    const ev = upcoming(s, "2026-02-01", 60);
    expect(ev.some((e) => e.kind === "payday")).toBe(true);
    expect(ev.some((e) => e.kind === "due" && e.title.startsWith("Credit"))).toBe(true);
    const bday = ev.find((e) => e.kind === "birthday")!;
    expect(bday.title).toContain("turns 60");
    expect(bday.detail).toContain("Senior Citizen");
  });
});

describe("schema", () => {
  it("accepts a valid state and rejects bad money", () => {
    expect(parseState(fixture()).ok).toBe(true);
    const bad = fixture() as unknown as { income: { monthlySalary: number } };
    bad.income.monthlySalary = 12.5; // not integer centavos
    expect(parseState(bad).ok).toBe(false);
  });
});
