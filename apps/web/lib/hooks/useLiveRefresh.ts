import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

// Vue en direct : tant que l'onglet est visible, les données affichées sont
// rechargées régulièrement, pour voir apparaître ce qu'un agent fait via l'API.
const LIVE_ROUTERS = new Set(["bookmarks", "highlights", "lists", "tags"]);
const LIVE_INTERVAL_MS = 4000;

export function useLiveRefresh(): void {
  const queryClient = useQueryClient();
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      void queryClient.invalidateQueries({
        refetchType: "active",
        predicate: (query) => {
          const path = query.queryKey[0];
          return Array.isArray(path) && LIVE_ROUTERS.has(String(path[0]));
        },
      });
    }, LIVE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [queryClient]);
}

export function LiveRefresh(): null {
  useLiveRefresh();
  return null;
}
