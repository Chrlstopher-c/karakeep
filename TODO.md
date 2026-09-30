# TODO — fork Karakeep

## En cours — client desktop « Savoir » (apps/desktop)
Maquettes reçues : ~/Downloads/« Mockups préliminaires demandés Savoir.zip » (Savoir.dc.html = prototype, Notes de conception).
Port React fidèle au prototype, écran par écran, CI verte à chaque palier.
- [x] Squelette Tauri 2 + connexion clé API + thème + job CI desktop
- [x] Backend provenance : apiKeys.agent, table agentActivity, middleware tRPC (mutations d'une clé agent), router agentActivity
- [x] Coquille : barre latérale (indicateur glissant, repli), barre de titre ⌘K, thèmes night/clair, lancement animé
- [x] Accueil (« ce qui a bougé », reprendre la lecture, dernières sources)
- [x] Sources : grille/liste/compact, filtres Tous/Chris/Claude + types, tri, FLIP
- [x] Lecteur : article/capture/archive, barre de surlignage 1-4 + note, panneau surlignages/infos, surlignage animé
- [x] Décisions : colonnes ouvertes/tranchées/abandonnées + fiche (options, retenir, conséquences, sources liées)
- [ ] Surlignages (mur), Projets, Tags, Réglages
- [ ] Claude : état MCP, écriture de ~/.claude.json, clé Claude, outils, journal d'activité, mode suivi (F)
- [ ] Palette ⌘K, capture rapide (raccourci global), notifications groupées, hors ligne
- [ ] Paquet Arch + note d'usage

Notes : app lancée par apps/desktop/dev.sh ; clé de l'app « Savoir (Chris) » (non agent) dans
~/.config/agency.echo.savoir/connexion.json ; clé MCP « claude » marquée agent=claude.

## Fait
- [x] Base structurée (listes, tags, couleurs, note Mode d'emploi) + skill Claude `karakeep`.
- [x] Démarrage automatique (service systemd user `karakeep`).

## Backlog
- [ ] Lier en service systemd sans session ouverte (`loginctl enable-linger`) si Chris le veut.
- [ ] Accès hors maison (tunnel) — décision de Chris.
- [ ] App iOS : apps/mobile (Expo) via EAS Build + Impactor.
- [ ] Brancher le MCP au cerveau Echo (Pi) — nécessite l'accès réseau au portable.
- [ ] Inférence locale (Ollama sur la tour) pour tags/résumés automatiques, optionnel.
