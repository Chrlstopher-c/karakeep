import type { ReactElement } from "react";

import type { ZHighlight } from "@karakeep/shared/types/highlights";

import { HIGHLIGHT_COLORS, solidColor } from "./colors";

// Une pastille par couleur présente, dans l'ordre de la légende.
export function HighlightDots({
  highlights,
  showCount = false,
}: {
  highlights: ZHighlight[];
  showCount?: boolean;
}): ReactElement | null {
  if (highlights.length === 0) return null;
  const colors = HIGHLIGHT_COLORS.filter((c) => highlights.some((h) => h.color === c));
  return (
    <span title="Surlignages" className="text-soft flex items-center gap-1 font-mono text-[12px] leading-none">
      {colors.map((c) => (
        <span key={c} className="size-2 rounded-full" style={{ background: solidColor(c) }} />
      ))}
      {showCount && <span className="ml-0.5">{highlights.length}</span>}
    </span>
  );
}
