import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

// Vue en direct : tant que l'onglet est visible, les données affichées sont
// rechargées régulièrement, pour voir apparaître ce qu'un agent fait via l'API.
const LIVE_ROUTERS = new Set(["bookmarks", "highlights", "lists", "tags"]);
const LIVE_INTERVAL_MS = 4000;

// Pas de rechargement pendant une interaction (dialogue, menu, saisie) : les
// éléments se reconstruiraient sous le curseur.
function isInteracting(): boolean {
  const active = document.activeElement;
  const typing =
    active instanceof HTMLInputElement ||
    active instanceof HTMLTextAreaElement ||
    (active instanceof HTMLElement && active.isContentEditable);
  return (
    typing ||
    document.querySelector(
      '[role="dialog"], [role="menu"], [role="listbox"], [data-radix-popper-content-wrapper]',
    ) !== null
  );
}

export function useLiveRefresh(): void {
  const queryClient = useQueryClient();
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState !== "visible" || isInteracting()) return;
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
