import type { Centavos } from "../types";

const php = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" });
const phpWhole = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
});
const pct = new Intl.NumberFormat("en-PH", { style: "percent", maximumFractionDigits: 2 });

/** ₱1,234.50 */
export const formatPHP = (c: Centavos) => php.format(c / 100);
/** ₱1,235 (charts, compact spots) */
export const formatPHPWhole = (c: Centavos) => phpWhole.format(Math.round(c / 100));
/** 0.045 -> "4.5%" */
export const formatPct = (rate: number) => pct.format(rate);

/** Pesos (number or user-typed string like "1,250.50") -> centavos. Returns null if invalid. */
export function toCentavos(pesos: number | string): Centavos | null {
  const n = typeof pesos === "number" ? pesos : Number(String(pesos).replace(/[₱,\s]/g, ""));
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100);
}

export const pesos = (p: number): Centavos => Math.round(p * 100);
export const toPesos = (c: Centavos) => c / 100;

/** Round a computed (possibly fractional) centavo amount to a whole centavo. */
export const roundC = (c: number): Centavos => Math.round(c);

export const sum = (xs: readonly number[]) => xs.reduce((a, b) => a + b, 0);
export const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
