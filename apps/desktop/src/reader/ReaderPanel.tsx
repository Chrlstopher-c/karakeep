import type { ReactElement } from "react";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import type { ZBookmark } from "@karakeep/shared/types/bookmarks";
import type { ZHighlight } from "@karakeep/shared/types/highlights";

import { HIGHLIGHT_META, solidColor, tintColor } from "../highlights/colors";
import { plainTags } from "../knowledge/conventions";
import { ClaudeBadge } from "../shared/ClaudeBadge";
import { EASE_SPRING } from "../shared/motion";
import { Segmented } from "../shared/Segmented";
import { relativeTime } from "../shared/time";
import { BookmarkInfo } from "./BookmarkInfo";

type Tab = "hl" | "info";

function HighlightCard({ h, byClaude, onGo }: { h: ZHighlight; byClaude: boolean; onGo: () => void }): ReactElement {
  return (
    <motion.button
      type="button"
      layout
      onClick={onGo}
      initial={{ opacity: 0, y: -14, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.48, ease: EASE_SPRING }}
      className="bg-surface hover:shadow-lift flex cursor-pointer flex-col gap-[9px] rounded-[18px] border-0 px-4 py-3.5 text-left shadow-ring"
    >
      <span className="text-text text-sm font-medium leading-[1.55]">
        <span className="rounded-[3px] py-px [box-decoration-break:clone]" style={{ background: tintColor(h.color) }}>
          {h.text}
        </span>
      </span>
      {h.note && <span className="text-[13px] font-medium leading-[1.45] text-muted">{h.note}</span>}
      <span className="flex items-center gap-2 font-mono text-[11px] leading-none text-muted">
        <span className="size-2 rounded-full" style={{ background: solidColor(h.color) }} />
        <span className="flex-1">
          {HIGHLIGHT_META[h.color].label} · {relativeTime(h.createdAt)}
        </span>
        {byClaude ? <ClaudeBadge /> : <span className="tracking-[0.08em]">CHRIS</span>}
      </span>
    </motion.button>
  );
}

export function ReaderPanel({
  bookmark,
  highlights,
  byClaude,
  onGoHighlight,
}: {
  bookmark: ZBookmark;
  highlights: ZHighlight[];
  byClaude: (id: string) => boolean;
  onGoHighlight: (id: string) => void;
}): ReactElement {
  const [tab, setTab] = useState<Tab>("hl");
  const ordered = [...highlights].sort((a, b) => a.startOffset - b.startOffset);
  return (
    <aside className="border-line bg-bg sticky top-14 flex max-h-[calc(100vh-104px)] w-[360px] flex-none flex-col gap-3.5 overflow-auto border-l px-[18px] pb-10 pt-5">
      <Segmented
        value={tab}
        onChange={setTab}
        options={[
          { value: "hl", label: `Surlignages · ${highlights.length}` },
          { value: "info", label: "Infos" },
        ]}
      />
      {tab === "hl" && (
        <>
          <AnimatePresence initial={false}>
            {ordered.map((h) => (
              <HighlightCard key={h.id} h={h} byClaude={byClaude(h.id)} onGo={() => onGoHighlight(h.id)} />
            ))}
          </AnimatePresence>
          {highlights.length === 0 && (
            <div className="border-line-strong flex flex-col items-center gap-2.5 rounded-[18px] border-[1.5px] border-dashed px-[18px] py-7 text-center">
              <span className="text-soft text-sm font-semibold leading-[1.45]">Aucun surlignage.</span>
              <span className="font-mono text-[12px] leading-normal text-muted">
                Sélectionner un passage, puis 1 à 4.
              </span>
            </div>
          )}
        </>
      )}
      {tab === "info" && <BookmarkInfo bookmark={bookmark} tags={plainTags(bookmark)} />}
    </aside>
  );
}
