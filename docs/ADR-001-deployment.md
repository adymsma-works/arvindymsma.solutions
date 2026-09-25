# ADR-001: How the site knows its own URL

**Status:** Accepted
**Date:** 2026-09-25
**Deciders:** Arvin D. Yapliong

## Context

The site was blank on GitHub Pages. Root causes found in the repo as downloaded from `main`:

1. **Build broken.** Unresolved merge-conflict markers (`<<<<<<< HEAD`) were committed in
   `src/index.css`, `public/favicon.svg` and `README.md`. Vite's CSS minifier rejects them, so every build failed.
2. **Wrong base path.** `vite.config.js` had `base: "/"`, but a project site is served from
   `/arvindymsma.solutions/`. The HTML asked for `/assets/…` which returns 404 → blank page.
3. **Two deploy workflows.** `deploy.yml` (Vite) and `jekyll-gh-pages.yml` both published to Pages on every push.
   The Jekyll one uploads the *unbuilt* source, whose `index.html` points at `/src/main.jsx` → blank page.
   Whichever finished last won.
4. **Domain that doesn't resolve.** `public/CNAME` said `arvindymsma.solutions`, which has no DNS records.
   If that domain is set in Settings → Pages, GitHub redirects every visitor to a dead address.
5. **The URL was hard-coded in ~8 places** (index.html ×4, data.js, card.html, the QR image, the .vcf) with two
   different values, so switching hosts meant a scavenger hunt — which is how items 2 and 4 happened.

## Decision

**One input, `SITE_URL`, supplied by GitHub; everything else is derived from it at build time.**

- The workflow runs `actions/configure-pages`, which reports the address Pages is actually serving
  (`https://adymsma-works.github.io/arvindymsma.solutions` today, `https://arvindymsma.solutions` once a custom
  domain is connected), and passes it to the build as `SITE_URL`.
- `build/site-plugin.js` derives the Vite `base` from the URL's path, fills `{{SITE_URL}}` tokens in the HTML
  (canonical, Open Graph, JSON-LD), and generates the QR code, `.vcf`, `robots.txt` and `sitemap.xml`.
- Contact details move to `src/profile.js`, plain data readable by both the browser code and the build.
- The printable card becomes a Vite page (`card.html`) that reuses the same `BizCard` React component as the site.
- `scripts/check-dist.js` runs after every CI build and blocks deploy if any asset path lacks the base prefix,
  a conflict marker or unreplaced token remains, or a required file is missing.
- The Jekyll workflow and `public/CNAME` are deleted (Pages ignores CNAME files for Actions deployments anyway).

## Options considered

### A. Hard-code `base: "/arvindymsma.solutions/"` (minimal fix)
| Dimension | Assessment |
|---|---|
| Complexity | Low |
| Cost | Free |
| Maintenance | Poor: the day a custom domain is added, the site goes blank again unless ~8 places are edited |

**Pros:** one-line fix. **Cons:** keeps the exact failure mode that caused this incident.

### B. Derive everything from `SITE_URL` provided by `configure-pages` (chosen)
| Dimension | Assessment |
|---|---|
| Complexity | Medium: ~150 lines of build plugin + checker |
| Cost | Free |
| Maintenance | Excellent: switching domains is a Settings change + re-run, zero code edits |

**Pros:** impossible to get the base path wrong in CI; QR/vCard can't go stale; post-build check catches regressions.
**Cons:** one custom plugin to understand (documented, small).

### C. Move to Vercel / Netlify
| Dimension | Assessment |
|---|---|
| Complexity | Low (always served from `/`) |
| Cost | Free tier; another account |
| Maintenance | Good |

**Pros:** no base-path issues at all, PR previews. **Cons:** user asked for GitHub; extra account;
QR/vCard/share-tag URLs would still need a single source (so B's plugin is useful regardless).

### D. Rename the repo to `adymsma-works.github.io` (user site, served at `/`)
Removes the sub-folder, but the URL loses the portfolio's name and the repo namespace is shared with any
future user site. Still compatible with B if chosen later — no code changes needed.

## Consequences

- Easier: adding the custom domain; editing contact info (one file); trusting that green CI = working site.
- Harder: nothing notable. Local dev runs under `/arvindymsma.solutions/` to mirror production.
- Revisit: when the custom domain goes live, re-run the workflow once, and update the URL printed on the resume PDF.

## Action items

1. [x] Resolve conflicts (kept the newer "Redesign + business card" side: MSMA navy + lime palette).
2. [x] Delete `jekyll-gh-pages.yml` and `public/CNAME`.
3. [x] Add `build/site-plugin.js`, `src/profile.js`, `scripts/check-dist.js`; wire into `deploy.yml`.
4. [ ] Settings → Pages: Source = GitHub Actions; clear Custom domain until DNS exists.
5. [ ] Resume PDF lists "arvindymsma.solutions" — either set up that domain or change the resume to the github.io URL.
