# État — fork Karakeep (Echo)

Dernière mise à jour : 30/09/2026

Base de connaissance et de décision de Chris, pilotée par Claude, en complément de la mémoire sémantique.
Branche `echo` = nos changements ; `main` suit l'upstream (karakeep-app/karakeep).

## Où ça tourne
- Portable, sans Docker (Docker désactivé, sudo interactif) : `./start.sh` lance meilisearch (binaire dans
  `.runtime/`), Chrome headless (port 9222, crawler), web (`next start`, port `KARAKEEP_PORT`), workers (tsx).
- Service systemd user `karakeep` (enabled, démarre à l'ouverture de session ; unité dans
  `~/.config/systemd/user/karakeep.service`, appelle start.sh/stop.sh). Relance : `systemctl --user restart karakeep`.
- Données : `.runtime/data` (SQLite + assets), `.runtime/meili`. Logs : `logs/` (remis à zéro au démarrage).
- Config : `.env` (ignoré, symlinké dans apps/web, apps/workers, packages/db). Hôte/URL réels uniquement là.
- Compte unique (admin) partagé Chris / Claude : ce que Claude fait via l'API apparaît chez Chris.
  Mot de passe et clé d'API hors dépôt : `~/.config/karakeep/{mot-de-passe,cle-api}`.
- Après modification du web : `cd apps/web && pnpm build` puis `./restart.sh`. MCP : `cd apps/mcp && pnpm build`.

## Ajouts du fork
- MCP (`apps/mcp`, enregistré en user dans Claude Code via `deploy/mcp.sh`) :
  - `highlight-quote` : surligne un article en citant le passage (décalages calculés comme le lecteur web).
  - `upload-asset` : envoie image/PDF/HTML/vidéo, l'attache (couverture ou pièce jointe) ou en fait un favori ;
    renvoie le markdown d'intégration `![](/api/assets/<id>)`.
  - `update-bookmark` accepte `text` (corps markdown des notes).
- Web :
  - Notes markdown : `==surligné==`, `=={green|red|blue|yellow}texte==`, blocs ```mermaid rendus en schémas.
  - Vue en direct : requêtes bookmarks/highlights/lists/tags rechargées toutes les 4 s (onglet visible).

## Vérifié (30/09)
- Surlignages par citation posés au caractère près (gras, apostrophes typographiques), visibles dans le lecteur.
- Note avec bannière, surlignages colorés, schéma mermaid et image intégrée : rendu contrôlé dans Chrome.
- Surlignage ajouté par le MCP apparu sans rechargement dans un onglet ouvert.

## Limites connues
- Joignable seulement sur le réseau local (bind 0.0.0.0) ; pas de tunnel.
- Pas d'inférence IA intégrée (tags/résumés auto) : c'est Claude qui classe via le MCP.
