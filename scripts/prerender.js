// Writes each page's HTML into dist/ at build time, so the content is there
// before any JavaScript runs (search engines, link previews, slow phones).
// Runs after `vite build` and `vite build --ssr src/entry-server.jsx --outDir .ssr`.
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { findPages } from "../build/pages.js";

const { render } = await import(pathToFileURL(resolve(".ssr/entry-server.js")).href);
let n = 0;
for (const p of findPages()) {
  const file = join("dist", p, "index.html");
  const html = readFileSync(file, "utf8");
  const m = html.match(/<div id="root" data-page="([^"]+)"(?: data-slug="([^"]+)")?><!--app--><\/div>/);
  if (!m) throw new Error(`${file}: no <div id="root" data-page=...><!--app--></div> placeholder`);
  writeFileSync(file, html.replace("<!--app-->", render(m[1], m[2])));
  n++;
}
rmSync(".ssr", { recursive: true, force: true });
console.log(`✓ Prerendered ${n} pages`);
