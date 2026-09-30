import type { ReactElement, ReactNode, RefObject } from "react";
import { useLayoutEffect, useMemo, useRef, useState } from "react";

import type { PaintedHighlight } from "./highlightDom";
import { paintHighlights } from "./highlightDom";
import { sanitizeArticle } from "./sanitize";
import { SweepLayer } from "./SweepLayer";
import { useArticlePointer } from "./useArticlePointer";
import { useSweeps } from "./useSweeps";

export interface ArticleSelection {
  start: number;
  end: number;
  text: string;
  x: number;
  y: number;
}

interface ReaderArticleProps {
  html: string;
  highlights: PaintedHighlight[];
  fresh: Set<string>;
  onFreshDone: (id: string) => void;
  onSelect: (selection: ArticleSelection | null) => void;
  onHighlightClick: (id: string, x: number, y: number) => void;
  children?: ReactNode;
  contentRef: RefObject<HTMLDivElement | null>;
}

// Repeint les surlignages après chaque changement ; renvoie un compteur de peintures.
function usePaint(
  contentRef: RefObject<HTMLDivElement | null>,
  highlights: PaintedHighlight[],
  fresh: Set<string>,
  html: object,
): number {
  const [painted, setPainted] = useState(0);
  useLayoutEffect(() => {
    if (!contentRef.current) return;
    paintHighlights(contentRef.current, highlights, fresh);
    setPainted((n) => n + 1);
  }, [contentRef, highlights, fresh, html]);
  return painted;
}

export function ReaderArticle(props: ReaderArticleProps): ReactElement {
  const { html, highlights, fresh, onFreshDone, contentRef } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const safeHtml = useMemo(() => ({ __html: sanitizeArticle(html) }), [html]);
  const painted = usePaint(contentRef, highlights, fresh, safeHtml);
  const freshList = useMemo(
    () => highlights.filter((h) => fresh.has(h.id)).map((h) => ({ id: h.id, color: h.color, byClaude: h.byClaude })),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- recalculé après chaque peinture
    [highlights, fresh, painted],
  );
  const { sweeps, finish } = useSweeps(containerRef.current, contentRef.current, freshList, onFreshDone);
  const pointer = useArticlePointer(containerRef, contentRef, props.onSelect, props.onHighlightClick);
  return (
    <div ref={containerRef} className="relative isolate">
      <SweepLayer sweeps={sweeps} onFinish={finish} />
      <div
        ref={contentRef}
        role="presentation"
        className="sv-article relative z-[1]"
        onMouseUp={pointer.onMouseUp}
        onClick={pointer.onClick}
        dangerouslySetInnerHTML={safeHtml}
      />
      {props.children}
    </div>
  );
}
