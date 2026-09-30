import { useEffect, useMemo, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "@karakeep/shared-react/trpc";

const POLL_MS = 2_500;
const BUSY_WINDOW_MS = 25_000;

export interface AgentActivityItem {
  id: string;
  agent: string;
  path: string;
  bookmarkId: string | null;
  bookmarkTitle: string | null;
  highlightId: string | null;
  listId: string | null;
  detail: Record<string, unknown> | null;
  createdAt: Date;
}

export interface AgentActivity {
  items: AgentActivityItem[];
  busy: boolean;
  lastAt: Date | null;
}

// Journal des actions de Claude, interrogé en continu ; toute nouvelle action
// rafraîchit les données de la base pour que l'app montre le direct.
export function useAgentActivity(): AgentActivity {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data } = useQuery({
    ...trpc.agentActivity.list.queryOptions({ limit: 100 }),
    refetchInterval: POLL_MS,
  });
  const items = data?.items ?? [];
  const newestId = items[0]?.id;
  const seen = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!newestId) return;
    if (seen.current && seen.current !== newestId) {
      void queryClient.invalidateQueries({
        predicate: (q) => !String(q.queryKey[0]).includes("agentActivity"),
      });
    }
    seen.current = newestId;
  }, [newestId, queryClient]);

  const lastAt = items[0]?.createdAt ?? null;
  const busy =
    lastAt !== null && Date.now() - lastAt.getTime() < BUSY_WINDOW_MS;
  return { items, busy, lastAt };
}

export function useProvenance(): {
  bookmarkIds: Set<string>;
  highlightIds: Set<string>;
} {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.agentActivity.provenance.queryOptions());
  return useMemo(
    () => ({
      bookmarkIds: new Set(data?.bookmarkIds ?? []),
      highlightIds: new Set(data?.highlightIds ?? []),
    }),
    [data],
  );
}
