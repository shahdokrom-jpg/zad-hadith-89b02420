// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// Never set ssr.external or resolve.external: the Worker has no runtime module resolution, so
// the build fails. Never add compression (compressPublicAssets, vite-plugin-compression):
// hosting already compresses at the edge.
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import type { Plugin } from "vite";
import { VitePWA, type VitePWAOptions } from "vite-plugin-pwa";

/**
 * Vite builds client, ssr and nitro environments; the service worker belongs only to the
 * client output (dist/client), which is what hosting serves as static files.
 */
function clientOnlyPWA(options: Partial<VitePWAOptions>): Plugin[] {
  return VitePWA(options).map((plugin) => ({
    ...plugin,
    applyToEnvironment: (env) => env.name === "client",
  }));
}

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  plugins: [
    clientOnlyPWA({
      outDir: "dist/client",
      // Registration lives only in src/lib/pwa.ts (guards against dev/preview hosts).
      injectRegister: null,
      registerType: "autoUpdate",
      // public/manifest.json is linked from the root route head.
      manifest: false,
      filename: "sw.js",
      devOptions: { enabled: false },
      workbox: {
        globPatterns: ["**/*.{js,css,woff2,png,svg,ico}"],
        globIgnores: ["**/node_modules/**", "server/**", "_worker.js/**"],
        // SSR app: there is no index.html shell, so navigations go to the network first.
        navigateFallback: null,
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        importScripts: ["/sw-reminder.js"],
        runtimeCaching: [
          {
            urlPattern: ({ request, url }) =>
              request.mode === "navigate" && !url.pathname.startsWith("/~oauth"),
            handler: "NetworkFirst",
            options: {
              cacheName: "pages",
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 20 },
            },
          },
          {
            urlPattern: ({ url }) =>
              url.origin === self.location.origin && url.pathname.startsWith("/assets/"),
            handler: "CacheFirst",
            options: { cacheName: "assets", expiration: { maxEntries: 200 } },
          },
          {
            urlPattern: ({ url }) =>
              url.origin === self.location.origin &&
              (url.pathname.startsWith("/icons/") ||
                url.pathname === "/favicon.ico" ||
                url.pathname === "/manifest.json"),
            handler: "StaleWhileRevalidate",
            options: { cacheName: "app-static", expiration: { maxEntries: 20 } },
          },
          {
            urlPattern: ({ url }) =>
              url.origin === "https://fonts.googleapis.com" ||
              url.origin === "https://fonts.gstatic.com",
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "google-fonts",
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
});
