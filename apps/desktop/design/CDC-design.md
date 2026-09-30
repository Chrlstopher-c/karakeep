# Cahier des charges design — Echo Savoir (client desktop de la base de connaissance)

> Destinataire : Claude Design (Opus 5.5). Objet : concevoir **toutes les maquettes, le système de composants et les
> spécifications de mouvement** d'une application desktop. Pièces jointes : `tokens.css` (design system Echo Agency) et
> `brand/` (wordmark, symbole, animation d'apparition du logo).

---

## 1. Contexte

**Echo Savoir** est la base de connaissance et l'outil de décision de Chris (fondateur d'Echo Agency) et de son agent
Claude. On y range des **sources** (articles web, PDF, images), on les **surligne**, on écrit des **notes illustrées**
(Markdown, schémas, images) et des **fiches de décision**. Claude travaille dans la base **en même temps** que Chris,
via un serveur MCP : il ajoute des sources, surligne des passages, rédige et illustre des fiches.

**La promesse du produit : Chris ouvre l'app et voit concrètement tout ce qui se passe** — ce que Claude lit, surligne,
écrit, en direct, avec des animations qui rendent chaque action lisible.

Techniquement, c'est un nouveau client desktop (Tauri 2, fenêtre native, rendu web React) posé sur un moteur existant
(Karakeep, forké). Le serveur tourne à part, sur une machine du réseau local ; l'app n'est qu'un client. Ce qui compte
pour le design : **tout le contenu vient d'une API** (chargements, états hors ligne, mises à jour en direct à prévoir).

## 2. Les trois exigences qui priment sur tout

1. **Full motion design.** Chaque changement d'état est une animation continue, jamais une coupure : ouvrir une source,
   changer d'écran, filtrer, surligner, recevoir une action de Claude. L'espace est continu — un élément qui s'ouvre
   *vient* de quelque part et y *retourne*.
2. **Navigation simple et totalement fluide.** Un seul niveau de navigation, tout contenu à deux gestes maximum, une
   palette de commandes (⌘K) qui mène partout, le clavier partout. Aucune attente perçue : l'interface répond au geste
   avant que les données n'arrivent (état optimiste, squelettes animés).
3. **Claude intégré nativement.** Claude n'est pas un chatbot collé dans un coin : c'est un **co-auteur visible**. Sa
   présence, ses actions et leur provenance font partie du design de chaque écran (détail § 7).

## 3. Utilisateurs et usages

- **Chris** — une seule personne, usage quotidien sur desktop Linux (grands écrans, gestionnaire de fenêtres en tuiles,
  clavier très utilisé). Il lit, surligne, relit les fiches de Claude, tranche des décisions.
- **Claude** — agent qui écrit via l'API. Il ne « voit » pas l'interface, mais tout ce qu'il fait doit y apparaître.

Parcours clés (à prototyper, § 10) :
1. Ouvrir l'app → voir ce qui a bougé depuis la dernière fois (dont le travail de Claude) → ouvrir une fiche.
2. Parcourir les Sources → ouvrir un article → sélectionner un passage → le surligner en couleur avec une note.
3. Regarder Claude travailler en direct (« mode suivi ») : il ajoute une source, la surligne, rédige une fiche.
4. Capture rapide par raccourci global (lien, note, fichier) depuis n'importe quelle application.
5. Retrouver une idée en quelques frappes (⌘K : recherche plein texte + commandes).

## 4. Design system — Echo Agency (obligatoire)

Source de vérité : `tokens.css` joint. **Aucune couleur, ombre, rayon ou police hors de ces tokens.** Si un besoin
n'est pas couvert, le signaler et proposer un token, ne pas l'inventer en silence.

### 4.1 Intention
Sérieux, chaleureux, net. Neutres **sable chauds** (jamais de gris froid, jamais de blanc pur en fond), **un seul accent
violet** réservé à l'action et à ce qui compte, **violet profond « night »** pour les surfaces sombres, titres **gras et
serrés**, **mono en capitales** pour les étiquettes. Rien de décoratif sans raison ; chaque couleur a un rôle.

### 4.2 Thème
- **Night par défaut** (app d'outil et de lecture) : fond `night #1E1830`, surfaces `night-2 #251E38` / `night-3
  #2E2644` / `night-4 #3A3150`, filets `night-line #362D4D`, texte `night-text #F3F1F6`, secondaire `night-soft #C8C4D0`
  / `night-muted #A39DB5`. Accent sur night : **`brand-400 #A774D4` ou `brand-light #D5B8F0`** — jamais `brand-600`
  (trop sombre sur night).
- **Clair en option** (réglage) : fond `canvas #FAFAF9`, cartes blanches `shadow-ring`, encre `ink #141414`, accent
  `brand-600 #7D48B5`. Maquetter en clair au minimum : grille, lecteur, note.
- Ne jamais mélanger un gris froid (#111, #1c1c1c…) avec la palette night.

### 4.3 Tokens principaux
| Rôle | Token | Valeur |
|---|---|---|
| Accent action / actif | `brand-600` (clair) · `brand-400` (night, pastilles, barres) | `#7D48B5` · `#A774D4` |
| Teintes d'accent | `brand-50…300`, `brand-light` | `#FAF7FD` → `#C9A6EA`, `#D5B8F0` |
| Accent foncé | `brand-700/800/900` | `#5E3290` / `#56298A` / `#3F1F66` |
| Neutres clairs | `canvas`, `sand-100…600`, `ink`, `ink-soft`, `muted`, `subtle` | voir tokens.css |
| États | `success` / `danger` / `warning` (+ `-bg`) | `#0B7A52` / `#B42318` / `#7A4800` |
| Rayons | cartes / panneaux / contrôles / pastilles | 24 / 28 / 10–14 / 999 px |
| Ombres | `ring`, `soft`, `lifted`, `float`, `menu`, `modal` | filet 1 px + ombre longue et douce |
| Easing | `ease-out-soft` · ressort | `cubic-bezier(.2,.7,.2,1)` · `cubic-bezier(.34,1.4,.64,1)` |

**Typographie** : **Manrope** (titres 800, interlettrage −0,025 à −0,05 em ; texte 400–600) et **JetBrains Mono**
(400/500 : étiquettes, chiffres, métadonnées, raccourcis). Échelle d'app : t1 28/800, t2 19/800, t3 16/700, corps 16,
small 14, xs 12. **Lecteur** : proposer une échelle de lecture dédiée (corps 18–19 px, mesure 66–72 caractères,
interligne généreux) — c'est l'écran où Chris passe le plus de temps.

### 4.4 Composants signature (à reproduire, pas à réinventer)
- **Bouton plein** : pilule, 44–52 px, Manrope 700, accent + relief `0 4px 0 brand-800` + halo violet ; s'enfonce de
  3 px à l'appui. Sur night : bouton blanc à relief `brand-300`. **Contrôles d'app** : 40 px, rayon 10, 14 px/700.
- **Surtitre `eyebrow`** : JetBrains Mono 13 px capitales, interlettrage .14em, `brand-light` sur night, précédé d'un
  carré violet 8×8 rayon 2.
- **Pastille inclinée** (`HighlightPill`) : mot clé en blanc sur `brand-400`, rayon 14–18, −2,5° ; survol +2° et ×1,08
  avec le ressort. Une par titre maximum (titres d'écran, écran d'accueil).
- **Tag** : pilule `brand-100`/`brand-700` (clair) — à décliner sur night.
- **Carte** : rayon 24 ; night = `night-2` + filet `night-line` ; survol = soulèvement −4 px + ombre longue.
- **Barre latérale** : night, 248 px, liens 40 px rayon 10, actif = fond `#342B4A` + **filet gauche 3 px `brand-400`**,
  compteurs en pastille.
- **États vides et erreurs** : phrase simple + une action ; couleurs d'état uniquement pour l'état.

### 4.5 Marque
- Nom du produit **« Savoir »** en tête (Manrope 800) ; signature Echo Agency discrète (wordmark petit ou « un outil
  Echo Agency ») dans la barre de titre ou l'écran « À propos ». Fichiers : `brand/wordmark.svg`, `brand/symbol-*.svg`.
- **Écran de lancement** : animation `brand/logo-reveal-white.svg` (symbole → wordmark, 2,48 s), puis fondu vers l'app.
  Ne la jouer qu'au démarrage à froid, pas à chaque ouverture de fenêtre.
- Icône d'app : symbole H+N ou pictogramme « Savoir » sur carré arrondi `night` — proposer 2 pistes.

### 4.6 Ton des textes
Français simple et concret, ni tutoiement ni vouvoiement : interface neutre, à l'infinitif ou impersonnelle (« Ajouter une
source », « Aucune décision ouverte »). Phrases courtes, aucun superlatif, espaces insécables avant `: ; ? !`.
Libellés d'action = verbes.

## 5. Mouvement — spécification

Bibliothèque cible : **Framer Motion** (`motion/react`) ; GSAP autorisé pour les séquences longues (écran de lancement).
Chaque maquette d'écran doit s'accompagner de ses **transitions d'entrée et de sortie** et des micro-interactions de ses
composants, avec durées et courbes.

### 5.1 Principes
- **Continuité spatiale** : élément partagé entre écrans (carte de la grille → en-tête du lecteur ; surlignage de la
  liste « Surlignages » → passage dans l'article). Le retour rejoue le chemin à l'envers.
- **Hiérarchie temporelle** : le contenant bouge d'abord, le contenu suit en cascade (décalage 40–80 ms).
- **Interruptible** : toute animation peut être interrompue par un nouveau geste ; l'entrée clavier n'attend jamais la
  fin d'une animation.
- **Physique douce** : ressort pour ce qui « atterrit » (pastilles, badges, cartes insérées), `ease-out-soft` pour ce
  qui se déplace, sorties ~30 % plus rapides que les entrées.
- **Le mouvement porte du sens** : il dit d'où vient une chose, qui l'a faite, ce qui a changé. Pas d'animation gratuite.

### 5.2 Durées de référence
| Type | Durée | Courbe |
|---|---|---|
| Micro (survol, appui, bascule) | 120–180 ms | `ease-out-soft` |
| Panneau, menu, palette ⌘K | 200–260 ms | `ease-out-soft` (entrée), 140 ms (sortie) |
| Changement d'écran, élément partagé | 320–420 ms | ressort amorti (pas de rebond visible) |
| Apparition de contenu (« rise » : opacité + 16 px) | ~500 ms, cascade 60–120 ms | `ease-out-soft` |
| Surlignage qui se pose | 350–450 ms | balayage gauche → droite |
| Insertion par Claude | 450–600 ms | ressort `(.34,1.4,.64,1)` |

### 5.3 Moments à concevoir en détail
1. **Ouvrir une source** : la carte grandit jusqu'au lecteur (image, titre, domaine en éléments partagés), la barre
   latérale s'efface d'un cran, le texte monte en cascade.
2. **Surligner** : sélection → barre flottante (4 couleurs + note) qui naît du curseur ; au choix, le surlignage se
   **peint** de gauche à droite ; il apparaît en même temps dans le panneau des surlignages (insertion animée).
3. **Action de Claude** (voir § 7) : chaque type d'action a sa signature animée.
4. **Navigation latérale** : l'indicateur actif (fond + filet gauche) **glisse** d'un lien à l'autre, il ne saute pas.
5. **Filtrer / trier / rechercher** : les cartes se réorganisent en place (animation de disposition), celles qui sortent
   se replient, celles qui entrent atterrissent.
6. **Palette ⌘K** : échelle 0,98 → 1 + fondu, résultats en cascade, sélection qui glisse entre les lignes.
7. **Chargement** : squelettes aux dimensions exactes du contenu attendu, balayage lumineux lent et discret ; passage
   squelette → contenu en fondu enchaîné sans saut de mise en page.
8. **Hors ligne** : le serveur est une machine qui peut être éteinte. Bandeau calme (pas d'alarme), contenu déjà chargé
   consultable en lecture seule, reconnexion animée.

### 5.4 Contraintes de rendu (importantes)
- Le rendu est **WebKitGTK sous Linux** (pas Chromium) : n'animer que `transform` et `opacity`. **Pas de flou animé**,
  pas de `backdrop-filter` sur de grandes surfaces, pas d'animation d'ombre portée (animer l'opacité d'un pseudo-élément
  qui porte l'ombre). Cible : 60 i/s sur un écran 1440p.
- **Mouvement réduit** : chaque animation a sa variante sobre (fondus courts, pas de déplacement) — à spécifier.

## 6. Navigation et architecture de l'information

### 6.1 Structure (un seul niveau)
Barre latérale night, repliable en rail d'icônes (64 px) :
- **Accueil** — ce qui a bougé : nouveautés, travail récent de Claude, décisions ouvertes.
- **Décisions** · **Sources** · **Projets** — les trois listes maîtresses (+ listes secondaires dessous, repliables).
- **Surlignages** — tous les passages surlignés, filtrables par couleur, source, auteur (Chris / Claude).
- **Tags**.
- **Claude** — activité en direct, état de la connexion MCP (§ 7).
- En bas : Réglages, état du serveur (pastille), avatar Chris.

En tête de chaque écran : titre (t1), fil d'Ariane court, actions principales à droite, bouton **Ajouter**.

### 6.2 Clavier (à faire figurer dans les maquettes : infobulles, aide ⌘/)
⌘K palette · ⌘N nouvelle note · ⌘L nouveau lien · `/` rechercher · `j`/`k` élément suivant/précédent · Entrée
ouvrir · Échap retour · `g d` / `g s` / `g p` / `g h` aller à Décisions / Sources / Projets / Surlignages · `1`–`4`
surligner la sélection dans une couleur · `e` éditer · `f` suivre Claude · ⌘←/⌘→ historique.

### 6.3 Fenêtres
- Fenêtre principale : 1440×900 de référence, minimum 960×640, barre de titre intégrée à l'app (zone de glissement,
  boutons fenêtre discrets) — pensée aussi pour un gestionnaire de fenêtres en tuiles (sans barre du tout).
- **Fenêtre de capture** (raccourci global) : ~560×360, centrée, sans décor, champ unique qui détecte lien / texte /
  fichier déposé, choix de liste et tags, Entrée pour ranger, Échap pour fermer. Apparition en 200 ms.

## 7. Intégration de Claude Code

### 7.1 Principe technique (pour comprendre ce qu'on dessine)
Claude Code se connecte à la base via un **serveur MCP** (`karakeep`) déclaré dans la configuration utilisateur de
Claude Code. Il dispose d'une trentaine d'outils : créer / modifier / supprimer des favoris et des notes, **surligner
un passage en le citant**, téléverser des images et PDF, gérer listes et tags, rechercher. Ses actions arrivent par
l'API comme celles de Chris ; l'app les reçoit en quasi temps réel.

### 7.2 Ce que l'interface doit montrer
- **Présence** : un indicateur « Claude » (pastille animée, calme au repos, vivante quand il agit) visible sur tous les
  écrans, dans la barre latérale.
- **Provenance** : tout ce que Claude a créé ou modifié porte une marque discrète et cohérente (favori, surlignage,
  note, tag). Filtre « par Claude » / « par Chris » partout où c'est utile.
- **Journal d'activité** (écran Claude + panneau latéral rétractable) : fil chronologique — « a ajouté *Titre* à
  Sources », « a surligné 3 passages dans *Titre* », « a rédigé la fiche *Titre* » — chaque ligne cliquable ouvre
  l'objet à l'endroit exact (le passage, la section de note).
- **Mode suivi** (`f`) : l'app suit Claude — elle ouvre la source ou la note sur laquelle il travaille et y montre ses
  actions à mesure qu'elles arrivent (surlignage qui se peint, paragraphe qui s'insère, image qui apparaît). Un bandeau
  indique le mode et permet d'en sortir.
- **Signatures animées des actions de Claude** (à différencier des actions de Chris, sans être criardes) : insertion de
  carte, surlignage qui se peint, texte de note qui s'écrit ou se met à jour (différence mise en évidence brièvement
  puis fondue), image qui se développe.
- **Notifications** : discrètes, groupées (« Claude a surligné 5 passages dans 2 sources »), jamais une pile de toasts.

### 7.3 Écran « Claude » — configuration native
- État de la connexion MCP : **connecté** (dernière action il y a…), **configuré mais inactif**, **non configuré**.
- Bouton **« Ajouter à Claude Code »** : l'app écrit elle-même la déclaration du serveur MCP dans la configuration
  utilisateur de Claude Code (avec une clé d'accès dédiée à Claude, générée par l'app). Afficher le résultat et la
  commande équivalente pour vérification.
- Gestion de la clé de Claude : créée le …, dernière utilisation, **révoquer / régénérer** (confirmation).
- Liste des outils disponibles côté Claude (lecture seule, repliable) — utile pour comprendre ce qu'il peut faire.

## 8. Écrans à maquetter

Pour chacun : night (obligatoire), clair pour 1, 3, 5, 6 ; états **vide, chargement, erreur/hors ligne** ; transitions.

1. **Lancement et premier démarrage** : animation du logo, puis connexion au serveur (adresse + clé), test animé de la
   connexion, arrivée sur l'Accueil.
2. **Accueil** : bloc « Depuis la dernière visite », activité de Claude,
   décisions ouvertes, dernières sources, reprise de lecture.
3. **Grille / liste de favoris** (Sources et toutes les listes) : bascule grille / liste / compact ; cartes par type —
   **lien** (image, titre, domaine, extrait, nb de surlignages), **note** (titre, début du texte, schéma miniature),
   **image**, **PDF** ; tags, provenance, sélection multiple et actions groupées, tri, filtres.
4. **Liste « Décisions »** : vue spécialisée — statut (ouverte / tranchée / abandonnée) comme colonnes ou filtres, date,
   projet ; carte de décision qui montre l'option retenue.
5. **Lecteur d'article** : texte mis en page pour la lecture, surlignages en 4 couleurs, barre flottante de surlignage,
   panneau latéral (surlignages de l'article avec notes, métadonnées, tags, listes), bascule vers la capture d'écran
   ou l'archive de la page, progression de lecture.
6. **Note** : lecture et édition. Markdown riche : titres, tableaux, **texte surligné en couleur**, **schémas Mermaid**
   rendus, images intégrées, bannière. Édition en place (pas d'éditeur séparé), aperçu instantané, insertion d'image par
   glisser-déposer.
7. **Fiche de décision** : gabarit de note spécialisé — Contexte, Options (tableau pour / contre), **Décision** mise en
   exergue, Conséquences, Sources liées (cartes cliquables vers les passages surlignés).
8. **Surlignages** : mur de citations par couleur / source / auteur, chaque citation mène au passage exact.
9. **Palette ⌘K** : recherche plein texte (résultats typés, extrait avec termes en évidence) + commandes + navigation.
10. **Tags** : nuage ou liste avec comptes, fusion / renommage.
11. **Fenêtre de capture rapide** (§ 6.3).
12. **Claude** (§ 7.3) et **panneau d'activité**.
13. **Réglages** : serveur, thème (night / clair / système), raccourcis, compte, à propos (signature Echo Agency).
14. **Aperçus** image et PDF plein écran.

## 9. Sémantique des surlignages (données fixes)

Quatre couleurs existent dans les données : `yellow`, `green`, `red`, `blue`. Leur **sens** est fixé ; leur **teinte**
est à dessiner dans l'esprit du design system, lisible sur night comme sur clair, et distincte de l'accent violet :
| Clé | Sens | Usage |
|---|---|---|
| `yellow` | passage clé, définition | par défaut |
| `green` | argument pour, acquis | décisions |
| `red` | risque, argument contre | décisions |
| `blue` | à creuser, question ouverte | lecture |
Même rendu pour un surlignage d'article et pour `==texte==` dans une note. Légende accessible depuis la barre flottante.

## 10. Prototypes interactifs attendus
Enchaînements cliquables avec le mouvement réel :
1. Accueil → carte de source → lecteur (élément partagé) → retour.
2. Sélection d'un passage → barre flottante → surlignage peint → apparition dans le panneau.
3. **Mode suivi** : Claude ajoute une source, la surligne (2 passages), crée une fiche de décision qui s'écrit.
4. ⌘K → recherche → ouverture d'un passage surligné.
5. Raccourci global → capture → rangement → la carte atterrit dans la liste.
6. Changement de thème night → clair (transition douce, pas de flash).

## 11. Contenu d'exemple (à utiliser dans les maquettes)
- Liste Sources : « Decision matrix » (Wikipédia, 2 surlignages), articles sur les tunnels réseau, le design de
  systèmes de notes, un PDF « Guide d'architecture ».
- Décisions : « Héberger la base sur le portable » (tranchée), « Ouvrir l'accès hors de la maison » (ouverte),
  « Client desktop Tauri » (tranchée), « Inférence locale pour les résumés » (ouverte).
- Projets : Echo, Sémaphore, Echo Agency.
- Guide : « Mode d'emploi — base de connaissance Echo ».
Aucune donnée personnelle réelle, aucune adresse de serveur réelle (utiliser `savoir.example`).

## 12. Livrables
1. **Système de composants** : planche night + clair de tous les composants (états repos / survol / actif / désactivé /
   focus clavier), avec leurs tokens.
2. **Maquettes** de tous les écrans du § 8 à 1440×900 (+ une vue 960×640 pour la grille et le lecteur).
3. **Spécifications de mouvement** par écran et par composant (déclencheur, propriétés, durée, courbe, cascade,
   variante mouvement réduit).
4. **Prototypes** du § 10.
5. De préférence **en code** : React + Tailwind 4 (`@theme` alimenté par `tokens.css`) + `motion/react`, composants
   nommés en PascalCase, sans logique métier — ils seront repris tels quels dans l'app.
6. Une courte **note de décisions** : choix faits, alternatives écartées, points à trancher par Chris.

## 13. Hors périmètre
Administration multi-utilisateurs, flux RSS, règles automatiques, imports/exports, abonnements, application mobile.
Ces fonctions restent dans l'ancienne interface web, accessible depuis Réglages.
