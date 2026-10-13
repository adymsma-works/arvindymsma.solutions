import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import sitePlugin from "./build/site-plugin.js";
import { findPages } from "./build/pages.js";

const page = (p) => fileURLToPath(new URL(p, import.meta.url));

// Real routes: every folder with an index.html is its own page (see build/pages.js).
const pageInputs = Object.fromEntries(
  findPages().map((p) => [p ? p.replace(/\/$/, "").replace(/\//g, "-") : "main", page(`./${p}index.html`)]),
);

// `base` is NOT set here on purpose: build/site-plugin.js derives it from
// SITE_URL, which GitHub Actions provides. See docs/ADR-001-deployment.md.
export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react(), sitePlugin()],
  build: isSsrBuild ? {} : {
    rolldownOptions: {
      input: {
        ...pageInputs,
        card: page("./card.html"),
        notFound: page("./404.html"),
      },
      output: {
        // Keep React in its own long-cached file, shared by every page.
        codeSplitting: { groups: [{ name: "vendor", test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ }] },
      },
    },
  },
}));
