// Every folder with an index.html is a page (index.html, work/, work/<slug>/, about/ ...).
// Used by vite.config.js (build inputs), the sitemap, prerendering and the deploy check.
import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const SKIP = new Set(["node_modules", "dist", ".ssr", "public", "src", "build", "scripts", "docs", ".git", ".github"]);

/** ["", "about/", "work/", "work/bail-bonds-records/", ...] relative to the site root. */
export function findPages(root = ".") {
  const out = [];
  const walk = (dir, rel) => {
    if (existsSync(join(dir, "index.html"))) out.push(rel);
    for (const name of readdirSync(dir)) {
      if (SKIP.has(name) || name.startsWith(".")) continue;
      const p = join(dir, name);
      if (statSync(p).isDirectory()) walk(p, `${rel}${name}/`);
    }
  };
  walk(root, "");
  return out.sort();
}
