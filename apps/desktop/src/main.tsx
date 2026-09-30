import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./app/App";
import "./shared/theme.css";

const root = document.getElementById("root");
if (!root) throw new Error("élément #root absent de index.html");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
