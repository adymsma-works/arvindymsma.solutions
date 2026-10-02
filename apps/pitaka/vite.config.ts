/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import { fileURLToPath } from "node:url";

// Same rule as the portfolio (build/site-plugin.js): GitHub Actions passes
// SITE_URL; Pitaka lives in the "pitaka/" sub-folder beneath it.
const DEFAULT_SITE_URL = "https://adymsma-works.github.io/arvindymsma.solutions/";
const site = new URL(
  (process.env.SITE_URL || DEFAULT_SITE_URL).replace(/\/?$/, "/"),
);
const base = `${site.pathname}pitaka/`;

// Strict Content-Security-Policy, production only (the dev server needs
// inline scripts for hot reload).
const csp: Plugin = {
  name: "pitaka-csp",
  apply: "build",
  transformIndexHtml(html) {
    const policy = [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "connect-src 'self'",
      "worker-src 'self'",
      "manifest-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'none'",
    ].join("; ");
    return html.replace(
      "<!--CSP-->",
      `<meta http-equiv="Content-Security-Policy" content="${policy}" />`,
    );
  },
};

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    csp,
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "script", // external registerSW.js, no inline script (CSP)
      scope: base,
      includeAssets: ["favicon.svg", "apple-touch-icon.png"],
      manifest: {
        id: base,
        name: "Pitaka",
        short_name: "Pitaka",
        description: "Private, local-first personal finance. Your data stays on this device.",
        start_url: base,
        scope: base,
        display: "standalone",
        orientation: "portrait",
        background_color: "#0f172a",
        theme_color: "#0f172a",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        // Precache only the Latin font subsets (others still load on demand).
        globIgnores: ["**/inter-{cyrillic,cyrillic-ext,greek,greek-ext,vietnamese}-*.woff2"],
        navigateFallback: `${base}index.html`,
        navigateFallbackAllowlist: [new RegExp(`^${base.replace(/\//g, "\\/")}`)],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  server: { port: 5174 },
  preview: { port: 4174 },
  build: {
    // Lands inside the portfolio's dist/ so one Pages artifact holds both.
    outDir: fileURLToPath(new URL("../../dist/pitaka", import.meta.url)),
    emptyOutDir: true,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: "react", test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/, priority: 3 },
            // Small UI helpers used on every screen (recharts also uses clsx; keep it out of "charts").
            { name: "ui", test: /node_modules[\\/](clsx|tailwind-merge)[\\/]/, priority: 2 },
            { name: "charts", test: /node_modules[\\/](recharts|d3-[^\\/]+|victory-vendor|@reduxjs|redux|immer|reselect|es-toolkit|decimal\.js-light|eventemitter3|use-sync-external-store|react-redux|react-is|tiny-invariant)[\\/]/, priority: 1 },
          ],
        },
      },
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
