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
for (const f of [
  "index.html", "card.html", "404.html", profile.resumeFile, profile.vcardFile, "og.png", "favicon.svg",
  // Pitaka (apps/pitaka) — built into dist/pitaka/
  "pitaka/index.html", "pitaka/sw.js", "pitaka/manifest.webmanifest", "pitaka/registerSW.js",
]) {
  if (!existsSync(join(dist, f))) fail(`missing dist/${f}`);
}

// 2. No leftover merge-conflict markers or unreplaced {{TOKENS}} in text output.
for (const f of files.filter((f) => [".html", ".css", ".js", ".vcf", ".xml", ".txt"].includes(extname(f)))) {
  const text = readFileSync(f, "utf8");
  if (/^(<{7}|>{7}) /m.test(text)) fail(`merge-conflict marker in ${f}`);
  if (extname(f) === ".html" && /\{\{\w+\}\}/.test(text)) fail(`unreplaced {{TOKEN}} in ${f}`);
}

// 3. Pitaka must stay private: unlisted, noindex, CSP on, and no personal preset baked in.
if (existsSync(join(dist, "pitaka/index.html"))) {
  const html = readFileSync(join(dist, "pitaka/index.html"), "utf8");
  if (!html.includes('name="robots" content="noindex,nofollow"')) fail("pitaka/index.html is missing noindex");
  if (!html.includes("Content-Security-Policy")) fail("pitaka/index.html is missing its Content-Security-Policy");
  if (readFileSync(join(dist, "sitemap.xml"), "utf8").includes("pitaka")) fail("sitemap.xml must not list Pitaka");
  if (readFileSync(join(dist, "robots.txt"), "utf8").includes("pitaka")) fail("robots.txt must not mention Pitaka");
  for (const f of files.filter((f) => f.startsWith(join(dist, "pitaka")) && /\.(js|json|html)$/.test(f))) {
    // The private preset carries this marker; it must never end up in the public bundle.
    if (readFileSync(f, "utf8").includes("PRIVATE-PITAKA-PRESET")) fail(`${f} contains personal preset data`);
  }
  for (const f of files) if (/preset.*\.json$/i.test(f)) fail(`${f}: preset files must never be published`);
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
