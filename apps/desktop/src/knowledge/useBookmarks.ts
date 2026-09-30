import { useEffect, useMemo } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { useTRPC } from "@karakeep/shared-react/trpc";
import type { ZBookmark } from "@karakeep/shared/types/bookmarks";

import { useKnowledgeLists } from "./useKnowledgeLists";

const PAGE_SIZE = 100;
const MAX_BOOKMARKS = 2000;

export interface BookmarkSet {
  bookmarks: ZBookmark[];
  loading: boolean;
}

// Toute la base, page après page (base personnelle : quelques centaines d'éléments).
export function useAllBookmarks(): BookmarkSet {
  const trpc = useTRPC();
  const query = useInfiniteQuery(
    trpc.bookmarks.getBookmarks.infiniteQueryOptions(
      { limit: PAGE_SIZE, useCursorV2: true },
      { getNextPageParam: (page) => page.nextCursor },
    ),
  );
  const bookmarks = useMemo(() => query.data?.pages.flatMap((p) => p.bookmarks) ?? [], [query.data]);
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query;
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage && bookmarks.length < MAX_BOOKMARKS) void fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, bookmarks.length]);
  return { bookmarks, loading: query.isPending };
}

export function useListBookmarks(listId: string | undefined): BookmarkSet {
  const trpc = useTRPC();
  const query = useQuery({
    ...trpc.bookmarks.getBookmarks.queryOptions({
      listId: listId ?? "",
      limit: PAGE_SIZE,
      useCursorV2: true,
    }),
    enabled: !!listId,
  });
  return {
    bookmarks: query.data?.bookmarks ?? [],
    loading: !listId || query.isPending,
  };
}

export function useDecisionBookmarks(): BookmarkSet {
  return useListBookmarks(useKnowledgeLists().decisions);
}

// Sources = tout ce qui n'est pas une fiche de décision.
export function useSourceBookmarks(): BookmarkSet {
  const all = useAllBookmarks();
  const decisions = useDecisionBookmarks();
  return useMemo(() => {
    const decisionIds = new Set(decisions.bookmarks.map((b) => b.id));
    return {
      bookmarks: all.bookmarks.filter((b) => !decisionIds.has(b.id)),
      loading: all.loading,
    };
  }, [all, decisions.bookmarks]);
}
