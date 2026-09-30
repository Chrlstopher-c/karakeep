import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "@karakeep/shared-react/trpc";

// Vue en direct : le journal des agents (fork Echo) est sondé toutes les 4 s ;
// quand un agent comme Claude a agi, les données affichées sont rechargées.
// Sans action d'agent, rien n'est rechargé (pas d'éléments reconstruits sous le curseur).
const LIVE_ROUTERS = new Set(["bookmarks", "highlights", "lists", "tags"]);
const LIVE_INTERVAL_MS = 4000;

export function useLiveRefresh(enabled: boolean): void {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const latest = useQuery({
    ...trpc.agentActivity.list.queryOptions({ limit: 1 }),
    enabled,
    refetchInterval: LIVE_INTERVAL_MS,
    refetchIntervalInBackground: false,
  });
  const newestId = latest.data?.items[0]?.id;
  const seen = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (newestId === undefined) return;
    if (seen.current !== undefined && seen.current !== newestId) {
      void queryClient.invalidateQueries({
        refetchType: "active",
        predicate: (query) => {
          const path = query.queryKey[0];
          return Array.isArray(path) && LIVE_ROUTERS.has(String(path[0]));
        },
      });
    }
    seen.current = newestId;
  }, [newestId, queryClient]);
}

export function LiveRefresh({ enabled }: { enabled: boolean }): null {
  useLiveRefresh(enabled);
  return null;
}
