import { useCallback, useLayoutEffect, useState } from "react";

import type { ZHighlightColor } from "@karakeep/shared/types/highlights";

import { markElements } from "./highlightDom";

export interface SweepRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Sweep {
  id: string;
  color: ZHighlightColor;
  byClaude: boolean;
  rects: SweepRect[];
}

// Calques temporaires sous le texte : un par ligne du passage, balayés en scaleX
// avant que la marque définitive n'apparaisse.
export function useSweeps(
  container: HTMLElement | null,
  content: HTMLElement | null,
  fresh: { id: string; color: ZHighlightColor; byClaude: boolean }[],
  onDone: (id: string) => void,
): { sweeps: Sweep[]; finish: (id: string) => void } {
  const [sweeps, setSweeps] = useState<Sweep[]>([]);
  const freshKey = fresh.map((f) => f.id).join(",");

  useLayoutEffect(() => {
    if (!container || !content || fresh.length === 0) return;
    const origin = container.getBoundingClientRect();
    const next = fresh.map((f) => ({
      ...f,
      rects: markElements(content, f.id).flatMap((el) =>
        Array.from(el.getClientRects()).map((r) => ({
          x: r.left - origin.left,
          y: r.top - origin.top,
          w: r.width,
          h: r.height,
        })),
      ),
    }));
    next.filter((s) => s.rects.length === 0).forEach((s) => onDone(s.id));
    const drawn = next.filter((s) => s.rects.length > 0);
    setSweeps((current) => [...current.filter((s) => !drawn.some((n) => n.id === s.id)), ...drawn]);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- relancé seulement quand la liste des passages frais change
  }, [container, content, freshKey]);

  const finish = useCallback(
    (id: string) => {
      setSweeps((current) => current.filter((s) => s.id !== id));
      onDone(id);
    },
    [onDone],
  );
  return { sweeps, finish };
}
