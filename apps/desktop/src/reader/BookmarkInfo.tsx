import type { ReactElement } from "react";
import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "@karakeep/shared-react/trpc";
import type { ZBookmark } from "@karakeep/shared/types/bookmarks";

import { TagChip } from "../shared/TagChip";
import { shortDate } from "../shared/time";
import { KIND_LABEL, toSourceView } from "../sources/sourceView";

function infoRows(bookmark: ZBookmark): { k: string; v: string }[] {
  const view = toSourceView(bookmark);
  const rows = [
    { k: "TYPE", v: KIND_LABEL[view.kind] },
    { k: "AJOUTÉ", v: shortDate(bookmark.createdAt) },
  ];
  const c = bookmark.content;
  if (c.type === "link") {
    rows.unshift({ k: "ADRESSE", v: view.domain });
    if (c.author) rows.push({ k: "AUTEUR", v: c.author });
    if (c.publisher) rows.push({ k: "ÉDITEUR", v: c.publisher });
    if (c.datePublished)
      rows.push({ k: "PUBLIÉ", v: shortDate(c.datePublished) });
  }
  return rows;
}

export function BookmarkInfo({
  bookmark,
  tags,
}: {
  bookmark: ZBookmark;
  tags: string[];
}): ReactElement {
  const trpc = useTRPC();
  const lists = useQuery(
    trpc.lists.getListsOfBookmark.queryOptions({ bookmarkId: bookmark.id }),
  );
  return (
    <>
      <div className="bg-surface flex flex-col gap-0.5 rounded-[18px] px-4 py-1.5 shadow-ring">
        {infoRows(bookmark).map((r) => (
          <div
            key={r.k}
            className="border-line flex gap-3 border-b py-[11px] last:border-b-0"
          >
            <span className="w-24 flex-none font-mono text-[11px] leading-normal tracking-[0.1em] text-muted">
              {r.k}
            </span>
            <span className="text-text min-w-0 flex-1 break-words text-[13px] font-semibold leading-normal">
              {r.v}
            </span>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2.5 px-1 py-1.5">
        <span className="font-mono text-[11px] leading-none tracking-[0.14em] text-muted">
          TAGS
        </span>
        <div className="flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <TagChip key={t}>{t}</TagChip>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2.5 px-1 py-1.5">
        <span className="font-mono text-[11px] leading-none tracking-[0.14em] text-muted">
          LISTES
        </span>
        <div className="flex flex-wrap gap-1.5">
          {(lists.data?.lists ?? []).map((l) => (
            <span
              key={l.id}
              className="bg-surface-2 text-soft h-[26px] rounded-[10px] px-[11px] text-[12px] font-semibold leading-[26px]"
            >
              {l.icon} {l.name}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
