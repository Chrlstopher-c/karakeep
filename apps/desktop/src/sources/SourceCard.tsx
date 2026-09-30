import type { ReactElement } from "react";

import type { ZHighlight } from "@karakeep/shared/types/highlights";

import { HighlightDots } from "../highlights/HighlightDots";
import { ClaudeBadge } from "../shared/ClaudeBadge";
import { Media } from "../shared/Media";
import { TagChip } from "../shared/TagChip";
import type { SourceView } from "./sourceView";
import { KIND_LABEL } from "./sourceView";

export interface SourceCardProps {
  source: SourceView;
  highlights: ZHighlight[];
  byClaude: boolean;
  tags?: string[];
  size?: "small" | "full";
  focused?: boolean;
  onOpen: () => void;
}

const LIFT =
  "transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(.2,.7,.2,1)] hover:-translate-y-1 hover:shadow-lift";

export function SourceCard({
  source,
  highlights,
  byClaude,
  tags = [],
  size = "full",
  focused,
  onOpen,
}: SourceCardProps): ReactElement {
  const small = size === "small";
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`bg-surface relative flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-3xl border-0 p-0 text-left shadow-ring ${LIFT} ${focused ? "outline-2 outline-offset-2 outline-accent" : ""}`}
    >
      <Media
        imageUrl={source.imageUrl}
        assetId={source.imageAssetId}
        label={`${KIND_LABEL[source.kind]}`}
        className={small ? "h-[118px] w-full" : "h-[148px] w-full"}
      />
      <div
        className={`flex flex-1 flex-col gap-2 ${small ? "px-[18px] pb-[18px] pt-4" : "px-5 pb-[18px] pt-4"}`}
      >
        <div className="flex items-center gap-2 font-mono text-[12px] leading-none text-muted">
          <span className="min-w-0 flex-1 truncate">{source.domain}</span>
          {!small && <span>{KIND_LABEL[source.kind]}</span>}
        </div>
        <div className="text-text line-clamp-2 text-base font-bold leading-[1.3] tracking-[-0.01em]">
          {source.title}
        </div>
        {!small && source.excerpt && (
          <div className="line-clamp-2 text-sm leading-normal text-muted">
            {source.excerpt}
          </div>
        )}
        <div className="mt-auto flex min-h-[22px] flex-wrap items-center gap-1.5 pt-1.5">
          {!small &&
            tags.slice(0, 3).map((t) => <TagChip key={t}>{t}</TagChip>)}
          <span className="flex-1" />
          <HighlightDots highlights={highlights} showCount={!small} />
          {byClaude && <ClaudeBadge />}
        </div>
      </div>
    </button>
  );
}
