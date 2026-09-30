import type { ZBookmark } from "@karakeep/shared/types/bookmarks";

// Conventions de la base Echo (note « Mode d'emploi », liste Guide) :
// listes Décisions / Sources / Projets / Guide, tags projet:<nom>, statut:<état>, sujet:<thème>.

export const LIST_NAMES = {
  decisions: "Décisions",
  sources: "Sources",
  projects: "Projets",
  guide: "Guide",
} as const;

export type KnowledgeListKey = keyof typeof LIST_NAMES;

export type DecisionStatus = "ouverte" | "tranchée" | "abandonnée";

export const DECISION_STATUSES: DecisionStatus[] = [
  "ouverte",
  "tranchée",
  "abandonnée",
];

function tagValue(bookmark: ZBookmark, prefix: string): string | null {
  const tag = bookmark.tags.find((t) => t.name.startsWith(`${prefix}:`));
  return tag ? tag.name.slice(prefix.length + 1) : null;
}

export function projectOf(bookmark: ZBookmark): string | null {
  return tagValue(bookmark, "projet");
}

export function statusOf(bookmark: ZBookmark): DecisionStatus {
  const value = tagValue(bookmark, "statut");
  return DECISION_STATUSES.find((s) => s === value) ?? "ouverte";
}

// Tags affichés tels quels sur les cartes : on masque les tags de convention.
export function plainTags(bookmark: ZBookmark): string[] {
  return bookmark.tags
    .map((t) => t.name)
    .filter((name) => !/^(projet|statut):/.test(name))
    .map((name) => name.replace(/^sujet:/, ""));
}
