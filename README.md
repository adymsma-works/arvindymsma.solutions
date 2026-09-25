# arvindymsma.solutions

Portfolio of Arvin D. Yapliong. React 19 + Vite 8, plain CSS, self-hosted fonts.
Deployed to GitHub Pages by GitHub Actions on every push to `main`.

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
2. In this folder: `npm ci` (first time, or after pulling changes).
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
