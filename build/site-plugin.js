// Build-time glue so every URL on the site comes from ONE value: SITE_URL.
//
//  - SITE_URL is set automatically by GitHub Actions (actions/configure-pages)
//    to wherever GitHub Pages is serving the site: the github.io address today,
//    or https://arvindymsma.solutions/ once a custom domain is connected.
//  - The Vite `base` (the sub-folder assets load from) is derived from it,
//    so the blank-page / 404-assets problem can't come back.
//  - The QR code, the .vcf contact file, robots.txt and sitemap.xml are
//    generated from it, so they can never point at a stale address.

import QRCode from "qrcode";
import { profile } from "../src/profile.js";

export const DEFAULT_SITE_URL = "https://adymsma-works.github.io/arvindymsma.solutions/";

/** Normalise SITE_URL and derive the base path from it. */
export function resolveSite(env = process.env) {
  const raw = (env.SITE_URL || DEFAULT_SITE_URL).trim();
  const url = new URL(raw.endsWith("/") ? raw : `${raw}/`);
  const siteUrl = url.href; // always ends with "/"
  // Allow an explicit override (rarely needed), otherwise use the URL's path.
  let base = (env.BASE_PATH ?? url.pathname) || "/";
  if (!base.startsWith("/")) base = `/${base}`;
  if (!base.endsWith("/")) base = `${base}/`;
  const display = `${url.host}${url.pathname}`.replace(/\/$/, "");
  return { siteUrl, base, display };
}

function vcard(siteUrl) {
  const p = profile;
  const esc = (s) => String(s).replace(/([,;\\])/g, "\\$1");
  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${esc(p.lastName)};${esc(p.firstName)};${esc(p.middleInitial)};;`,
    `FN:${esc(p.name)}`,
    `ORG:${esc(p.org)}`,
    `TITLE:${esc(p.role)}`,
    `EMAIL;TYPE=INTERNET,WORK:${p.email}`,
    `TEL;TYPE=CELL:${p.phone}`,
    `URL:${siteUrl}`,
    `item1.URL:${p.linkedin}`,
    "item1.X-ABLabel:LinkedIn",
    `item2.URL:${p.github}`,
    "item2.X-ABLabel:GitHub",
    `ADR;TYPE=WORK:;;;${esc(p.city)};;;${esc(p.country)}`,
    `NOTE:${esc(p.summary)}`,
    "END:VCARD",
    "",
  ].join("\r\n"); // vCard requires CRLF line endings
}

function jsonLd(siteUrl) {
  const p = profile;
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Person",
    name: p.name,
    jobTitle: p.headline,
    email: `mailto:${p.email}`,
    telephone: p.phone,
    url: siteUrl,
    image: `${siteUrl}og.png`,
    sameAs: [p.github, p.linkedin],
    worksFor: { "@type": "Organization", name: p.org, url: p.company },
    address: { "@type": "PostalAddress", addressLocality: p.city, addressCountry: p.countryCode },
  });
}

const VIRTUAL_ID = "virtual:site";
const RESOLVED_ID = "\0virtual:site";

export default function sitePlugin() {
  const site = resolveSite();
  let qrPromise;
  const qrDataUri = () =>
    (qrPromise ??= QRCode.toString(site.siteUrl, {
      type: "svg",
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#0A2647", light: "#FFFFFF" },
    }).then((svg) => `data:image/svg+xml,${encodeURIComponent(svg)}`));

  const files = () => ({
    [profile.vcardFile]: { type: "text/vcard; charset=utf-8", body: vcard(site.siteUrl) },
    "robots.txt": { type: "text/plain", body: `User-agent: *\nAllow: /\nSitemap: ${site.siteUrl}sitemap.xml\n` },
    "sitemap.xml": {
      type: "application/xml",
      body: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${site.siteUrl}</loc></url>\n</urlset>\n`,
    },
  });

  return {
    name: "portfolio-site",

    config() {
      return { base: site.base };
    },

    configResolved(config) {
      config.logger.info(`\n  Site URL: ${site.siteUrl}\n  Base path: ${site.base}\n`);
    },

    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID;
    },

    async load(id) {
      if (id !== RESOLVED_ID) return;
      return [
        `export const siteUrl = ${JSON.stringify(site.siteUrl)};`,
        `export const siteDisplay = ${JSON.stringify(site.display)};`,
        `export const qrCode = ${JSON.stringify(await qrDataUri())};`,
      ].join("\n");
    },

    transformIndexHtml: {
      order: "pre",
      async handler(html) {
        const tokens = {
          SITE_URL: site.siteUrl,
          SITE_DISPLAY: site.display,
          NAME: profile.name,
          HEADLINE: profile.headline,
          CITY: profile.city,
          SUMMARY: profile.summary,
          JSON_LD: jsonLd(site.siteUrl),
          QR_CODE: await qrDataUri(),
        };
        return html.replace(/\{\{(\w+)\}\}/g, (m, k) => (k in tokens ? tokens[k] : m));
      },
    },

    // Dev server: serve the generated files so links work locally too.
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = (req.url || "").split("?")[0];
        const name = path.startsWith(site.base) ? path.slice(site.base.length) : null;
        const file = name && files()[name];
        if (!file) return next();
        res.setHeader("Content-Type", file.type);
        res.end(file.body);
      });
    },

    // Production build: write the generated files into dist/.
    generateBundle() {
      for (const [fileName, { body }] of Object.entries(files())) {
        this.emitFile({ type: "asset", fileName, source: body });
      }
    },
  };
}
