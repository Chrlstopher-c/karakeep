import type { AgentActivityItem } from "./useAgentActivity";

// Phrase courte du journal (« a surligné un passage dans »), suivie du titre de la source.
const VERBS: Record<string, string> = {
  "bookmarks.createBookmark": "a ajouté",
  "bookmarks.updateBookmark": "a modifié",
  "bookmarks.updateBookmarkText": "a rédigé",
  "bookmarks.deleteBookmark": "a supprimé",
  "bookmarks.updateTags": "a classé",
  "bookmarks.attachFile": "a illustré",
  "highlights.create": "a surligné un passage dans",
  "highlights.update": "a annoté un passage de",
  "highlights.delete": "a retiré un surlignage de",
  "lists.addToList": "a rangé",
  "lists.removeFromList": "a retiré d'une liste",
  "lists.create": "a créé une liste",
  "assets.attachAsset": "a illustré",
};

export function activityVerb(item: AgentActivityItem): string {
  if (VERBS[item.path]) return VERBS[item.path];
  const [domain] = item.path.split(".");
  return domain === "tags" ? "a réorganisé les tags" : "a agi sur";
}

export function activityTarget(item: AgentActivityItem): string {
  const name = typeof item.detail?.name === "string" ? item.detail.name : null;
  return item.bookmarkTitle ?? name ?? "";
}

export function activitySentence(item: AgentActivityItem): string {
  return `Claude ${activityVerb(item)} ${activityTarget(item)}`.trim();
}

// Résumé groupé : « 1 source ajoutée, 2 passages surlignés, 1 fiche rédigée ».
export function summarize(items: AgentActivityItem[]): string {
  const count = (path: string): number =>
    items.filter((i) => i.path === path).length;
  const parts: string[] = [];
  const add = (n: number, one: string, many: string): void => {
    if (n > 0) parts.push(`${n} ${n > 1 ? many : one}`);
  };
  const added = count("bookmarks.createBookmark");
  const highlighted = count("highlights.create");
  const written = count("bookmarks.updateBookmarkText");
  add(added, "source ajoutée", "sources ajoutées");
  add(highlighted, "passage surligné", "passages surlignés");
  add(written, "fiche rédigée", "fiches rédigées");
  add(
    items.length - added - highlighted - written,
    "autre action",
    "autres actions",
  );
  return parts.join(", ");
}
