import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import type { Plugin } from "vite";
import { defineConfig } from "vite";

// Dev seulement : sert au navigateur la connexion enregistrée par l'app native,
// pour tester l'interface dans un onglet sans ressaisir la clé. Jamais en build.
function devConnection(): Plugin {
  const file = join(homedir(), ".config", "agency.echo.savoir", "connexion.json");
  return {
    name: "savoir-dev-connection",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/__savoir/dev-connection", (_req, res) => {
        readFile(file, "utf8")
          .then((raw) => {
            res.setHeader("Content-Type", "application/json");
            res.end(raw);
          })
          .catch(() => {
            res.statusCode = 404;
            res.end();
          });
      });
    },
  };
}

// Tauri pilote Vite : port fixe, pas d'écran effacé, cible WebKitGTK récente.
export default defineConfig({
  plugins: [react(), tailwindcss(), devConnection()],
  clearScreen: false,
  server: { port: 1420, strictPort: true, host: "127.0.0.1" },
  envPrefix: ["VITE_", "TAURI_ENV_"],
  build: { target: "safari16", sourcemap: false },
});
