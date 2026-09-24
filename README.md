# arvindymsma.solutions

Portfolio of Arvin D. Yapliong, built with React and Vite. Plain CSS, no runtime dependencies beyond React.

## Where things live

| To change | Edit |
| --- | --- |
| Any text, links, projects, jobs, skills | `src/data.js` |
| Colors, fonts, spacing | top of `src/index.css` (the `:root` block) |
| Page title, description, share tags | `index.html` |
| Resume file | replace `public/Arvin_Yapliong_Developer_Resume.pdf` (keep the name) |

## Run it on your computer

1. Install Node.js 22 LTS or newer from nodejs.org. Check with `node -v`.
2. Open a terminal in this folder and run `npm install` (first time only; it also refreshes `package-lock.json`).
3. Run `npm run dev` and open the address it prints (usually http://localhost:5173). Edits show instantly.
4. Before publishing, run `npm run build`, then `npm run preview` to test the real production build.

## Save your changes to GitHub

```bash
git add -A
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
- Paste the URL into LinkedIn's Post Inspector or a chat app to preview the share card.
- Run Lighthouse in Chrome DevTools; expect high scores.
