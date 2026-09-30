import type { MouseEvent, ReactElement, ReactNode, RefObject } from "react";
import { useLayoutEffect, useMemo, useRef, useState } from "react";

import { openExternal } from "../shared/openExternal";
import type { PaintedHighlight } from "./highlightDom";
import { offsetsFromRange, paintHighlights } from "./highlightDom";
import { sanitizeArticle } from "./sanitize";
import { SweepLayer } from "./SweepLayer";
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

export function ReaderArticle({
  html,
  highlights,
  fresh,
  onFreshDone,
  onSelect,
  onHighlightClick,
  children,
  contentRef,
}: ReaderArticleProps): ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const [painted, setPainted] = useState(0);
  const safeHtml = useMemo(() => ({ __html: sanitizeArticle(html) }), [html]);

  useLayoutEffect(() => {
    if (!contentRef.current) return;
    paintHighlights(contentRef.current, highlights, fresh);
    setPainted((n) => n + 1);
  }, [highlights, fresh, safeHtml]);

  const freshList = useMemo(
    () =>
      highlights
        .filter((h) => fresh.has(h.id))
        .map((h) => ({ id: h.id, color: h.color, byClaude: h.byClaude })),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- recalculé après chaque peinture
    [highlights, fresh, painted],
  );
  const { sweeps, finish } = useSweeps(
    containerRef.current,
    contentRef.current,
    freshList,
    onFreshDone,
  );

  function onMouseUp(e: MouseEvent): void {
    const target = e.target as HTMLElement; // cible d'un clic dans l'article : un élément
    const mark = target.closest("mark[data-hl-id]");
    const selection = window.getSelection();
    if (mark && (!selection || selection.isCollapsed)) {
      const origin = containerRef.current?.getBoundingClientRect();
      onHighlightClick(
        mark.getAttribute("data-hl-id") ?? "",
        e.clientX - (origin?.left ?? 0),
        e.clientY - (origin?.top ?? 0),
      );
      return;
    }
    if (
      !selection ||
      selection.isCollapsed ||
      !contentRef.current ||
      !containerRef.current
    )
      return onSelect(null);
    const range = selection.getRangeAt(0);
    const offsets = offsetsFromRange(contentRef.current, range);
    if (!offsets || !offsets.text.trim()) return onSelect(null);
    const rect = range.getBoundingClientRect();
    const origin = containerRef.current.getBoundingClientRect();
    onSelect({
      ...offsets,
      x: rect.left + rect.width / 2 - origin.left,
      y: rect.top - origin.top,
    });
  }

  function onClick(e: MouseEvent): void {
    const link = (e.target as HTMLElement).closest("a"); // idem : clic sur un élément
    if (!link) return;
    e.preventDefault();
    openExternal(link.href);
  }

  return (
    <div ref={containerRef} className="relative isolate">
      <SweepLayer sweeps={sweeps} onFinish={finish} />
      <div
        ref={contentRef}
        role="presentation"
        className="sv-article relative z-[1]"
        onMouseUp={onMouseUp}
        onClick={onClick}
        dangerouslySetInnerHTML={safeHtml}
      />
      {children}
    </div>
  );
}
