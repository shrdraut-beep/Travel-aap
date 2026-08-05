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
      workbox: {
        maximumFileSizeToCacheInBytes: 20 * 1024 * 1024, // 20MB
      },
      manifest: {
        name: "प्रवास वाटाघाटी (Pravas Wataghati)",
        short_name: "Pravas Wataghati",
        description:
          "सहलीचे नियोजन करा, खर्चाचे बिल स्कॅन करा, आणि मित्रांमध्ये खर्चाचे अचूक विभाजन करा।",
        theme_color: "#ffffff",
        icons: [
          {
            src: "icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  resolve: {
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
});
