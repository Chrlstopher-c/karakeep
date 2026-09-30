import type { ReactElement } from "react";

import { useNavigation } from "../app/navigation";
import { useProvenance } from "../claude/useAgentActivity";
import { projectOf, statusOf } from "../knowledge/conventions";
import { useDecisionBookmarks } from "../knowledge/useBookmarks";
import { ClaudeBadge } from "../shared/ClaudeBadge";
import { Icon } from "../shared/Icon";
import { SectionHeader } from "../shared/SectionHeader";
import { TagChip } from "../shared/TagChip";
import { relativeTime } from "../shared/time";
import { getBookmarkTitle } from "@karakeep/shared/utils/bookmarkUtils";

export function OpenDecisions(): ReactElement {
  const { go } = useNavigation();
  const provenance = useProvenance();
  const open = useDecisionBookmarks().bookmarks.filter(
    (b) => statusOf(b) === "ouverte",
  );
  return (
    <section className="flex flex-col gap-3.5">
      <SectionHeader
        title="Décisions ouvertes"
        action="Toutes"
        kbd="G D"
        onAction={() => go({ screen: "decisions" })}
      />
      {open.length === 0 && (
        <p className="m-0 text-sm text-muted">Aucune décision en attente.</p>
      )}
      {open.map((b) => {
        const project = projectOf(b);
        return (
          <button
            key={b.id}
            type="button"
            onClick={() => go({ screen: "sheet", bookmarkId: b.id })}
            className="bg-surface hover:shadow-lift flex cursor-pointer items-center gap-4 rounded-[18px] border-0 py-4 pl-[22px] pr-[18px] text-left shadow-ring transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5"
          >
            <span className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className="text-text text-base font-bold leading-[1.3]">
                {getBookmarkTitle(b) ?? "Sans titre"}
              </span>
              <span className="font-mono text-[12px] leading-none text-muted">
                à trancher · modifiée{" "}
                {relativeTime(b.modifiedAt ?? b.createdAt)}
              </span>
            </span>
            {provenance.bookmarkIds.has(b.id) && <ClaudeBadge />}
            {project && <TagChip>{project}</TagChip>}
            <span className="text-muted">
              <Icon name="forward" size={16} stroke={2} />
            </span>
          </button>
        );
      })}
    </section>
  );
}
