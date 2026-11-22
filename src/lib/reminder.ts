import { HADITHS, type Hadith } from "@/data/hadiths";
import { dailyIndex, localDateKey } from "@/lib/daily";

export interface ReminderSettings {
  enabled: boolean;
  /** 24h "HH:MM" in the user's local time */
  time: string;
  /** Local date key of the last day a reminder was shown */
  lastShown?: string;
}

const KEY = "hadith:reminder";
const SW_CACHE = "hadith-reminder";
const SW_CONFIG_URL = "/__hadith-reminder.json";
export const DEFAULT_REMINDER: ReminderSettings = { enabled: false, time: "08:00" };

export function loadReminder(): ReminderSettings {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_REMINDER;
    const v = JSON.parse(raw) as Partial<ReminderSettings>;
    const next: ReminderSettings = {
      enabled: Boolean(v.enabled),
      time: typeof v.time === "string" && /^\d{2}:\d{2}$/.test(v.time) ? v.time : DEFAULT_REMINDER.time,
    };
    if (typeof v.lastShown === "string") next.lastShown = v.lastShown;
    return next;
  } catch {
    return DEFAULT_REMINDER;
  }
}

export function saveReminder(s: ReminderSettings) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
  void syncServiceWorkerConfig(s);
}

/** Next moment (strictly after `now`) the reminder should fire. */
export function nextReminderDate(now: Date, time: string): Date {
  const [h = 8, m = 0] = time.split(":").map(Number);
  const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);
  if (target.getTime() <= now.getTime()) target.setDate(target.getDate() + 1);
  return target;
}

export function notificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

function notificationBody(h: Hadith): string {
  const text = h.text.replace(/[«»]/g, "").trim();
  const body = text.length > 230 ? `${text.slice(0, 228).trimEnd()}…` : text;
  return `${body}\n${h.source}`;
}

export function notificationForDate(date: Date) {
  const h = HADITHS[dailyIndex(date)] ?? HADITHS[0]!;
  return { title: `حديث اليوم · ${h.narrator}`, body: notificationBody(h) };
}

export async function showHadithNotification(date: Date = new Date()): Promise<boolean> {
  if (!notificationSupported() || Notification.permission !== "granted") return false;
  const { title, body } = notificationForDate(date);
  const options: NotificationOptions = {
    body,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: "daily-hadith",
    lang: "ar",
    dir: "rtl",
    data: { url: "/" },
  };
  try {
    const reg = "serviceWorker" in navigator ? await navigator.serviceWorker.getRegistration() : undefined;
    if (reg) {
      await reg.showNotification(title, options);
      return true;
    }
    new Notification(title, options);
    return true;
  } catch {
    return false;
  }
}

/**
 * Hand the schedule to the service worker (Cache Storage is shared with it), so browsers that
 * support Periodic Background Sync can show the reminder while the app is closed.
 */
async function syncServiceWorkerConfig(s: ReminderSettings) {
  if (typeof window === "undefined" || !("caches" in window)) return;
  try {
    const today = new Date();
    const schedule = Array.from({ length: 21 }, (_, i) => {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
      return { date: localDateKey(d), ...notificationForDate(d) };
    });
    const cache = await caches.open(SW_CACHE);
    await cache.put(
      SW_CONFIG_URL,
      new Response(JSON.stringify({ ...s, schedule }), {
        headers: { "content-type": "application/json" },
      }),
    );
    const reg = "serviceWorker" in navigator ? await navigator.serviceWorker.getRegistration() : undefined;
    const periodic = (reg as (ServiceWorkerRegistration & { periodicSync?: PeriodicSync }) | undefined)
      ?.periodicSync;
    if (!periodic) return;
    if (s.enabled) {
      await periodic.register("daily-hadith", { minInterval: 60 * 60 * 1000 }).catch(() => undefined);
    } else {
      await periodic.unregister("daily-hadith").catch(() => undefined);
    }
  } catch {
    /* best effort */
  }
}

interface PeriodicSync {
  register(tag: string, options?: { minInterval?: number }): Promise<void>;
  unregister(tag: string): Promise<void>;
}
