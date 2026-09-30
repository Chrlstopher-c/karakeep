import { useCallback, useEffect, useRef, useState } from "react";

import { useOpenBookmark } from "../knowledge/useOpenBookmark";
import { activitySentence } from "./describeActivity";
import type { AgentActivityItem } from "./useAgentActivity";

export interface Follow {
  following: boolean;
  status: string;
  start: () => void;
  stop: () => AgentActivityItem[];
  toggle: () => void;
}

// Mode suivi : l'app ouvre ce sur quoi Claude travaille. L'arrêter n'arrête pas Claude.
export function useFollow(items: AgentActivityItem[]): Follow {
  const { open } = useOpenBookmark();
  const [following, setFollowing] = useState(false);
  const startedAt = useRef<Date>(new Date());
  const lastSeen = useRef<string | undefined>(undefined);
  const newest = items[0];

  useEffect(() => {
    if (!following || !newest || newest.id === lastSeen.current) return;
    lastSeen.current = newest.id;
    if (newest.createdAt < startedAt.current || !newest.bookmarkId) return;
    if (newest.path === "bookmarks.deleteBookmark") return;
    open(newest.bookmarkId, newest.highlightId ?? undefined);
  }, [following, newest, open]);

  const start = useCallback(() => {
    startedAt.current = new Date(Date.now() - 1000);
    lastSeen.current = undefined;
    setFollowing(true);
  }, []);
  const stop = useCallback(() => {
    setFollowing(false);
    return items.filter((i) => i.createdAt >= startedAt.current);
  }, [items]);
  const toggle = useCallback(
    () => (following ? void stop() : start()),
    [following, start, stop],
  );

  const status =
    newest && newest.createdAt >= startedAt.current
      ? activitySentence(newest)
      : "En attente de la prochaine action de Claude…";
  return { following, status, start, stop, toggle };
}
