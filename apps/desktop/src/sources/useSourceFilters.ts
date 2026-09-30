import { useMemo, useState } from "react";

import type { ZBookmark } from "@karakeep/shared/types/bookmarks";

import type { SourceKind, SourceView } from "./sourceView";
import { toSourceView } from "./sourceView";

export type Author = "all" | "chris" | "claude";
export type SortOrder = "recent" | "title";
export type SourceLayout = "grid" | "list" | "compact";

export interface SourceItem {
  bookmark: ZBookmark;
  view: SourceView;
  byClaude: boolean;
}

export interface SourceFilters {
  author: Author;
  kind: SourceKind | "all";
  sort: SortOrder;
  layout: SourceLayout;
  setAuthor: (a: Author) => void;
  setKind: (k: SourceKind | "all") => void;
  toggleSort: () => void;
  setLayout: (l: SourceLayout) => void;
  reset: () => void;
  items: SourceItem[];
}

export function useSourceFilters(
  bookmarks: ZBookmark[],
  claudeIds: Set<string>,
): SourceFilters {
  const [author, setAuthor] = useState<Author>("all");
  const [kind, setKind] = useState<SourceKind | "all">("all");
  const [sort, setSort] = useState<SortOrder>("recent");
  const [layout, setLayout] = useState<SourceLayout>("grid");

  const items = useMemo(() => {
    let list = bookmarks.map((b) => ({
      bookmark: b,
      view: toSourceView(b),
      byClaude: claudeIds.has(b.id),
    }));
    if (author !== "all")
      list = list.filter((i) => i.byClaude === (author === "claude"));
    if (kind !== "all") list = list.filter((i) => i.view.kind === kind);
    if (sort === "title")
      list = [...list].sort((a, b) =>
        a.view.title.localeCompare(b.view.title, "fr"),
      );
    return list;
  }, [bookmarks, claudeIds, author, kind, sort]);

  return {
    author,
    kind,
    sort,
    layout,
    setAuthor,
    setKind,
    setLayout,
    items,
    toggleSort: () => setSort((s) => (s === "recent" ? "title" : "recent")),
    reset: () => {
      setAuthor("all");
      setKind("all");
    },
  };
}
