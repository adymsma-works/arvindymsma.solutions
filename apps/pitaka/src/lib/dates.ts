import type { ISODate, MonthDay, WeekendRule } from "../types";

// Everything is evaluated in Philippine time, regardless of the device's zone.
const TZ = "Asia/Manila";
const isoFmt = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });

/** Today's date in Manila as "YYYY-MM-DD". */
export const todayManila = (now: Date = new Date()): ISODate => isoFmt.format(now);

// Calendar math on plain dates (UTC noon avoids DST/zone edge cases).
export const parseISO = (d: ISODate) => {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(Date.UTC(y!, m! - 1, day!, 12));
};
export const toISO = (d: Date): ISODate => d.toISOString().slice(0, 10);

export const addDays = (d: ISODate, n: number): ISODate => {
  const x = parseISO(d);
  x.setUTCDate(x.getUTCDate() + n);
  return toISO(x);
};

export const daysBetween = (a: ISODate, b: ISODate) =>
  Math.round((parseISO(b).getTime() - parseISO(a).getTime()) / 86_400_000);

export const lastDayOfMonth = (y: number, m1: number) => new Date(Date.UTC(y, m1, 0)).getUTCDate();

const pad = (n: number) => String(n).padStart(2, "0");
export const ymd = (y: number, m1: number, d: number): ISODate => `${y}-${pad(m1)}-${pad(d)}`;

/** Move a Saturday/Sunday payday to the previous Friday. */
export function adjustForWeekend(d: ISODate, rule: WeekendRule): ISODate {
  if (rule === "as-is") return d;
  const dow = parseISO(d).getUTCDay(); // 0 Sun .. 6 Sat
  if (dow === 6) return addDays(d, -1);
  if (dow === 0) return addDays(d, -2);
  return d;
}

export interface Payday {
  /** The actual pay date after the weekend rule. */
  date: ISODate;
  /** The nominal date (15th or 30th/last day). */
  nominal: ISODate;
  /** 1 = the 15th ("kinsenas"), 2 = the 30th ("katapusan"). */
  cutoff: 1 | 2;
}

/** Paydays for a given month: the 15th and the 30th (or the last day if shorter). */
export function paydaysInMonth(y: number, m1: number, rule: WeekendRule): Payday[] {
  const first = ymd(y, m1, 15);
  const second = ymd(y, m1, Math.min(30, lastDayOfMonth(y, m1)));
  return [
    { date: adjustForWeekend(first, rule), nominal: first, cutoff: 1 },
    { date: adjustForWeekend(second, rule), nominal: second, cutoff: 2 },
  ];
}

/** The next `count` paydays on or after `from`. */
export function nextPaydays(from: ISODate, count: number, rule: WeekendRule): Payday[] {
  const out: Payday[] = [];
  let [y, m] = from.split("-").map(Number) as [number, number];
  while (out.length < count) {
    for (const p of paydaysInMonth(y, m, rule)) if (p.date >= from && out.length < count) out.push(p);
    m += 1;
    if (m > 12) { m = 1; y += 1; }
  }
  return out;
}

/** Paydays strictly after `after` and on or before `until`. */
export function paydaysBetween(after: ISODate, until: ISODate, rule: WeekendRule): Payday[] {
  if (until <= after) return [];
  const out: Payday[] = [];
  let [y, m] = after.split("-").map(Number) as [number, number];
  for (;;) {
    for (const p of paydaysInMonth(y, m, rule)) {
      if (p.date > until) return out;
      if (p.date > after) out.push(p);
    }
    m += 1;
    if (m > 12) { m = 1; y += 1; }
  }
}

/** Next occurrence of a yearly date ("11-27") on or after `from`. */
export function nextAnniversary(md: MonthDay, from: ISODate): ISODate {
  const y = Number(from.slice(0, 4));
  const [mm, dd] = md.split("-").map(Number) as [number, number];
  const fit = (yr: number) => ymd(yr, mm, Math.min(dd, lastDayOfMonth(yr, mm)));
  const thisYear = fit(y);
  return thisYear >= from ? thisYear : fit(y + 1);
}

export const addMonths = (d: ISODate, n: number): ISODate => {
  const [y, m, day] = d.split("-").map(Number) as [number, number, number];
  const total = y * 12 + (m - 1) + n;
  const ny = Math.floor(total / 12);
  const nm = (total % 12) + 1;
  return ymd(ny, nm, Math.min(day, lastDayOfMonth(ny, nm)));
};

const longFmt = new Intl.DateTimeFormat("en-PH", { timeZone: "UTC", month: "short", day: "numeric", year: "numeric" });
const shortFmt = new Intl.DateTimeFormat("en-PH", { timeZone: "UTC", month: "short", day: "numeric" });
const dowFmt = new Intl.DateTimeFormat("en-PH", { timeZone: "UTC", weekday: "short" });
const monthYearFmt = new Intl.DateTimeFormat("en-PH", { timeZone: "UTC", month: "short", year: "numeric" });

export const fmtDate = (d: ISODate) => longFmt.format(parseISO(d));
export const fmtShort = (d: ISODate) => shortFmt.format(parseISO(d));
export const fmtDow = (d: ISODate) => dowFmt.format(parseISO(d));
export const fmtMonthYear = (d: ISODate) => monthYearFmt.format(parseISO(d));

export function relativeDays(from: ISODate, to: ISODate): string {
  const n = daysBetween(from, to);
  if (n === 0) return "today";
  if (n === 1) return "tomorrow";
  if (n === -1) return "yesterday";
  return n > 0 ? `in ${n} days` : `${-n} days ago`;
}
