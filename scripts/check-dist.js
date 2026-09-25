// Post-build safety net, run in CI before anything is deployed.
// Fails the build if the site would load blank or with broken links.
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { resolveSite } from "../build/site-plugin.js";
import { profile } from "../src/profile.js";

const dist = "dist";
const { base, siteUrl } = resolveSite();
const errors = [];
const fail = (msg) => errors.push(msg);

const walk = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

if (!existsSync(dist)) {
  console.error("dist/ not found. Run `npm run build` first.");
  process.exit(1);
}
const files = walk(dist);

// 1. Required files exist.
for (const f of ["index.html", "card.html", "404.html", profile.resumeFile, profile.vcardFile, "og.png", "favicon.svg"]) {
  if (!existsSync(join(dist, f))) fail(`missing dist/${f}`);
}

// 2. No leftover merge-conflict markers or unreplaced {{TOKENS}} in text output.
for (const f of files.filter((f) => [".html", ".css", ".js", ".vcf", ".xml", ".txt"].includes(extname(f)))) {
  const text = readFileSync(f, "utf8");
  if (/^(<{7}|>{7}) /m.test(text)) fail(`merge-conflict marker in ${f}`);
  if (extname(f) === ".html" && /\{\{\w+\}\}/.test(text)) fail(`unreplaced {{TOKEN}} in ${f}`);
}

// 3. Every local src/href in the HTML resolves to a real file under the base path.
for (const f of files.filter((f) => f.endsWith(".html"))) {
  const html = readFileSync(f, "utf8");
  for (const [, url] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    if (/^(https?:|mailto:|tel:|data:|#)/.test(url)) continue;
    if (!url.startsWith(base)) {
      fail(`${f}: "${url}" does not start with base "${base}" (would 404 on GitHub Pages)`);
      continue;
    }
    const rel = url.slice(base.length).split(/[?#]/)[0] || "index.html";
    if (!existsSync(join(dist, rel))) fail(`${f}: "${url}" points to a file that is not in dist/`);
  }
}

if (errors.length) {
  console.error(`\n✗ Build check failed (${errors.length}):\n  - ${errors.join("\n  - ")}\n`);
  process.exit(1);
}
console.log(`✓ Build check passed: ${files.length} files, base "${base}", site ${siteUrl}`);
