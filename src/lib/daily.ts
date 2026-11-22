import { HADITHS } from "@/data/hadiths";

const MS_PER_DAY = 86_400_000;
/** 1 January 2026 shows Hadith #1; the cycle then advances one Hadith per calendar day. */
const CYCLE_START_UTC = Date.UTC(2026, 0, 1);

/** Calendar day key (YYYY-MM-DD) in the user's local time zone. */
export function localDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Zero-based index into HADITHS for the given local calendar day. */
export function dailyIndex(date: Date, total: number = HADITHS.length): number {
  const dayUtc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const days = Math.round((dayUtc - CYCLE_START_UTC) / MS_PER_DAY);
  return ((days % total) + total) % total;
}

export function wrapIndex(index: number, total: number = HADITHS.length): number {
  return ((index % total) + total) % total;
}

export function randomIndex(exclude: number, total: number = HADITHS.length): number {
  if (total <= 1) return 0;
  let next = Math.floor(Math.random() * total);
  if (next === exclude) next = (next + 1 + Math.floor(Math.random() * (total - 1))) % total;
  return next;
}
