import { summarize } from "../claude/describeActivity";
import type { AgentActivityItem } from "../claude/useAgentActivity";

const DAY_MS = 24 * 60 * 60 * 1000;

export function useSinceYesterday(items: AgentActivityItem[]): string {
  const since = Date.now() - DAY_MS;
  const recent = items.filter((i) => i.createdAt.getTime() >= since);
  if (recent.length === 0)
    return "Rien de neuf côté Claude depuis hier. La base est telle que tu l'as laissée.";
  const sheet = recent.find(
    (i) => i.path === "bookmarks.updateBookmarkText" && i.bookmarkTitle,
  );
  const tail = sheet ? ` Dernière fiche : « ${sheet.bookmarkTitle} ».` : "";
  return `Depuis hier, Claude : ${summarize(recent)}.${tail}`;
}
