import type { ZHighlightColor } from "@karakeep/shared/types/highlights";

// Positions de surlignage = décalages dans la suite des nœuds texte du contenu
// (même parcours SHOW_TEXT que le lecteur web et l'outil MCP highlight-quote).

export interface PaintedHighlight {
  id: string;
  startOffset: number;
  endOffset: number;
  color: ZHighlightColor;
  byClaude: boolean;
}

interface TextSlice {
  node: Text;
  start: number;
  end: number;
}

const MARK_ATTR = "data-hl-id";

function textWalker(root: HTMLElement): TreeWalker {
  return document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
}

function offsetOf(root: HTMLElement, target: Node, inner: number): number {
  const walker = textWalker(root);
  let offset = 0;
  while (walker.nextNode()) {
    if (walker.currentNode === target) return offset + inner;
    offset += walker.currentNode.textContent?.length ?? 0;
  }
  return -1;
}

// Un point de sélection peut tomber sur un élément : on le ramène au texte le plus proche.
function toTextPoint(
  root: HTMLElement,
  node: Node,
  offset: number,
): { node: Node; offset: number } {
  if (node.nodeType === Node.TEXT_NODE) return { node, offset };
  const child = node.childNodes[offset] ?? null;
  const walker = textWalker(root);
  walker.currentNode = child ?? node;
  const next = child
    ? child.nodeType === Node.TEXT_NODE
      ? child
      : walker.nextNode()
    : walker.nextNode();
  return next ? { node: next, offset: 0 } : { node, offset: 0 };
}

export function offsetsFromRange(
  root: HTMLElement,
  range: Range,
): { start: number; end: number; text: string } | null {
  if (!root.contains(range.commonAncestorContainer)) return null;
  const a = toTextPoint(root, range.startContainer, range.startOffset);
  const b = toTextPoint(root, range.endContainer, range.endOffset);
  const start = offsetOf(root, a.node, a.offset);
  const end = offsetOf(root, b.node, b.offset);
  if (start < 0 || end <= start) return null;
  return { start, end, text: range.toString() };
}

function slicesFor(root: HTMLElement, start: number, end: number): TextSlice[] {
  const walker = textWalker(root);
  const slices: TextSlice[] = [];
  let offset = 0;
  while (walker.nextNode()) {
    const node = walker.currentNode as Text; // SHOW_TEXT ne renvoie que des nœuds texte
    const nodeEnd = offset + node.length;
    if (offset < end && nodeEnd > start) {
      slices.push({
        node,
        start: Math.max(0, start - offset),
        end: Math.min(node.length, end - offset),
      });
    }
    offset = nodeEnd;
  }
  return slices;
}

export function rangeForOffsets(
  root: HTMLElement,
  start: number,
  end: number,
): Range | null {
  const slices = slicesFor(root, start, end);
  if (slices.length === 0) return null;
  const range = document.createRange();
  range.setStart(slices[0].node, slices[0].start);
  range.setEnd(slices[slices.length - 1].node, slices[slices.length - 1].end);
  return range;
}

export function clearHighlights(root: HTMLElement): void {
  root.querySelectorAll(`mark[${MARK_ATTR}]`).forEach((mark) => {
    const parent = mark.parentNode;
    if (!parent) return;
    while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
    parent.removeChild(mark);
  });
  root.normalize();
}

function wrapSlice(
  slice: TextSlice,
  h: PaintedHighlight,
  hidden: boolean,
): void {
  if (slice.end <= slice.start || !slice.node.parentNode) return;
  let node = slice.node;
  if (slice.start > 0) node = node.splitText(slice.start);
  if (slice.end - slice.start < node.length)
    node.splitText(slice.end - slice.start);
  const mark = document.createElement("mark");
  mark.setAttribute(MARK_ATTR, h.id);
  mark.className = `sv-hl${h.byClaude ? " sv-hl-claude" : ""}${hidden ? " sv-hl-pending" : ""}`;
  mark.style.setProperty("--hl-bg", `var(--hl-${h.color}-bg)`);
  mark.style.setProperty("--hl-solid", `var(--hl-${h.color})`);
  node.parentNode?.insertBefore(mark, node);
  mark.appendChild(node);
}

// Repeint tous les surlignages ; ceux de `pending` restent transparents le temps du balayage.
export function paintHighlights(
  root: HTMLElement,
  highlights: PaintedHighlight[],
  pending: Set<string>,
): void {
  clearHighlights(root);
  const ordered = [...highlights].sort((a, b) => b.startOffset - a.startOffset);
  for (const h of ordered) {
    for (const slice of slicesFor(root, h.startOffset, h.endOffset).reverse())
      wrapSlice(slice, h, pending.has(h.id));
  }
}

export function markElements(root: HTMLElement, id: string): HTMLElement[] {
  return Array.from(
    root.querySelectorAll<HTMLElement>(
      `mark[${MARK_ATTR}="${CSS.escape(id)}"]`,
    ),
  );
}
