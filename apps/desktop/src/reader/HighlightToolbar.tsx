import type { ReactElement } from "react";
import { useState } from "react";
import { motion } from "motion/react";

import type { ZHighlightColor } from "@karakeep/shared/types/highlights";

import {
  HIGHLIGHT_COLORS,
  HIGHLIGHT_META,
  solidColor,
} from "../highlights/colors";
import { Icon } from "../shared/Icon";
import { EASE_OUT_SOFT, EASE_SPRING } from "../shared/motion";

interface ToolbarProps {
  x: number;
  y: number;
  readOnly: boolean;
  onApply: (color: ZHighlightColor, note: string | null) => void;
  onDelete?: () => void;
}

function Legend(): ReactElement {
  return (
    <div className="bg-pop shadow-menu absolute left-0 right-0 top-[calc(100%+10px)] flex min-w-[260px] flex-col gap-0.5 whitespace-normal rounded-[18px] p-2.5">
      {HIGHLIGHT_COLORS.map((c) => (
        <div key={c} className="flex items-center gap-2.5 px-2 py-[7px]">
          <span
            className="size-3 rounded-full"
            style={{ background: solidColor(c) }}
          />
          <span className="text-text flex-1 text-[13px] font-semibold leading-[1.3]">
            {HIGHLIGHT_META[c].label}
          </span>
          <span className="font-mono text-[11px] leading-none text-muted">
            {HIGHLIGHT_META[c].use}
          </span>
          <span className="bg-surface-3 rounded-md px-1.5 py-[3px] font-mono text-[11px] leading-none text-muted">
            {HIGHLIGHT_META[c].key}
          </span>
        </div>
      ))}
      <div className="px-2 pb-1 pt-2 font-mono text-[11px] leading-[1.4] text-muted">
        Soulignement pointillé : surligné par Claude
      </div>
    </div>
  );
}

export function HighlightToolbar({
  x,
  y,
  readOnly,
  onApply,
  onDelete,
}: ToolbarProps): ReactElement {
  const [note, setNote] = useState<string | null>(null);
  const [legend, setLegend] = useState(false);
  return (
    <div
      role="toolbar"
      aria-label="Surligner"
      className="absolute z-[6]"
      style={{ left: x, top: y - 10, transform: "translate(-50%,-100%)" }}
      onMouseUp={(e) => e.stopPropagation()}
      onMouseDown={(e) => {
        if ((e.target as HTMLElement).tagName !== "INPUT") e.preventDefault();
      }}
    >
      <motion.div
        className="bg-pop shadow-menu relative flex items-center gap-1 whitespace-nowrap rounded-full p-1.5"
        initial={{ opacity: 0, scale: 0.86 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, ease: EASE_OUT_SOFT }}
      >
        {readOnly ? (
          <span className="px-3 text-[13px] font-semibold leading-8 text-muted">
            Lecture seule hors ligne
          </span>
        ) : (
          <>
            {HIGHLIGHT_COLORS.map((c, i) => (
              <motion.button
                key={c}
                type="button"
                title={`${HIGHLIGHT_META[c].label} · ${HIGHLIGHT_META[c].key}`}
                onClick={() => onApply(c, note)}
                whileHover={{ scale: 1.12 }}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: i * 0.022,
                  duration: 0.35,
                  ease: EASE_SPRING,
                }}
                className="grid size-8 cursor-pointer place-items-center rounded-full border-0 font-mono text-[11px] leading-none text-[#1E1830]"
                style={{ background: solidColor(c) }}
              >
                {HIGHLIGHT_META[c].key}
              </motion.button>
            ))}
            <span className="bg-line-strong mx-1 h-5 w-px" />
            {note === null ? (
              <button
                type="button"
                onClick={() => setNote("")}
                className="text-text hover:bg-surface-2 flex h-8 cursor-pointer items-center gap-1.5 rounded-full border-0 bg-transparent px-3 text-[13px] font-bold"
              >
                <Icon name="note" size={15} />
                Note
              </button>
            ) : (
              <input
                autoFocus
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Note, puis 1 à 4"
                onKeyDown={(e) => {
                  if (e.key === "Enter") onApply("yellow", note);
                }}
                className="bg-field text-text h-8 w-[220px] rounded-full border-0 px-3.5 text-[13px] font-medium shadow-[inset_0_0_0_1px_var(--line-strong)] outline-none"
              />
            )}
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                title="Retirer le surlignage"
                className="text-err hover:bg-surface-2 grid size-8 cursor-pointer place-items-center rounded-full border-0 bg-transparent"
              >
                <Icon name="close" size={15} stroke={2} />
              </button>
            )}
            <button
              type="button"
              onClick={() => setLegend((l) => !l)}
              title="Légende des couleurs"
              className={`size-8 cursor-pointer rounded-full border-0 text-[13px] font-bold text-muted ${legend ? "bg-surface-3" : "hover:bg-surface-2 bg-transparent"}`}
            >
              ?
            </button>
          </>
        )}
        {legend && <Legend />}
      </motion.div>
    </div>
  );
}
