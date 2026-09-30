import type { ReactElement } from "react";

import type { ZHighlight } from "@karakeep/shared/types/highlights";

import { HighlightDots } from "../highlights/HighlightDots";
import { plainTags } from "../knowledge/conventions";
import { ClaudeMark } from "../shared/Icon";
import { Media } from "../shared/Media";
import { TagChip } from "../shared/TagChip";
import { shortDate } from "../shared/time";
import { KIND_LABEL } from "./sourceView";
import type { SourceItem } from "./useSourceFilters";

interface RowProps {
  item: SourceItem;
  highlights: ZHighlight[];
  focused: boolean;
  onOpen: () => void;
}

const LIST_COLUMNS = "grid-cols-[88px_minmax(0,1fr)_minmax(0,180px)_80px_96px]";

export function ListHeader(): ReactElement {
  return (
    <div
      className={`grid ${LIST_COLUMNS} text-subtle gap-4 px-4 pb-2 font-mono text-[11px] leading-none tracking-[0.12em]`}
    >
      <span />
      <span>TITRE</span>
      <span>TAGS</span>
      <span>SURL.</span>
      <span>AJOUTÉ</span>
    </div>
  );
}

export function SourceRow({
  item,
  highlights,
  focused,
  onOpen,
}: RowProps): ReactElement {
  const { view } = item;
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`grid h-[76px] w-full cursor-pointer ${LIST_COLUMNS} hover:bg-surface items-center gap-4 rounded-2xl border-0 px-4 text-left transition-colors ${focused ? "bg-surface outline-2 -outline-offset-2 outline-accent" : "bg-transparent"}`}
    >
      <Media
        imageUrl={view.imageUrl}
        assetId={view.imageAssetId}
        label=""
        className="h-14 w-[88px] rounded-[10px]"
      />
      <span className="flex min-w-0 flex-col gap-1.5">
        <span className="text-text truncate text-[15px] font-bold leading-[1.25]">
          {view.title}
        </span>
        <span className="flex items-center gap-2.5 font-mono text-[12px] leading-none text-muted">
          {view.domain} · {KIND_LABEL[view.kind]}
          {item.byClaude && (
            <span className="text-accent-ink inline-flex items-center gap-1">
              <ClaudeMark />
              CLAUDE
            </span>
          )}
        </span>
      </span>
      <span className="flex gap-1.5 overflow-hidden">
        {plainTags(item.bookmark).map((t) => (
          <TagChip key={t}>{t}</TagChip>
        ))}
      </span>
      <HighlightDots highlights={highlights} showCount />
      <span className="font-mono text-[12px] leading-none text-muted">
        {shortDate(view.createdAt)}
      </span>
    </button>
  );
}

export function SourceCompactRow({
  item,
  focused,
  onOpen,
}: RowProps): ReactElement {
  const { view } = item;
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`hover:bg-surface-2 grid h-[42px] w-full cursor-pointer grid-cols-[56px_minmax(0,1fr)_minmax(0,200px)_90px] items-center gap-3.5 rounded-xl border-0 px-3 text-left ${focused ? "bg-surface-2 outline-2 -outline-offset-2 outline-accent" : "bg-transparent"}`}
    >
      <span className="text-subtle font-mono text-[10.5px] uppercase leading-none tracking-[0.1em]">
        {KIND_LABEL[view.kind]}
      </span>
      <span className="flex min-w-0 items-center gap-2">
        <span className="text-text truncate text-sm font-semibold leading-none">
          {view.title}
        </span>
        {item.byClaude && (
          <span className="text-accent-ink">
            <ClaudeMark />
          </span>
        )}
      </span>
      <span className="truncate font-mono text-[12px] leading-none text-muted">
        {view.domain}
      </span>
      <span className="text-right font-mono text-[12px] leading-none text-muted">
        {shortDate(view.createdAt)}
      </span>
    </button>
  );
}
