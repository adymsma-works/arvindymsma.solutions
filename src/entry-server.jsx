// Build-time renderer used by scripts/prerender.js (vite build --ssr).
import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import App from "./site/App.jsx";

export function render(page, slug) {
  return renderToString(
    <StrictMode>
      <App page={page} slug={slug} />
    </StrictMode>,
  );
}
