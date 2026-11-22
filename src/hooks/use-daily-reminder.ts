import { useCallback, useEffect, useState } from "react";

import { localDateKey } from "@/lib/daily";
import {
  DEFAULT_REMINDER,
  loadReminder,
  nextReminderDate,
  saveReminder,
  showHadithNotification,
  type ReminderSettings,
} from "@/lib/reminder";

/** Keeps reminder settings in localStorage and fires the notification while the app is open. */
export function useDailyReminder() {
  const [settings, setSettings] = useState<ReminderSettings>(DEFAULT_REMINDER);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");

  useEffect(() => {
    const s = loadReminder();
    setSettings(s);
    saveReminder(s); // refresh the service worker's schedule on every visit
    setPermission("Notification" in window ? Notification.permission : "unsupported");
  }, []);

  useEffect(() => {
    if (!settings.enabled) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const schedule = () => {
      if (timer) clearTimeout(timer);
      const now = new Date();
      const at = nextReminderDate(now, settings.time);
      // Re-check at least hourly so sleeping tabs/devices catch up.
      const delay = Math.min(at.getTime() - now.getTime(), 60 * 60 * 1000);
      timer = setTimeout(async () => {
        const fireNow = new Date();
        const current = loadReminder();
        const key = localDateKey(fireNow);
        const [h = 8, m = 0] = current.time.split(":").map(Number);
        const due = fireNow.getHours() * 60 + fireNow.getMinutes() >= h * 60 + m;
        if (current.enabled && due && current.lastShown !== key) {
          const shown = await showHadithNotification(fireNow);
          if (shown) {
            const next = { ...current, lastShown: key };
            saveReminder(next);
            setSettings(next);
          }
        }
        schedule();
      }, Math.max(delay, 1000));
    };
    schedule();
    const onVisible = () => document.visibilityState === "visible" && schedule();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [settings.enabled, settings.time]);

  const update = useCallback(async (patch: Partial<ReminderSettings>) => {
    let perm: NotificationPermission | "unsupported" =
      "Notification" in window ? Notification.permission : "unsupported";
    if (patch.enabled && perm === "default") {
      perm = await Notification.requestPermission();
    }
    setPermission(perm);
    const enabled = patch.enabled ?? undefined;
    if (enabled && perm !== "granted") return { ok: false as const, permission: perm };
    const today = localDateKey(new Date());
    const next: ReminderSettings = { ...loadReminder(), ...patch };
    // Changing the time to later today should still remind today.
    if (patch.time && next.lastShown === today) delete next.lastShown;
    saveReminder(next);
    setSettings(next);
    return { ok: true as const, permission: perm };
  }, []);

  return { settings, permission, update };
}
