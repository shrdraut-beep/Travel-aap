import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "mask-icon.svg"],
      // `public/manifest.json` is the single source of truth for the web app manifest
      // and is linked directly from index.html. Generating a second manifest here put
      // two <link rel="manifest"> tags in the built HTML, which disagreed about
      // start_url, scope, display and icons - browsers honour only one, so install
      // behaviour was undefined. Keeping the hand-written file also keeps the manifest
      // URL (and therefore the PWA's identity for already-installed users) stable.
      manifest: false,
      workbox: {
        maximumFileSizeToCacheInBytes: 20 * 1024 * 1024, // 20MB
        // SPA: every unknown route must fall back to the app shell when offline.
        // The old hand-rolled public/service-worker.js did this; Workbox now owns it.
        navigateFallback: "index.html",
        // Stale precaches from previous deploys would otherwise accumulate.
        cleanupOutdatedCaches: true,
        // API calls must always hit the network, never the app-shell fallback.
        navigateFallbackDenylist: [/^\/api\//, /^\/firebase-messaging-sw\.js$/],
        // The Firebase messaging worker is itself a service worker: precaching it would
        // serve a stale copy from Workbox's cache and stop updates propagating.
        globIgnores: ["firebase-messaging-sw.js", "**/firebase-messaging-sw.js"],
      },
    }),
  ],
  optimizeDeps: { include: ['react', 'react-dom', 'react-leaflet', 'leaflet'] },
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    host: "0.0.0.0",
    allowedHosts: true,
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "esbuild",
    cssMinify: true,
    rollupOptions: {
      input: "index.html",
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "framer-motion", "lucide-react"],
          charts: ["recharts"],
          maps: ["leaflet", "react-leaflet"],
          utils: ["jspdf", "xlsx", "html2canvas-pro", "papaparse"],
        },
      },
    },
  },
  esbuild: {
    drop: process.env.NODE_ENV === "production" ? ["console", "debugger"] : [],
    legalComments: "none",
  },
});
