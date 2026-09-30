# TODO — fork Karakeep

## En cours
- [ ] Client desktop Tauri « Savoir » (apps/desktop) : CDC design envoyé à Claude Design (apps/desktop/design/CDC-design.md) ;
  attendre les maquettes, puis squelette Tauri + thème, grille/listes/recherche, lecteur + surlignage, notes, capture, direct.

## Fait
- [x] Base structurée (listes, tags, couleurs, note Mode d'emploi) + skill Claude `karakeep`.
- [x] Démarrage automatique (service systemd user `karakeep`).

## Backlog
- [ ] Lier en service systemd sans session ouverte (`loginctl enable-linger`) si Chris le veut.
- [ ] Accès hors maison (tunnel) — décision de Chris.
- [ ] App iOS : apps/mobile (Expo) via EAS Build + Impactor.
- [ ] Brancher le MCP au cerveau Echo (Pi) — nécessite l'accès réseau au portable.
- [ ] Inférence locale (Ollama sur la tour) pour tags/résumés automatiques, optionnel.
