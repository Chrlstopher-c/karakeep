import type { Route, ScreenId } from "../app/navigation";
import type { ThemePreference } from "../app/useTheme";

export interface PaletteCommand {
  id: string;
  title: string;
  kbd?: string;
  keywords: string;
  run: () => void;
}

export interface CommandContext {
  go: (route: Route) => void;
  theme: ThemePreference;
  setTheme: (t: ThemePreference) => void;
  toggleFollow: () => void;
  openCapture: () => void;
}

const NAV_COMMANDS: { screen: ScreenId; title: string; kbd?: string; keywords: string }[] = [
  { screen: "home", title: "Aller à l’accueil", keywords: "accueil home" },
  { screen: "decisions", title: "Aller aux décisions", kbd: "G D", keywords: "décisions fiches" },
  { screen: "sources", title: "Aller aux sources", kbd: "G S", keywords: "sources liens" },
  { screen: "highlights", title: "Aller aux surlignages", kbd: "G H", keywords: "surlignages passages" },
  { screen: "projects", title: "Aller aux projets", kbd: "G P", keywords: "projets" },
  { screen: "tags", title: "Aller aux tags", keywords: "tags étiquettes" },
  { screen: "claude", title: "Claude et journal d’activité", keywords: "claude journal mcp intégration" },
  { screen: "settings", title: "Réglages", kbd: "⌘/", keywords: "réglages paramètres settings" },
];

function actionCommands(ctx: CommandContext): PaletteCommand[] {
  const next = ctx.theme === "clair" ? "night" : "clair";
  return [
    {
      id: "capture",
      title: "Ajouter un lien ou une note",
      kbd: "⌘L",
      keywords: "ajouter capture nouveau lien note",
      run: ctx.openCapture,
    },
    { id: "follow", title: "Suivre Claude", kbd: "F", keywords: "suivre claude suivi direct", run: ctx.toggleFollow },
    {
      id: "theme",
      title: `Basculer le thème : ${next}`,
      keywords: "thème theme clair night sombre",
      run: () => ctx.setTheme(next),
    },
  ];
}

export function buildCommands(ctx: CommandContext): PaletteCommand[] {
  const nav = NAV_COMMANDS.map((c) => ({
    id: c.screen,
    title: c.title,
    kbd: c.kbd,
    keywords: c.keywords,
    run: () => ctx.go({ screen: c.screen }),
  }));
  return [...actionCommands(ctx), ...nav];
}

function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export function matchCommands(commands: PaletteCommand[], query: string): PaletteCommand[] {
  const q = normalize(query.trim());
  if (!q) return commands.slice(0, 6);
  return commands.filter((c) => normalize(`${c.title} ${c.keywords}`).includes(q));
}
