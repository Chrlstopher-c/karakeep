import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "@karakeep/shared-react/trpc";
import { getBookmarkTitle } from "@karakeep/shared/utils/bookmarkUtils";

import { useOpenBookmark } from "../knowledge/useOpenBookmark";
import type { PaletteCommand } from "./commands";

export interface PaletteItem {
  key: string;
  kind: "COMMANDE" | "SOURCE" | "DÉCISION" | "SURLIGNÉ";
  title: string;
  snippet?: string;
  kbd?: string;
  run: () => void;
}

const DEBOUNCE_MS = 180;
const MIN_QUERY = 2;

function useDebounced(value: string): string {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [value]);
  return debounced;
}

// Groupes de la palette : commandes, puis sources et fiches (recherche plein texte), puis passages surlignés.
export function usePaletteResults(
  query: string,
  commands: PaletteCommand[],
): { label: string; items: PaletteItem[] }[] {
  const trpc = useTRPC();
  const { open, isDecision } = useOpenBookmark();
  const q = useDebounced(query.trim());
  const enabled = q.length >= MIN_QUERY;
  const bookmarks = useQuery({
    ...trpc.bookmarks.searchBookmarks.queryOptions({ text: q, limit: 8 }),
    enabled,
  });
  const highlights = useQuery({
    ...trpc.highlights.search.queryOptions({ text: q, limit: 6 }),
    enabled,
  });

  const cmdItems: PaletteItem[] = commands.map((c) => ({
    key: `c-${c.id}`,
    kind: "COMMANDE",
    title: c.title,
    kbd: c.kbd,
    run: c.run,
  }));
  const found = enabled ? (bookmarks.data?.bookmarks ?? []) : [];
  const bmItems: PaletteItem[] = found.map((b) => ({
    key: `b-${b.id}`,
    kind: isDecision(b.id) ? "DÉCISION" : "SOURCE",
    title: getBookmarkTitle(b) ?? "Sans titre",
    run: () => open(b.id),
  }));
  const hlItems: PaletteItem[] = (enabled ? (highlights.data?.highlights ?? []) : []).map((h) => ({
    key: `h-${h.id}`,
    kind: "SURLIGNÉ",
    title: h.text ?? "",
    snippet: h.note ?? undefined,
    run: () => open(h.bookmarkId, h.id),
  }));
  return [
    { label: "COMMANDES", items: cmdItems },
    { label: "DANS LA BASE", items: bmItems },
    { label: "PASSAGES SURLIGNÉS", items: hlItems },
  ].filter((g) => g.items.length > 0);
}
