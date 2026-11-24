import { HADITHS } from "@/data/hadiths";

const MS_PER_DAY = 86_400_000;
const START_DATE_STORAGE_KEY = "zad_hadith_start_date";

/** Calendar day key (YYYY-MM-DD) in the user's local time zone. */
export function localDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Gets or initializes the user's personal start date (YYYY-MM-DD). */
export function getUserStartDate(now: Date = new Date()): string {
  if (typeof window === "undefined") return localDateKey(now);
  let saved = localStorage.getItem(START_DATE_STORAGE_KEY);
  if (!saved || !/^\d{4}-\d{2}-\d{2}$/.test(saved)) {
    saved = localDateKey(now);
    localStorage.setItem(START_DATE_STORAGE_KEY, saved);
  }
  return saved;
}

/** Zero-based index into HADITHS starting from the user's first day. */
export function dailyIndex(date: Date, total: number = HADITHS.length): number {
  const startStr = getUserStartDate(date);
  const [sy, sm, sd] = startStr.split("-").map(Number);
  const startUtc = Date.UTC(sy, sm - 1, sd);
  const dayUtc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const days = Math.max(0, Math.round((dayUtc - startUtc) / MS_PER_DAY));
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

