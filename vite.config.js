import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import sitePlugin from "./build/site-plugin.js";

const page = (p) => fileURLToPath(new URL(p, import.meta.url));

// `base` is NOT set here on purpose: build/site-plugin.js derives it from
// SITE_URL, which GitHub Actions provides. See docs/ADR-001-deployment.md.
export default defineConfig({
  plugins: [react(), sitePlugin()],
  build: {
    rolldownOptions: {
      input: {
        main: page("./index.html"),
        card: page("./card.html"),
        notFound: page("./404.html"),
      },
      output: {
        // Keep React in its own long-cached file, shared by index + card pages.
        codeSplitting: { groups: [{ name: "vendor", test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ }] },
      },
    },
  },
});
