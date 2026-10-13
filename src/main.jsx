import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "./styles/fonts.css"; // business card fonts (only downloaded where the card is shown)
import "./styles/bizcard.css";
import "./styles/basalt.css";
import "./styles/site.css";
import App from "./site/App.jsx";

// Every HTML page mounts the same bundle; data-page picks what to render.
// The build prerenders each page (scripts/prerender.js), so the HTML already
// holds the content and React only hydrates it.
const root = document.getElementById("root");
const { page, slug } = root.dataset;
const app = (
  <StrictMode>
    <App page={page} slug={slug} />
  </StrictMode>
);
if (root.firstElementChild) hydrateRoot(root, app);
else createRoot(root).render(app);
