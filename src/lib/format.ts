export type Cycle = "MONTHLY" | "QUARTERLY" | "HALF_YEARLY" | "ANNUAL";

export const cycles: { value: Cycle; label: string; short: string; months: number }[] = [
  { value: "MONTHLY", label: "Monthly", short: "/ month", months: 1 },
  { value: "QUARTERLY", label: "Quarterly", short: "/ 3 months", months: 3 },
  { value: "HALF_YEARLY", label: "Half-yearly", short: "/ 6 months", months: 6 },
  { value: "ANNUAL", label: "Annual", short: "/ year", months: 12 },
];

export const cycleLabel = (c: string) => cycles.find((x) => x.value === c)?.label ?? c;

export function inr(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: paise % 100 === 0 ? 0 : 2,
  }).format(paise / 100);
}

export function date(d: Date | string | null | undefined) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(d));
}

export function daysUntil(d: Date | string) {
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86_400_000);
}

/** A Date `days` days before now (kept out of components so render stays pure). */
export function daysAgo(days: number) {
  return new Date(Date.now() - days * 86_400_000);
}

export function daysFromNow(days: number) {
  return new Date(Date.now() + days * 86_400_000);
}
