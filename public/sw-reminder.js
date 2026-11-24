importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");

/* Imported into the generated service worker: daily reminder + notification clicks. */
const REMINDER_CACHE = "hadith-reminder";
const REMINDER_URL = "/__hadith-reminder.json";

function localKey(d) {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return d.getFullYear() + "-" + m + "-" + day;
}

async function checkDailyReminder() {
  const cache = await caches.open(REMINDER_CACHE);
  const res = await cache.match(REMINDER_URL);
  if (!res) return;
  const cfg = await res.json();
  if (!cfg.enabled || !Array.isArray(cfg.schedule)) return;
  const now = new Date();
  const key = localKey(now);
  if (cfg.lastShown === key) return;
  const parts = String(cfg.time || "08:00").split(":");
  const minutes = Number(parts[0]) * 60 + Number(parts[1]);
  if (now.getHours() * 60 + now.getMinutes() < minutes) return;
  const item = cfg.schedule.find((s) => s.date === key);
  if (!item) return;
  await self.registration.showNotification(item.title, {
    body: item.body,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: "daily-hadith",
    lang: "ar",
    dir: "rtl",
    data: { url: "/" },
  });
  cfg.lastShown = key;
  await cache.put(
    REMINDER_URL,
    new Response(JSON.stringify(cfg), { headers: { "content-type": "application/json" } }),
  );
}

self.addEventListener("periodicsync", (event) => {
  if (event.tag === "daily-hadith") event.waitUntil(checkDailyReminder());
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ("focus" in client) return client.focus();
      }
      return self.clients.openWindow(url);
    }),
  );
});
