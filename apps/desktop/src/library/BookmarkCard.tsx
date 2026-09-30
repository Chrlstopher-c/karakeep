import type { ReactElement } from "react";
import { motion } from "motion/react";

import type { ZBookmark } from "@karakeep/shared/types/bookmarks";
import { getBookmarkTitle } from "@karakeep/shared/utils/bookmarkUtils";

import { EASE_OUT_SOFT } from "../shared/motion";

const KIND_LABEL: Record<ZBookmark["content"]["type"], string> = {
  link: "Lien",
  text: "Note",
  asset: "Fichier",
  unknown: "—",
};

export function BookmarkCard({
  bookmark,
  index,
}: {
  bookmark: ZBookmark;
  index: number;
}): ReactElement {
  return (
    <motion.article
      className="bg-surface grid content-start gap-2 rounded-3xl border border-border p-5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.28,
        ease: EASE_OUT_SOFT,
        delay: Math.min(index, 12) * 0.03,
      }}
    >
      <span className="text-accent-text font-mono text-[11px] uppercase tracking-[0.14em]">
        {KIND_LABEL[bookmark.content.type]}
      </span>
      <h2 className="text-text m-0 line-clamp-3 text-base font-bold leading-snug">
        {getBookmarkTitle(bookmark) ?? "Sans titre"}
      </h2>
    </motion.article>
  );
}
