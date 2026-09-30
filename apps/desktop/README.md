# Savoir — client desktop (Tauri 2)

Client natif de la base de connaissance Echo. Le serveur Karakeep tourne ailleurs ; l'app s'y connecte
avec une adresse et une clé API (stockées dans le dossier de config de l'app, droits 600).

- Stack : Tauri 2 (Rust) · Vite · React 19 · Tailwind 4 · motion/react · tRPC via `@karakeep/shared-react`.
- Dev : `pnpm --filter @karakeep/desktop tauri dev` (port Vite 1420). Sous NVIDIA/Wayland :
  `WEBKIT_DISABLE_DMABUF_RENDERER=1`.
- Paquets : `pnpm --filter @karakeep/desktop tauri build` (deb, rpm, AppImage).
- Logs : `~/.local/share/agency.echo.savoir/logs/savoir.log` (Rust et webview).
- Design : `design/` (cahier des charges, tokens, logos).
