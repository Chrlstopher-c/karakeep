import type { ReactElement } from "react";

import type { ZBookmark } from "@karakeep/shared/types/bookmarks";

import { plainTags } from "../knowledge/conventions";
import { ClaudeBadge } from "../shared/ClaudeBadge";
import { Eyebrow } from "../shared/Eyebrow";
import { Media } from "../shared/Media";
import { Rise } from "../shared/Rise";
import { TagChip } from "../shared/TagChip";
import { shortDate } from "../shared/time";
import { KIND_LABEL, toSourceView } from "../sources/sourceView";

export function ReaderHeader({ bookmark, byClaude }: { bookmark: ZBookmark; byClaude: boolean }): ReactElement {
  const view = toSourceView(bookmark);
  const hasMedia = view.imageUrl || view.imageAssetId;
  return (
    <header className="relative z-[1] mb-9 flex flex-col gap-4">
      <Rise>
        <Eyebrow>{`${KIND_LABEL[view.kind]} · ${view.domain}`}</Eyebrow>
      </Rise>
      <h1 className="text-text m-0 text-balance text-[40px] font-extrabold leading-[1.1] tracking-[-0.04em]">
        {view.title}
      </h1>
      <Rise index={1} className="flex flex-wrap items-center gap-3 font-mono text-[12px] leading-none text-muted">
        <span>ajouté le {shortDate(bookmark.createdAt)}</span>
        {byClaude && <ClaudeBadge label="AJOUTÉ PAR CLAUDE" />}
        {plainTags(bookmark).map((t) => (
          <TagChip key={t}>{t}</TagChip>
        ))}
      </Rise>
      {hasMedia && view.kind !== "image" && (
        <Media imageUrl={view.imageUrl} assetId={view.imageAssetId} label="" className="mt-2.5 h-[300px] rounded-3xl" />
      )}
    </header>
  );
}
