# Architecture — Savoir (client desktop)

Le serveur Karakeep tourne ailleurs ; Savoir est un client : webview Tauri (React) + un petit processus Rust pour ce
que le webview ne doit pas faire lui-même (fichiers de config, raccourci global, instance unique).

## Domaines (`src/`)

| Dossier | Rôle |
|---|---|
| `app/` | Coquille : navigation (pile d'écrans), barre latérale, barre de titre, bandeaux, raccourcis globaux, thème, lancement, notifications. Ne contient aucune règle métier. |
| `connection/` | Adresse + clé API : saisie, vérification, stockage (via Rust), contexte de la connexion active. |
| `knowledge/` | Conventions de la base Echo (listes Décisions/Sources/Projets/Guide, tags `projet:` `statut:` `sujet:`) et accès aux favoris qui en dépendent. Source unique de ces règles. |
| `home/` | Écran d'accueil. |
| `sources/` | Écran Sources et modèle d'affichage d'un favori (`sourceView`), réutilisé par les autres écrans. |
| `reader/` | Lecteur : rendu assaini, moteur de surlignage par décalages (`highlightDom`), balayage animé, progression, notes Markdown. |
| `decisions/` | Colonnes de décisions et fiche : analyse/écriture du modèle Markdown (`sheetModel`, testé). |
| `highlights/` | Couleurs de surlignage et mur des surlignages. |
| `projects/`, `tags/`, `settings/` | Écrans du même nom. |
| `claude/` | Présence de Claude : journal d'activité, provenance, mode suivi, intégration Claude Code (MCP). |
| `palette/` | Palette ⌘K : commandes et recherche. |
| `capture/` | Capture rapide (lien, note, fichier). |
| `shared/` | Seulement le transverse : primitives d'interface (Button, Kbd, Eyebrow…), mouvement, icônes, journal, dates. |

Côté Rust (`src-tauri/src/`) : `connection.rs` (fichier de connexion, droits 600), `claude_code.rs` (déclaration du MCP
dans `~/.claude.json`, via la CLI `claude` si présente), `capture_shortcut.rs` (Ctrl+Maj+Espace, `--capture`).

## Règles de frontière
- Un domaine n'importe d'un autre que ses hooks/composants publics (`useOpenBookmark`, `SourceCard`, `toSourceView`…),
  jamais ses détails internes.
- Les règles de la base (statut d'une décision, projet d'un favori) ne vivent que dans `knowledge/conventions.ts`.
- Tout HTML venu du web passe par `reader/sanitize.ts` ; les liens s'ouvrent dans le navigateur du système
  (`shared/openExternal`), jamais dans le webview. CSP stricte dans `tauri.conf.json`.
- Animations : transform et opacity seulement (WebKitGTK), sauf le tracé du logo au lancement.

## Données et direct
- tRPC via `@karakeep/shared-react` (clé API en Bearer). Le journal `agentActivity` est interrogé toutes les 2,5 s ;
  une nouvelle action invalide les requêtes, ce qui fait apparaître en direct ce que fait Claude.
- Provenance : `agentActivity.provenance` donne les favoris et surlignages créés par une clé agent (marque CLAUDE).
