import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "@karakeep/shared-react/trpc";

import type { KnowledgeListKey } from "./conventions";
import { LIST_NAMES } from "./conventions";

export type KnowledgeLists = Partial<Record<KnowledgeListKey, string>>;

// Retrouve les ids des listes de la base par leur nom.
export function useKnowledgeLists(): KnowledgeLists {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.lists.list.queryOptions());
  const ids: KnowledgeLists = {};
  for (const [key, name] of Object.entries(LIST_NAMES) as [KnowledgeListKey, string][]) {
    const list = data?.lists.find((l) => l.name.trim().toLowerCase() === name.toLowerCase());
    if (list) ids[key] = list.id;
  }
  return ids;
}
