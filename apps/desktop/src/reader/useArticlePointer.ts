import type { MouseEvent, RefObject } from "react";

import { openExternal } from "../shared/openExternal";
import { offsetsFromRange } from "./highlightDom";
import type { ArticleSelection } from "./ReaderArticle";

interface Handlers {
  onMouseUp: (e: MouseEvent) => void;
  onClick: (e: MouseEvent) => void;
}

function relativeTo(container: HTMLElement, x: number, y: number): { x: number; y: number } {
  const origin = container.getBoundingClientRect();
  return { x: x - origin.left, y: y - origin.top };
}

// Clic sur un surlignage, sélection d'un passage, ou lien ouvert dans le navigateur du système.
export function useArticlePointer(
  containerRef: RefObject<HTMLDivElement | null>,
  contentRef: RefObject<HTMLDivElement | null>,
  onSelect: (selection: ArticleSelection | null) => void,
  onHighlightClick: (id: string, x: number, y: number) => void,
): Handlers {
  const onMouseUp = (e: MouseEvent): void => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;
    const target = e.target as HTMLElement; // cible d'un clic dans l'article : un élément
    const mark = target.closest("mark[data-hl-id]");
    const selection = window.getSelection();
    if (mark && (!selection || selection.isCollapsed)) {
      const at = relativeTo(container, e.clientX, e.clientY);
      return onHighlightClick(mark.getAttribute("data-hl-id") ?? "", at.x, at.y);
    }
    if (!selection || selection.isCollapsed) return onSelect(null);
    const range = selection.getRangeAt(0);
    const offsets = offsetsFromRange(content, range);
    if (!offsets || !offsets.text.trim()) return onSelect(null);
    const rect = range.getBoundingClientRect();
    onSelect({ ...offsets, ...relativeTo(container, rect.left + rect.width / 2, rect.top) });
  };
  const onClick = (e: MouseEvent): void => {
    const link = (e.target as HTMLElement).closest("a"); // idem : clic sur un élément
    if (!link) return;
    e.preventDefault();
    openExternal(link.href);
  };
  return { onMouseUp, onClick };
}
