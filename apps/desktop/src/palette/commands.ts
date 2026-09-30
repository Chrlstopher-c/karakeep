import type { Route } from "../app/navigation";
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

export function buildCommands(ctx: CommandContext): PaletteCommand[] {
  return [
    {
      id: "capture",
      title: "Ajouter un lien ou une note",
      kbd: "⌘L",
      keywords: "ajouter capture nouveau lien note",
      run: ctx.openCapture,
    },
    {
      id: "follow",
      title: "Suivre Claude",
      kbd: "F",
      keywords: "suivre claude suivi direct",
      run: ctx.toggleFollow,
    },
    {
      id: "theme",
      title:
        ctx.theme === "clair"
          ? "Basculer le thème : night"
          : "Basculer le thème : clair",
      keywords: "thème theme clair night sombre",
      run: () => ctx.setTheme(ctx.theme === "clair" ? "night" : "clair"),
    },
    {
      id: "home",
      title: "Aller à l’accueil",
      keywords: "accueil home",
      run: () => ctx.go({ screen: "home" }),
    },
    {
      id: "decisions",
      title: "Aller aux décisions",
      kbd: "G D",
      keywords: "décisions fiches",
      run: () => ctx.go({ screen: "decisions" }),
    },
    {
      id: "sources",
      title: "Aller aux sources",
      kbd: "G S",
      keywords: "sources liens",
      run: () => ctx.go({ screen: "sources" }),
    },
    {
      id: "highlights",
      title: "Aller aux surlignages",
      kbd: "G H",
      keywords: "surlignages passages",
      run: () => ctx.go({ screen: "highlights" }),
    },
    {
      id: "projects",
      title: "Aller aux projets",
      kbd: "G P",
      keywords: "projets",
      run: () => ctx.go({ screen: "projects" }),
    },
    {
      id: "tags",
      title: "Aller aux tags",
      keywords: "tags étiquettes",
      run: () => ctx.go({ screen: "tags" }),
    },
    {
      id: "claude",
      title: "Claude et journal d’activité",
      keywords: "claude journal mcp intégration",
      run: () => ctx.go({ screen: "claude" }),
    },
    {
      id: "settings",
      title: "Réglages",
      kbd: "⌘/",
      keywords: "réglages paramètres settings",
      run: () => ctx.go({ screen: "settings" }),
    },
  ];
}

function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export function matchCommands(
  commands: PaletteCommand[],
  query: string,
): PaletteCommand[] {
  const q = normalize(query.trim());
  if (!q) return commands.slice(0, 6);
  return commands.filter((c) =>
    normalize(`${c.title} ${c.keywords}`).includes(q),
  );
}
