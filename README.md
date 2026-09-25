# arvindymsma.solutions

<<<<<<< HEAD
Portfolio of Arvin D. Yapliong, built with React and Vite. Plain CSS, no runtime dependencies beyond React.
=======
Portfolio of Arvin D. Yapliong, built with React and Vite. Plain CSS, no runtime dependencies beyond React. Deployed with GitHub Pages at `adymsma-works.github.io/arvindymsma.solutions`.
>>>>>>> 34e5c79 (Redesign + business card)

## Where things live

| To change | Edit |
| --- | --- |
<<<<<<< HEAD
| Any text, links, projects, jobs, skills | `src/data.js` |
| Colors, fonts, spacing | top of `src/index.css` (the `:root` block) |
| Page title, description, share tags | `index.html` |
| Resume file | replace `public/Arvin_Yapliong_Developer_Resume.pdf` (keep the name) |
=======
| Any text, links, projects, jobs, skills, phone/email | `src/data.js` |
| Colors, fonts, spacing | the `:root` block at the top of `src/index.css` |
| The business card section on the site | `src/components/Card.jsx` |
| The standalone, printable business card | `public/card.html` |
| The one-tap "save contact" file | `public/arvin-yapliong.vcf` |
| Page title, description, share tags | `index.html` |
| Resume file | replace `public/Arvin_Yapliong_Developer_Resume.pdf` (keep the filename, or update the filename in `src/data.js`) |

## The palette

Tokens live at the top of `src/index.css`:

- `--ink` / `--ink-deep` / `--ink-mid` — MSMA navy, pulled from the business card's gradient. Used for headings, the nav, and the card.
- `--paper` / `--card` — the light background and white surfaces.
- `--lime` — the MSMA accent from the card. Used sparingly (the business card panel, small highlights) because it's too low-contrast for body text on a light background.
- `--stamp` — the red ink-stamp color, used only for the "Clocked in" stamp and "Still clocked in" status. This is the site's own signature detail, separate from the MSMA colors.
>>>>>>> 34e5c79 (Redesign + business card)

## Run it on your computer

1. Install Node.js 22 LTS or newer from nodejs.org. Check with `node -v`.
<<<<<<< HEAD
2. Open a terminal in this folder and run `npm install` (first time only; it also refreshes `package-lock.json`).
3. Run `npm run dev` and open the address it prints (usually http://localhost:5173). Edits show instantly.
4. Before publishing, run `npm run build`, then `npm run preview` to test the real production build.
=======
2. Open a terminal in this folder and run `npm install` (first time only; also refreshes `package-lock.json`).
3. Run `npm run dev` and open the address it prints (usually http://localhost:5173). Edits show instantly.
4. Before publishing, run `npm run build`, then `npm run preview` to test the real production build.
5. To check the printable business card on its own, open `public/card.html` directly in a browser, or visit `/card.html` on the dev server.
>>>>>>> 34e5c79 (Redesign + business card)

## Save your changes to GitHub

```bash
git add -A
<<<<<<< HEAD
git commit -m "Redesign portfolio"
git push origin main
```

## Deploy

### Option A: Vercel (simplest)

1. Sign in at vercel.com with your GitHub account.
2. Add New, then Project, and import `adymsma-works/arvindymsma.solutions`.
3. Vercel detects Vite. Confirm build command `npm run build` and output directory `dist`, then Deploy.
4. Every push to `main` now redeploys automatically.
5. Delete the `.github` folder (it is only for GitHub Pages).

Netlify works the same way: Add new site, Import from Git, build `npm run build`, publish directory `dist`.

### Option B: GitHub Pages (no extra account)

1. Push the project (the workflow in `.github/workflows/deploy.yml` is included).
2. On GitHub open the repo, then Settings, Pages, and set Source to GitHub Actions.
3. Open the Actions tab and wait for "Deploy to GitHub Pages" to turn green.

## Use your domain (arvindymsma.solutions)

1. Add the domain in your host: Vercel under Project, Settings, Domains; GitHub Pages under Settings, Pages, Custom domain.
2. The host shows the exact DNS records to create. At your domain registrar, open DNS settings and add them (typically an A record or CNAME).
3. Wait a few minutes up to a few hours, then enable HTTPS if the host asks. `public/CNAME` already contains the domain for GitHub Pages.

## After it is live

- Open the site on your phone and check every link, especially the resume download.
=======
git commit -m "Update portfolio"
git push origin main
```

## Deploy to GitHub Pages (step by step)

This repo already has everything wired up: `vite.config.js` sets `base: "/arvindymsma.solutions/"` to match the repo name, and `.github/workflows/deploy.yml` builds and publishes automatically on every push to `main`.

1. **Push this project to GitHub** if you haven't already (`git push origin main`).
2. On GitHub, open your repo **adymsma-works/arvindymsma.solutions**.
3. Go to **Settings → Pages**.
4. Under **Build and deployment → Source**, choose **GitHub Actions** (not "Deploy from a branch"). If it's currently set to a branch and GitHub has added a Jekyll workflow for you, that's fine — this repo's own `.github/workflows/deploy.yml` is the one that will run once the source is switched to Actions.
5. Go to the **Actions** tab. You should see "Deploy to GitHub Pages" running (it runs automatically on every push, or click **Run workflow** to trigger it manually). Wait for it to turn green.
6. Back in **Settings → Pages**, GitHub will show your live URL: **https://adymsma-works.github.io/arvindymsma.solutions/**. Open it and check every link, especially "Save contact" and "Open printable card".

From now on, every `git push origin main` redeploys automatically — no extra steps.

### Using your own domain later (arvindymsma.solutions)

The site currently deploys to the github.io URL above, not to arvindymsma.solutions — no custom domain is pointed at it yet, so **there's no CNAME file in this repo**. When you're ready:

1. At your domain registrar, add the DNS records GitHub asks for (Settings → Pages → Custom domain → enter `arvindymsma.solutions` — GitHub will show you the exact A/CNAME records to add).
2. Once DNS is verified, GitHub will re-add `public/CNAME` for you automatically, or you can create it yourself with just the one line `arvindymsma.solutions`.
3. Update `index.html`: swap the four URLs currently pointing at `adymsma-works.github.io/arvindymsma.solutions/` to `https://arvindymsma.solutions/` (canonical, `og:url`, and the two in the JSON-LD block). Also update `siteUrl` in `src/data.js`, the link and QR code on the business card, and `URL:` in `public/arvin-yapliong.vcf`.
4. If the base path changes to root, also set `base: "/"` in `vite.config.js`.

## After it is live

- Open the site on your phone and test the "Save contact (.vcf)" and "Open printable card" buttons.
>>>>>>> 34e5c79 (Redesign + business card)
- Paste the URL into LinkedIn's Post Inspector or a chat app to preview the share card.
- Run Lighthouse in Chrome DevTools; expect high scores.
