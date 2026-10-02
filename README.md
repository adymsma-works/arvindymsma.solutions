# arvindymsma.solutions

Portfolio of Arvin D. Yapliong. React 19 + Vite 8, plain CSS, self-hosted fonts.
Deployed to GitHub Pages by GitHub Actions on every push to `main`.

This repo also hosts **Pitaka**, a private, local-first finance app, in `apps/pitaka/` (see [Pitaka](#pitaka) below).

**Live:** https://adymsma-works.github.io/arvindymsma.solutions/

## Where things live

| To change | Edit |
| --- | --- |
| Name, email, phone, links, job title | `src/profile.js` (one place; the site, card, QR code, `.vcf` and share tags all read it) |
| Projects, jobs, skills, any other text | `src/data.js` |
| Colors, fonts, spacing | the `:root` block at the top of `src/index.css` |
| Business card design | `src/components/BizCard.jsx` + `src/styles/bizcard.css` (used by the site **and** the printable card) |
| Page title, description, share tags | `index.html` (`{{TOKENS}}` are filled in at build time) |
| Share preview image | replace `public/og.png` (1200 × 630) |
| Resume | replace `public/Arvin_Yapliong_Developer_Resume.pdf` (keep the filename, or change `resumeFile` in `src/profile.js`) |

You never type the site URL anywhere. It comes from GitHub (see `docs/ADR-001-deployment.md`).
The QR code, `arvin-yapliong.vcf`, `robots.txt` and `sitemap.xml` are generated during the build.

## Run it on your computer

1. Install **Node.js 22 LTS** (or newer) from https://nodejs.org. Check: `node -v` → `v22.x` or higher.
2. In this folder: `npm ci` (first time, or after pulling changes). This installs the portfolio **and** Pitaka.
3. `npm run dev` and open the address it prints — **http://localhost:5173/arvindymsma.solutions/**. Edits show instantly.
4. Before pushing: `npm run lint`, `npm run build`, `npm run check`, then `npm run preview` to click through the real build.

`npm run check` is the safety net: it fails if any page would load blank, a link points outside
the site's folder, a merge-conflict marker slipped in, or a required file (resume, .vcf) is missing.
GitHub runs it too and refuses to deploy if it fails.

## Deploy to GitHub Pages

One-time setup (in the GitHub website):

1. Repo **adymsma-works/arvindymsma.solutions** → **Settings** → **Pages**.
2. **Build and deployment → Source: GitHub Actions**.
3. **Custom domain:** leave it **empty** unless the domain's DNS is already set up (see below).
   If it shows `arvindymsma.solutions` and that domain isn't live, click **Remove** —
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
   - `CNAME` for `www` → `adymsma-works.github.io`
2. GitHub → Settings → Pages → **Custom domain** → `arvindymsma.solutions` → Save. Wait for the DNS check to pass, then tick **Enforce HTTPS**.
3. Actions → **Deploy to GitHub Pages** → **Run workflow**. The build asks GitHub for the new address, so the
   canonical URL, share tags, QR code and `.vcf` all switch to `https://arvindymsma.solutions/` automatically. No code changes.

## After each deploy

- Open the site on your phone. Tap **Save contact**, **Open printable card**, **Download resume**.
- Paste the URL into https://www.linkedin.com/post-inspector/ to check the share preview.
- Chrome DevTools → Lighthouse → run on mobile.

## Project structure

```
index.html  card.html  404.html     page entry points
build/site-plugin.js                derives base path from SITE_URL; generates QR, .vcf, robots, sitemap
scripts/check-dist.js               post-build checks (run in CI)
src/profile.js                      contact details (single source of truth)
src/data.js                         portfolio text
src/components/                     React components (BizCard is shared by the site and card.html)
src/styles/                         fonts, business card, printable page, 404
public/                             copied as-is: resume, og.png, icons
docs/                               design critique and architecture decision record
```

## Pitaka

A private personal-finance app at **https://adymsma-works.github.io/arvindymsma.solutions/pitaka/**.
Unlisted (not linked from the portfolio, `noindex`), installable on your phone, works offline.

**Stack:** React 19 + TypeScript (strict) + Tailwind CSS v4 + Recharts + zod, Vite 8, vitest, vite-plugin-pwa.
It lives in `apps/pitaka/` as an npm workspace and builds into `dist/pitaka/`, so the same GitHub Actions
deploy publishes both. There is no `gh-pages` branch.

### Run it locally

```bash
npm ci                 # once, at the repo root
npm run dev:pitaka     # http://localhost:5174/arvindymsma.solutions/pitaka/
npm test               # unit tests for the money math + encryption
npm run typecheck
```

### First use

1. Open the Pitaka URL and create a **6-digit PIN** (4 is allowed but weaker).
2. On the Welcome screen choose **Import preset file** and pick your private `pitaka-preset.json`.
3. Fill in what the dashboard asks for (amber box): salary basis, monthly support, essentials, coop loan paid so far, and so on.
4. Then **delete the preset file** from your Downloads; Pitaka has its own encrypted copy.

### Privacy: what the PIN does and doesn't do

- Everything is stored **encrypted** (AES-256-GCM) in this browser's localStorage. The key is derived from your PIN with
  PBKDF2-SHA256 (600,000 iterations). The PIN itself is never stored. Nothing is sent to any server.
- Wrong PINs trigger a growing delay (1s, 2s, 4s… up to 60s). The app auto-locks after inactivity and when you leave it.
- **Limit:** a short PIN has few combinations. It stops casual access, not a determined attacker who copies your browser
  data and tries every PIN offline. Lock your phone and keep backups.
- **No recovery:** a forgotten PIN means wiping the data and restoring a backup.
- Data is per browser and device. Your phone and laptop don't sync. Use backups to move data.

### Backups

Settings → Backup & restore:
- **Encrypted backup** opens only with your PIN at the time of export. Safe to keep in cloud storage.
- **Readable backup** is plain JSON. Treat it like a bank statement.

`.gitignore` blocks `*preset*.json` and `pitaka-backup-*.json`, and `npm run check` fails the deploy if preset data
ever ends up in the published site. **Never commit your preset or backups: this repo is public.**

### Where things live

| To change | Edit |
| --- | --- |
| Money math (DTI, runway, payoff, MP2, interest) | `apps/pitaka/src/lib/finance.ts` (+ `finance.test.ts`) |
| Data model / validation | `apps/pitaka/src/types/index.ts`, `apps/pitaka/src/lib/schema.ts` |
| Encryption / storage | `apps/pitaka/src/lib/crypto.ts`, `apps/pitaka/src/lib/storage.ts` |
| PIN screens + auto-lock | `apps/pitaka/src/components/SecurityWrapper.tsx` |
| Screens | `apps/pitaka/src/features/*.tsx` |
