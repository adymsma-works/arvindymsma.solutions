// Post-build safety net, run in CI before anything is deployed.
// Fails the build if the site would load blank or with broken links.
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { resolveSite } from "../build/site-plugin.js";
import { profile } from "../src/profile.js";
import { findPages } from "../build/pages.js";

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
for (const f of [
  "index.html", "card.html", "404.html", profile.resumeFile, profile.vcardFile, "og.png", "favicon-blade.svg",
  "hero/bunny-loop-720p.webm", "hero/bunny-loop-720p.mp4", "hero/bunny-loop-poster.webp", "hero/bunny-loop-still.webp",
  ...findPages().map((p) => `${p}index.html`),
]) {
  if (!existsSync(join(dist, f))) fail(`missing dist/${f}`);
}

// 2. No leftover merge-conflict markers or unreplaced {{TOKENS}} in text output.
for (const f of files.filter((f) => [".html", ".css", ".js", ".vcf", ".xml", ".txt"].includes(extname(f)))) {
  const text = readFileSync(f, "utf8");
  if (/^(<{7}|>{7}) /m.test(text)) fail(`merge-conflict marker in ${f}`);
  if (extname(f) === ".html" && /\{\{\w+\}\}/.test(text)) fail(`unreplaced {{TOKEN}} in ${f}`);
}

// 3. Personal finance files (old Pitaka presets/backups) must never be published.
for (const f of files) if (/(preset.*|pitaka-backup-.*)\.json$/i.test(f)) fail(`${f}: personal data files must never be published`);

// 3b. Every page was prerendered (content is in the HTML before any JavaScript runs).
for (const p of findPages()) {
  const f = join(dist, p, "index.html");
  if (existsSync(f) && readFileSync(f, "utf8").includes("<!--app-->")) fail(`${f} was not prerendered (run the full npm run build)`);
}

// 4. Every local src/href in the HTML resolves to a real file under the base path.
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
