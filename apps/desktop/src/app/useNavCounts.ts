import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "@karakeep/shared-react/trpc";

import { statusOf } from "../knowledge/conventions";
import {
  useDecisionBookmarks,
  useSourceBookmarks,
} from "../knowledge/useBookmarks";

export interface NavCounts {
  decisions?: number;
  sources?: number;
  highlights?: number;
}

export function useNavCounts(): NavCounts {
  const trpc = useTRPC();
  const stats = useQuery(trpc.users.stats.queryOptions());
  const decisions = useDecisionBookmarks();
  const sources = useSourceBookmarks();
  return {
    decisions: decisions.loading
      ? undefined
      : decisions.bookmarks.filter((b) => statusOf(b) === "ouverte").length,
    sources: sources.loading ? undefined : sources.bookmarks.length,
    highlights: stats.data?.numHighlights,
  };
}
