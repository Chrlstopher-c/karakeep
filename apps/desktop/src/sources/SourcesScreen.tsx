import type { ReactElement } from "react";
import { AnimatePresence, motion } from "motion/react";

import { useProvenance } from "../claude/useAgentActivity";
import { useAllHighlights } from "../highlights/useAllHighlights";
import { plainTags } from "../knowledge/conventions";
import { useSourceBookmarks } from "../knowledge/useBookmarks";
import { useOpenBookmark } from "../knowledge/useOpenBookmark";
import { Button } from "../shared/Button";
import { EASE_OUT_SOFT } from "../shared/motion";
import { Rise } from "../shared/Rise";
import { CardSkeleton } from "../shared/Skeleton";
import { SourceCard } from "./SourceCard";
import { ListHeader, SourceCompactRow, SourceRow } from "./SourceRows";
import { SourcesFilterBar, SourcesHeader } from "./SourcesToolbar";
import type { SourceFilters, SourceItem } from "./useSourceFilters";
import { useSourceFilters } from "./useSourceFilters";
import { useListKeyboard } from "./useListKeyboard";

const FLIP = {
  layout: { duration: 0.4, ease: EASE_OUT_SOFT },
  duration: 0.26,
  ease: EASE_OUT_SOFT,
};

function Items({
  filters,
  focus,
  onOpen,
}: {
  filters: SourceFilters;
  focus: number;
  onOpen: (i: SourceItem) => void;
}): ReactElement {
  const highlights = useAllHighlights();
  const layout = filters.layout;
  const wrap =
    layout === "grid"
      ? "grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] items-start gap-5"
      : layout === "list"
        ? "flex flex-col gap-0.5"
        : "flex flex-col rounded-[20px] bg-surface p-1.5 shadow-ring";
  return (
    <>
      {layout === "list" && <ListHeader />}
      <div className={wrap}>
        <AnimatePresence mode="popLayout" initial={false}>
          {filters.items.map((item, i) => {
            const hls = highlights.byBookmark.get(item.bookmark.id) ?? [];
            const props = {
              item,
              highlights: hls,
              focused: focus === i,
              onOpen: () => onOpen(item),
            };
            return (
              <motion.div
                key={item.bookmark.id}
                layout
                data-source-index={i}
                transition={FLIP}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
              >
                {layout === "grid" && (
                  <SourceCard
                    source={item.view}
                    highlights={hls}
                    byClaude={item.byClaude}
                    tags={plainTags(item.bookmark)}
                    focused={focus === i}
                    onOpen={props.onOpen}
                  />
                )}
                {layout === "list" && <SourceRow {...props} />}
                {layout === "compact" && <SourceCompactRow {...props} />}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </>
  );
}

export function SourcesScreen({ onCapture }: { onCapture: () => void }): ReactElement {
  const sources = useSourceBookmarks();
  const provenance = useProvenance();
  const { open } = useOpenBookmark();
  const filters = useSourceFilters(sources.bookmarks, provenance.bookmarkIds);
  const openItem = (item: SourceItem): void => open(item.bookmark.id);
  const focus = useListKeyboard(filters.items.length, (i) => openItem(filters.items[i]));
  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-[22px] px-10 pb-[120px] pt-9">
      <Rise>
        <SourcesHeader count={filters.items.length} filters={filters} onCapture={onCapture} />
      </Rise>
      <Rise index={1}>
        <SourcesFilterBar filters={filters} />
      </Rise>
      {sources.loading && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5">
          {[300, 340, 280, 320, 300, 340].map((h, i) => (
            <CardSkeleton key={i} height={h} />
          ))}
        </div>
      )}
      {!sources.loading && filters.items.length === 0 && (
        <Rise className="bg-surface flex flex-col items-center gap-4 rounded-[28px] px-6 py-[72px] text-center shadow-ring">
          <span className="text-soft text-base font-bold leading-[1.4]">Aucune source pour ces filtres.</span>
          <Button onClick={filters.reset} className="h-10 text-sm">
            Réinitialiser les filtres
          </Button>
        </Rise>
      )}
      {!sources.loading && <Items filters={filters} focus={focus} onOpen={openItem} />}
    </div>
  );
}
