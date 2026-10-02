import type { AppState } from "../types";

export type Tab = "dashboard" | "debts" | "invest" | "settings";

export interface MissingInput {
  id: string;
  text: string;
  tab: Tab;
  anchor: string;
}

/** Numbers Pitaka still needs from the user to give accurate results. */
export function missingInputs(s: AppState): MissingInput[] {
  const out: MissingInput[] = [];
  if (s.income.monthlySalary > 0 && s.income.basis === "unset")
    out.push({ id: "basis", text: "Is your salary before or after SSS, PhilHealth, Pag-IBIG and tax?", tab: "settings", anchor: "income" });
  if (s.budget.householdSupport === null)
    out.push({ id: "household", text: "How much do you send for Mom & Lola each month?", tab: "settings", anchor: "budget" });
  if (s.budget.essentials === null)
    out.push({ id: "essentials", text: "What are your own monthly essentials?", tab: "settings", anchor: "budget" });
  for (const d of s.debts) {
    if (d.autoDeduct && !d.openingPaidAsOf && !d.startDate)
      out.push({ id: `paid-${d.id}`, text: `How much of the ${d.name} have you paid so far?`, tab: "settings", anchor: "debts" });
    if (d.kind === "credit" && !d.dueDate)
      out.push({ id: `due-${d.id}`, text: `When is ${d.name} due?`, tab: "settings", anchor: "debts" });
  }
  if (s.mp2.monthlyContribution > 0 && s.mp2.asOf === null)
    out.push({ id: "mp2", text: "What is your current Pag-IBIG MP2 balance?", tab: "invest", anchor: "mp2" });
  if (s.shareCapital.balance > 0 && s.shareCapital.dividendRate === null)
    out.push({ id: "coop-rate", text: "What dividend rate did your coop declare on share capital?", tab: "invest", anchor: "coop" });
  return out;
}
