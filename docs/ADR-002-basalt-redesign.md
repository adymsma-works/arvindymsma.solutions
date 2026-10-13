# ADR-002: Basalt redesign, real routes and prerendering

**Date:** 2026-10-13. **Status:** accepted.

## Context

The site was a single React page in the MSMA navy and lime palette ("daily time record" theme), and the repo
also hosted Pitaka, a private finance app, as an npm workspace. Arvin asked to:

1. remove Pitaka,
2. put the animated bunny loop (his avatar) on the home screen,
3. upgrade the portfolio with the **Basalt Dev Portfolio** skill (Skillry, v1.0.4).

The skill's default output is one self-contained HTML file with a hash router. For an existing framework
project it asks for the same visual grammar built in the project's own stack, with real routes.

## Decision

- **Keep React 19 + Vite 8**, the SITE_URL plugin, the business card, QR, `.vcf` and `check-dist`.
- **Real routes, one HTML file per page** (`/`, `/work/`, `/work/<slug>/`, `/about/`, `/uses/`, `/resume/`,
  `/contact/`). Every folder with an `index.html` is a page; `build/pages.js` feeds the build inputs, sitemap,
  prerender and checks. No router library and no GitHub Pages 404 tricks.
- **Prerender at build time** (`vite build --ssr src/entry-server.jsx` + `scripts/prerender.js`), then hydrate.
  Content is readable without JavaScript, link previews and search engines see real text, and reveal-on-scroll
  only hides content when the `js` class is present.
- **Basalt CSS reused, not re-derived**: `src/styles/basalt.css` is the skill template's CSS (tokens, pill nav,
  beam, work cards, product windows, case study, forms) minus the routes this site does not have (talks,
  writing articles, open source grid). Site-specific pieces live in `src/styles/site.css`.
- **Sections removed for lack of real content** (per the skill's "real facts only" rule): Writing, Talks,
  Open source (one public repo), "Shipped with" row (three employers, the row needs four). Added a
  "Workflows I build with n8n" section from real data instead.
- **The bunny loop** plays in a product window beside the hero text. It is re-rendered in a "basalt" colour
  theme (no purple, cyan accent) so it obeys the one-accent rule. It plays only while on screen, has a
  pause button (WCAG 2.2.2), and never autoplays under `prefers-reduced-motion`.
- **Contact form** has no server on GitHub Pages: submitting opens the visitor's email app with the message
  filled in, and the page says so. No fake "sent" state.
- **Pitaka removed** from the repo, CI and checks. The `.gitignore` rule and the check that block personal
  finance JSON files stay, because the repo is public.

## Consequences

- Adding a case study needs a data entry and a copied `work/<slug>/index.html`; the check catches a missing page.
- The design deviates from the skill in one place on purpose: the home hero holds the bunny window
  (requested by the owner) and its pause button.
- Bail bonds and POS case studies are drafted from short descriptions and should be reviewed by Arvin.
