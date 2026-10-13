# arvindymsma.solutions

Portfolio of Arvin D. Yapliong. React 19 + Vite 8, plain CSS, self-hosted fonts.
Designed with the **Basalt Dev Portfolio** skill: a near-black zinc ground, one cyan accent, Geist type,
a floating pill nav and a falling light beam. The home page plays a 10-second loop of my avatar (a green
headphone bunny) inside a product window.
Deployed to GitHub Pages by GitHub Actions on every push to `main`.

**Live:** https://adymsma-works.github.io/arvindymsma.solutions/

## Pages

| URL | What | Built from |
| --- | --- | --- |
| `/` | Home: hero + bunny window, selected work, experience tabs, n8n workflows, how I work, contact band | `src/site/pages/Home.jsx` |
| `/work/` | All case studies + a filterable archive | `Work.jsx` |
| `/work/<slug>/` | One case study per project | `Case.jsx` + `PROJECTS` in `src/data.js` |
| `/about/`, `/uses/`, `/resume/`, `/contact/` | Bio and milestones, tools, one-page résumé, contact form + business card | same folder |
| `/card.html` | Printable business card | `src/components/CardPage.jsx` |
| `/404.html` | Not found | static HTML |

Every folder with an `index.html` is a page (`build/pages.js` finds them). The build **prerenders** each page
(`scripts/prerender.js`), so the content is in the HTML before any JavaScript runs; React then hydrates it.
Search: `Ctrl/Cmd + K` or `/` on any page.

## Where things live

| To change | Edit |
| --- | --- |
| Name, email, phone, links, job title | `src/profile.js` (one place; the site, card, QR code, `.vcf` and share tags all read it) |
| Projects, jobs, milestones, uses, skills, any other text | `src/data.js` |
| The product windows drawn on each project cover | `src/site/mocks.jsx` (+ `hr-`, `bb-`, `pos-` styles in `src/styles/site.css`) |
| Colors, fonts, spacing (Basalt tokens) | the `:root` block at the top of `src/styles/basalt.css` |
| Hero window, workflow rows, mocks | `src/styles/site.css` |
| Business card design | `src/components/BizCard.jsx` + `src/styles/bizcard.css` (used by the contact page **and** the printable card) |
| Page titles, descriptions, share tags | each page's `index.html` (`{{TOKENS}}` are filled in at build time) |
| Share preview image | `public/og.png` (1200 x 630) |
| The bunny loop | `public/hero/` (made with Remotion; re-render from the `bunny-loop` source, theme `basalt`) |
| Resume | replace `public/Arvin_Yapliong_Developer_Resume.pdf` (keep the filename, or change `resumeFile` in `src/profile.js`) |

### Add a case study

1. Add an entry to `PROJECTS` in `src/data.js` (copy an existing one; `mock` picks a product window from `src/site/mocks.jsx`).
2. Copy `work/cloud-hris/index.html` to `work/<new-slug>/index.html` and change `data-slug`, the title and the description.
3. `npm run build && npm run check`. The check fails if a link points to a page that does not exist.

House rules from the Basalt skill: real facts only, no em dashes, no emoji, numbers only where they are true.

You never type the site URL anywhere. It comes from GitHub (see `docs/ADR-001-deployment.md`).
The QR code, `arvin-yapliong.vcf`, `robots.txt` and `sitemap.xml` (every page) are generated during the build.

## Run it on your computer

1. Install **Node.js 22 LTS** (or newer) from https://nodejs.org. Check: `node -v` shows `v22.x` or higher.
2. In this folder: `npm ci` (first time, or after pulling changes).
3. `npm run dev` and open the address it prints: **http://localhost:5173/arvindymsma.solutions/**. Edits show instantly.
4. Before pushing: `npm run lint`, `npm run build`, `npm run check`, then `npm run preview` to click through the real build.

`npm run check` is the safety net: it fails if any page would load blank or was not prerendered, a link points
to a missing page or outside the site's folder, a merge-conflict marker slipped in, or a required file (resume,
.vcf, hero video) is missing. GitHub runs it too and refuses to deploy if it fails.

## Deploy to GitHub Pages

One-time setup (in the GitHub website):

1. Repo **adymsma-works/arvindymsma.solutions**, then **Settings**, then **Pages**.
2. **Build and deployment, Source: GitHub Actions**.
3. **Custom domain:** leave it **empty** unless the domain's DNS is already set up (see below).
   If it shows `arvindymsma.solutions` and that domain isn't live, click **Remove**,
   otherwise GitHub redirects visitors to an address that doesn't exist.

Every deploy after that:

```bash
git add -A
git commit -m "Describe your change"
git push origin main
```

Then open the **Actions** tab and wait for **Deploy to GitHub Pages** to go green (about 1 minute).
Pull requests get built and checked, but only `main` deploys.

## Using your own domain later (arvindymsma.solutions)

1. Buy/renew the domain, then at the registrar's DNS settings add:
   - `A` records for `@`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `CNAME` for `www` pointing to `adymsma-works.github.io`
2. GitHub, Settings, Pages, **Custom domain**: `arvindymsma.solutions`, Save. Wait for the DNS check to pass, then tick **Enforce HTTPS**.
3. Actions, **Deploy to GitHub Pages**, **Run workflow**. The build asks GitHub for the new address, so the
   canonical URL, share tags, QR code and `.vcf` all switch to `https://arvindymsma.solutions/` automatically. No code changes.

## After each deploy

- Open the site on your phone. Tap **Save contact**, **Printable card**, **Download PDF** on the résumé page.
- Paste the URL into https://www.linkedin.com/post-inspector/ to check the share preview.
- Chrome DevTools, Lighthouse, run on mobile.

## Project structure

```
index.html  work/  about/  uses/  resume/  contact/   page entry points (one per route)
card.html  404.html                                   printable card, not-found page
build/site-plugin.js     derives base path from SITE_URL; generates QR, .vcf, robots, sitemap
build/pages.js           finds every page folder (build inputs, sitemap, prerender, checks)
scripts/prerender.js     writes each page's HTML at build time (after vite build --ssr)
scripts/check-dist.js    post-build checks (run in CI)
src/profile.js           contact details (single source of truth)
src/data.js              all portfolio text and lists
src/site/                App, Layout (header, palette, menu, footer), pages, mocks, icons, hooks
src/components/          BizCard (shared by the contact page and card.html), CardPage
src/styles/              basalt.css (skill tokens + components), site.css, bizcard, card page, 404
public/                  copied as-is: resume, og.png, icons, hero video, project backdrops
docs/                    architecture decision records and the earlier design critique
```
