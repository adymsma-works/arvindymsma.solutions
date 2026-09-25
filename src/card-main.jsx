import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/fonts.css";
import "./styles/card-page.css";
import CardPage from "./components/CardPage.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <CardPage />
  </StrictMode>
);
