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
  - Vue en direct : le journal `agentActivity` est sondé toutes les 4 s ; les requêtes bookmarks/highlights/lists/tags
    ne sont rechargées que si un agent a agi (le rechargement aveugle rendait le test E2E des listes instable).

- Serveur (tRPC) :
  - Provenance des agents : colonne `apiKey.agent` ; toute mutation faite avec une clé agent est journalisée dans
    `agentActivity` (middleware sur `authedProcedure`, hors gestion des clés). Routeur `agentActivity` :
    `list`, `provenance`, `keys`, `setAgent`, `createAgentKey`, `revokeAgentKey` (clé pleine requise).
  - `readingProgress.get` / `readingProgress.current` (l'amont n'écrivait que la progression).
- Clés locales : « claude » (agent=claude, utilisée par le MCP) et « Savoir (Chris) » (l'app, sans agent).

## Savoir — client desktop (`apps/desktop`, voir son README et son ARCHITECTURE)
- Tauri 2 + React 19 + Tailwind 4 + motion ; maquettes Claude Design portées écran par écran
  (`apps/desktop/design/mockups`). Installé via `apps/desktop/packaging/install-local.sh` → `~/.local/bin/savoir`.
- Écrans : accueil, sources (3 vues, filtres, J/K), lecteur (surlignage animé 1-4, panneau, progression, notes
  Markdown/Mermaid, capture/archive), décisions (colonnes + fiche : retenir/annuler, édition E), surlignages, projets
  (tags projet:), tags (renommer/fusionner), Claude (MCP embarqué déclaré dans ~/.claude.json, clés agent, journal),
  réglages, palette ⌘K (plein texte), capture ⌘L / `savoir --capture`, suivi de Claude (F), lancement animé.
- Direct : journal agent interrogé toutes les 2,5 s ; toute nouvelle action rafraîchit les données.
- Choix faits sans Chris (à revoir s'il le souhaite) : nom « Savoir » ; tokens de surlignage proposés par Claude
  Design adoptés tels quels ; « Retenir » tranche sans confirmation mais propose « Annuler et rouvrir » ; lancement
  complet au premier démarrage et après mise à jour, fondu court sinon ; la pastille Claude ouvre l'écran Claude (pas de
  tiroir) ; composants JSX tolérés jusqu'à ~60 lignes (formateur), logique ≤ 35 lignes.
- Hyprland : le raccourci global X11 ne voit pas les touches sous Wayland → lier
  `bind = CTRL SHIFT, SPACE, exec, ~/.local/bin/savoir --capture` (non ajouté à la config de Chris).

## Organisation de la base (données, pas dans git)
- Listes : 🧭 Décisions · 📚 Sources · 🗂️ Projets · 📘 Guide.
- Tags : `projet:<nom>`, `statut:ouverte|tranchée|abandonnée`, `sujet:<thème>` ; couleurs jaune=clé, vert=pour,
  rouge=risque, bleu=à creuser.
- Note « Mode d'emploi » (liste Guide) : conventions + modèle de fiche de décision.
- Skill Claude `~/.claude/skills/karakeep/SKILL.md` : quand et comment utiliser Karakeep vs mémoire sémantique.

## CI
- GitHub Actions activé sur le fork ; seul le workflow `CI` (lint, format, typecheck, tests + E2E, spec OpenAPI) est
  actif, sur push `main`/`echo`. Les workflows de release (docker, mobile, extension, npm) sont désactivés.
- Règle : CI verte à chaque étape clé poussée (`gh run watch --exit-status`).

## Vérifié (30/09)
- Surlignages par citation posés au caractère près (gras, apostrophes typographiques), visibles dans le lecteur.
- Note avec bannière, surlignages colorés, schéma mermaid et image intégrée : rendu contrôlé dans Chrome.
- Surlignage ajouté par le MCP apparu sans rechargement dans un onglet ouvert.

## Vérifié (30/09, nuit)
- Mode suivi de bout en bout : surlignage posé par le MCP → l'app ouvre le lecteur, balaye le passage (pointillé
  Claude), carte CLAUDE dans le panneau, bandeau puis notification récapitulative.
- Surlignage depuis l'app : décalages identiques à ceux du serveur/MCP (vérifié sur le texte linkedom).
- Fiche de décision : création, retenir, annuler ; capture d'une note ; palette plein texte ; build de production
  installé et lancé ; `savoir --capture` rejoint l'instance ouverte.

## Limites connues
- Joignable seulement sur le réseau local (bind 0.0.0.0) ; pas de tunnel.
- Savoir : PDF non affichés dans l'app (WebKitGTK), ouverture externe à ajouter ; pas de tiroir d'activité.
- Pas d'inférence IA intégrée (tags/résumés auto) : c'est Claude qui classe via le MCP.
- WebKitGTK 2.52 : plantage SIGFPE quand le suivi DRM de la fréquence d'écran lit 0 Hz (veille/réveil d'écran).
  Parade : `WEBKIT_FORCE_VBLANK_TIMER=1`, posé par Savoir au démarrage (`src-tauri/src/lib.rs`) et par ses
  lanceurs. Touche aussi les autres apps WebKit de la machine (variable ajoutée à l'environnement Hyprland).
