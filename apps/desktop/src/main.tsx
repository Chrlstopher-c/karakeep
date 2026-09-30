import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MotionGlobalConfig } from "motion/react";

import { App } from "./app/App";
import "./shared/theme.css";

// Dev : ?test coupe les animations (onglet de navigateur en arrière-plan, sans images).
if (import.meta.env.DEV && new URLSearchParams(window.location.search).has("test")) {
  MotionGlobalConfig.skipAnimations = true;
}

const root = document.getElementById("root");
if (!root) throw new Error("élément #root absent de index.html");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
