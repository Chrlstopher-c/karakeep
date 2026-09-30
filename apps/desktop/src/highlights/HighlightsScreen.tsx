import type { ReactElement } from "react";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import type {
  ZHighlight,
  ZHighlightColor,
} from "@karakeep/shared/types/highlights";
import { getBookmarkTitle } from "@karakeep/shared/utils/bookmarkUtils";

import { useProvenance } from "../claude/useAgentActivity";
import { useAllBookmarks } from "../knowledge/useBookmarks";
import { useOpenBookmark } from "../knowledge/useOpenBookmark";
import { Button } from "../shared/Button";
import { ClaudeBadge } from "../shared/ClaudeBadge";
import { Eyebrow } from "../shared/Eyebrow";
import { FilterChip } from "../shared/FilterChip";
import { EASE_OUT_SOFT } from "../shared/motion";
import { Rise } from "../shared/Rise";
import { Segmented } from "../shared/Segmented";
import { relativeTime } from "../shared/time";
import { toSourceView } from "../sources/sourceView";
import {
  HIGHLIGHT_COLORS,
  HIGHLIGHT_META,
  solidColor,
  tintColor,
} from "./colors";
import { useAllHighlights } from "./useAllHighlights";

type Author = "all" | "chris" | "claude";

function WallCard({
  h,
  source,
  domain,
  byClaude,
  onOpen,
}: {
  h: ZHighlight;
  source: string;
  domain: string;
  byClaude: boolean;
  onOpen: () => void;
}): ReactElement {
  return (
    <motion.button
      type="button"
      layout
      onClick={onOpen}
      transition={{ duration: 0.4, ease: EASE_OUT_SOFT }}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="bg-surface hover:shadow-lift mb-5 flex w-full cursor-pointer break-inside-avoid flex-col gap-3 rounded-3xl border-0 px-[22px] py-5 text-left shadow-ring transition-shadow"
    >
      <span className="text-text text-pretty text-base font-medium leading-[1.55]">
        <span
          className="rounded-[3px] py-px [box-decoration-break:clone]"
          style={{ background: tintColor(h.color) }}
        >
          {h.text}
        </span>
      </span>
      {h.note && (
        <span className="text-sm leading-[1.45] text-muted">{h.note}</span>
      )}
      <span className="border-line flex items-center gap-2.5 border-t pt-1">
        <span className="flex min-w-0 flex-1 flex-col gap-[5px] pt-2.5">
          <span className="text-soft truncate text-[13px] font-semibold">
            {source}
          </span>
          <span className="font-mono text-[11px] text-muted">
            {domain} · {relativeTime(h.createdAt)}
          </span>
        </span>
        {byClaude && (
          <span className="mt-2.5">
            <ClaudeBadge />
          </span>
        )}
      </span>
    </motion.button>
  );
}

function HighlightFilters({
  color,
  setColor,
  author,
  setAuthor,
}: {
  color: ZHighlightColor | "all";
  setColor: (c: ZHighlightColor | "all") => void;
  author: Author;
  setAuthor: (a: Author) => void;
}): ReactElement {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex flex-wrap gap-1.5">
        <FilterChip active={color === "all"} onClick={() => setColor("all")}>
          Toutes les couleurs
        </FilterChip>
        {HIGHLIGHT_COLORS.map((c) => (
          <FilterChip key={c} active={color === c} onClick={() => setColor(c)}>
            <span
              className="size-[9px] rounded-full"
              style={{ background: solidColor(c) }}
            />
            {HIGHLIGHT_META[c].label}
          </FilterChip>
        ))}
      </div>
      <span className="flex-1" />
      <Segmented
        value={author}
        onChange={setAuthor}
        options={[
          { value: "all", label: "Tous" },
          { value: "chris", label: "Chris" },
          { value: "claude", label: "Claude" },
        ]}
      />
    </div>
  );
}

export function HighlightsScreen(): ReactElement {
  const highlights = useAllHighlights();
  const bookmarks = useAllBookmarks();
  const provenance = useProvenance();
  const { open } = useOpenBookmark();
  const [color, setColor] = useState<ZHighlightColor | "all">("all");
  const [author, setAuthor] = useState<Author>("all");
  const byId = useMemo(
    () => new Map(bookmarks.bookmarks.map((b) => [b.id, b])),
    [bookmarks.bookmarks],
  );
  const wall = highlights.list.filter(
    (h) =>
      (color === "all" || h.color === color) &&
      (author === "all" ||
        provenance.highlightIds.has(h.id) === (author === "claude")),
  );

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-[22px] px-10 pb-20 pt-9">
      <Rise className="flex flex-col gap-3">
        <Eyebrow>BASE</Eyebrow>
        <h1 className="text-text m-0 flex items-baseline gap-3 text-[28px] font-extrabold leading-[1.15] tracking-[-0.035em]">
          Surlignages
          <span className="font-mono text-sm font-medium tracking-normal text-muted">
            {wall.length}
          </span>
        </h1>
      </Rise>
      <Rise index={1}>
        <HighlightFilters
          color={color}
          setColor={setColor}
          author={author}
          setAuthor={setAuthor}
        />
      </Rise>
      <div className="columns-[3_300px] gap-5">
        <AnimatePresence mode="popLayout" initial={false}>
          {wall.map((h) => {
            const b = byId.get(h.bookmarkId);
            const view = b ? toSourceView(b) : null;
            return (
              <WallCard
                key={h.id}
                h={h}
                source={b ? (getBookmarkTitle(b) ?? "Sans titre") : "Source"}
                domain={view?.domain ?? ""}
                byClaude={provenance.highlightIds.has(h.id)}
                onOpen={() => open(h.bookmarkId, h.id)}
              />
            );
          })}
        </AnimatePresence>
      </div>
      {!highlights.loading && wall.length === 0 && (
        <div className="bg-surface flex flex-col items-center gap-4 rounded-[28px] px-6 py-16 text-center shadow-ring">
          <span className="text-soft text-base font-bold">
            Aucun surlignage pour ces filtres.
          </span>
          <Button
            className="h-10 text-sm"
            onClick={() => {
              setColor("all");
              setAuthor("all");
            }}
          >
            Réinitialiser les filtres
          </Button>
        </div>
      )}
    </div>
  );
}
