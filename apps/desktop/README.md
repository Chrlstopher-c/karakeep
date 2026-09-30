# Savoir — client desktop (Tauri 2)

Client natif de la base de connaissance Echo. Le serveur Karakeep tourne ailleurs ; l'app s'y connecte avec une
adresse et une clé API (fichier de config de l'app, droits 600). Claude y travaille via le MCP karakeep : ses actions
portent la marque CLAUDE et se suivent en direct (touche F).

- Stack : Tauri 2 (Rust) · Vite · React 19 · Tailwind 4 · motion/react · tRPC via `@karakeep/shared-react`.
- Dev : `./dev.sh` (Vite sur 127.0.0.1:1420 + app ; logs dans `logs/dev.log`). Interface seule dans un navigateur :
  `pnpm dev` puis `http://127.0.0.1:1420/?test` (connexion lue par le serveur de dev, animations coupées).
- Installation : `packaging/install-local.sh` → `~/.local/bin/savoir`, entrée de menu, MCP embarqué dans
  `~/.local/share/savoir/mcp/`.
- Capture rapide : Ctrl+Maj+Espace (X11) ; sous Hyprland :
  `bind = CTRL SHIFT, SPACE, exec, ~/.local/bin/savoir --capture`.
- Claude Code : écran Claude → « Ajouter à Claude Code » (crée une clé agent et déclare le serveur MCP).
- Vérifications : `pnpm typecheck && pnpm lint && pnpm format && pnpm test` ; Rust : `cargo clippy` et `cargo test`
  dans `src-tauri` (même chose en CI, job `desktop`).
- Logs : `~/.local/share/agency.echo.savoir/logs/savoir.log` (Rust et webview).
- Design : `design/` (cahier des charges, tokens, logos, maquettes Claude Design).
