import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "@karakeep/shared-react/trpc";
import type { ZHighlight } from "@karakeep/shared/types/highlights";

const MAX_HIGHLIGHTS = 1000;

export interface AllHighlights {
  list: ZHighlight[];
  byBookmark: Map<string, ZHighlight[]>;
  loading: boolean;
}

// Base personnelle : tous les surlignages tiennent en une requête.
export function useAllHighlights(): AllHighlights {
  const trpc = useTRPC();
  const { data, isPending } = useQuery(
    trpc.highlights.getAll.queryOptions({ limit: MAX_HIGHLIGHTS }),
  );
  return useMemo(() => {
    const list = data?.highlights ?? [];
    const byBookmark = new Map<string, ZHighlight[]>();
    for (const h of list)
      byBookmark.set(h.bookmarkId, [
        ...(byBookmark.get(h.bookmarkId) ?? []),
        h,
      ]);
    return { list, byBookmark, loading: isPending };
  }, [data, isPending]);
}
