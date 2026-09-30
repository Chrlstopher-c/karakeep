import type { ReactElement } from "react";

import type { ZBookmark } from "@karakeep/shared/types/bookmarks";
import { getBookmarkTitle } from "@karakeep/shared/utils/bookmarkUtils";

import { projectOf, statusOf } from "../knowledge/conventions";
import { ClaudeBadge } from "../shared/ClaudeBadge";
import { TagChip } from "../shared/TagChip";
import { shortDate } from "../shared/time";
import { parseSheet } from "./sheetModel";

export function DecisionCard({
  bookmark,
  byClaude,
  onOpen,
}: {
  bookmark: ZBookmark;
  byClaude: boolean;
  onOpen: () => void;
}): ReactElement {
  const sheet = parseSheet(
    bookmark.content.type === "text" ? bookmark.content.text : "",
  );
  const project = projectOf(bookmark);
  const decided = statusOf(bookmark) === "tranchée" && sheet.decision;
  const n = sheet.options.length;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="bg-surface hover:shadow-lift flex w-full cursor-pointer flex-col gap-3 rounded-3xl border-0 px-5 pb-[18px] pt-5 text-left shadow-ring transition-[transform,box-shadow] duration-200 hover:-translate-y-1"
    >
      <span className="flex items-center gap-2">
        {project && <TagChip>{project}</TagChip>}
        <span className="flex-1" />
        <span className="font-mono text-[12px] leading-none text-muted">
          {shortDate(bookmark.modifiedAt ?? bookmark.createdAt)}
        </span>
      </span>
      <span className="text-text text-pretty text-[17px] font-extrabold leading-[1.3] tracking-[-0.02em]">
        {getBookmarkTitle(bookmark) ?? "Sans titre"}
      </span>
      {decided ? (
        <span className="bg-surface-2 flex flex-col gap-[7px] rounded-[14px] px-3.5 py-3">
          <span className="text-accent-ink font-mono text-[10.5px] leading-none tracking-[0.14em]">
            RETENU
          </span>
          <span className="text-text text-sm font-semibold leading-[1.45]">
            {sheet.decision}
          </span>
        </span>
      ) : (
        <span className="text-[13px] font-medium leading-[1.4] text-muted">
          {n > 0 ? `${n} option${n > 1 ? "s" : ""} · ` : ""}
          {statusOf(bookmark) === "ouverte" ? "à trancher" : "abandonnée"}
        </span>
      )}
      {byClaude && (
        <span className="flex">
          <ClaudeBadge label="FICHE PAR CLAUDE" />
        </span>
      )}
    </button>
  );
}
