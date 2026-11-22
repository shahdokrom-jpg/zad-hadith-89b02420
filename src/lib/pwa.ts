/**
 * The only place that registers the app service worker. It refuses (and cleans up) in dev,
 * inside iframes and on Lovable preview hosts so previews never get stuck on stale caches.
 */
const SW_URL = "/sw.js";
const PROJECT_ID = "dabc70a8-fb61-488d-9a03-80e40ad6178b";
const PREVIEW_DOMAINS = [".lovable.app", ".gpt-eng.com", ".gptengineer.run"];
const PREVIEW_LABEL = /^(?:id-preview|preview)(?:-[a-z0-9]+)?--.+$/;

function isPreviewHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  const label = host.split(".")[0] ?? "";
  if (PREVIEW_DOMAINS.some((d) => host.endsWith(d))) {
    if (PREVIEW_LABEL.test(label)) return true;
    if (label === `project--${PROJECT_ID}-dev`) return true;
  }
  const exactOrSub = (d: string) => host === d || host.endsWith(`.${d}`);
  return exactOrSub("lovableproject.com") || exactOrSub("lovableproject-dev.com") || exactOrSub("beta.lovable.dev");
}

function inIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

async function unregisterAppWorkers() {
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.all(
    regs
      .filter((r) => [r.active, r.waiting, r.installing].some((w) => w?.scriptURL.endsWith(SW_URL)))
      .map((r) => r.unregister()),
  );
}

export async function registerAppServiceWorker(): Promise<void> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  const refuse =
    !import.meta.env.PROD ||
    inIframe() ||
    isPreviewHost(window.location.hostname) ||
    new URLSearchParams(window.location.search).get("sw") === "off";
  try {
    if (refuse) {
      await unregisterAppWorkers();
      return;
    }
    await navigator.serviceWorker.register(SW_URL, { scope: "/" });
  } catch {
    /* registration is best effort */
  }
}
