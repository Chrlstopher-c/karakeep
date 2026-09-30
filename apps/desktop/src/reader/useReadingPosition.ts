import type { RefObject } from "react";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import { useTRPC } from "@karakeep/shared-react/trpc";

import { useScrollContainer } from "../app/scroll";
import { log } from "../shared/log";
import { rangeForOffsets } from "./highlightDom";

const SAVE_DELAY_MS = 1_500;
const TOP_MARGIN = 120;

// Décalage (en caractères) du premier texte visible : même unité que le lecteur web.
function firstVisibleOffset(content: HTMLElement, top: number): number {
  const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT);
  let offset = 0;
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const range = document.createRange();
    range.selectNodeContents(node);
    if (range.getBoundingClientRect().bottom > top) return offset;
    offset += node.textContent?.length ?? 0;
  }
  return offset;
}

function scrollPercent(el: HTMLElement): number {
  const max = el.scrollHeight - el.clientHeight;
  return max > 0 ? Math.round((el.scrollTop / max) * 100) : 100;
}

// Progression de lecture : restaurée à l'ouverture, enregistrée pendant la lecture.
export function useReadingPosition(
  bookmarkId: string,
  contentRef: RefObject<HTMLDivElement | null>,
  enabled: boolean,
): number {
  const trpc = useTRPC();
  const scroll = useScrollContainer();
  const [percent, setPercent] = useState(0);
  const saved = useQuery({
    ...trpc.readingProgress.get.queryOptions({ bookmarkId }),
    enabled,
    staleTime: Infinity,
  });
  const save = useMutation(
    trpc.bookmarks.updateReadingProgress.mutationOptions({
      onError: (cause) =>
        log.warn(`progression non enregistrée : ${cause.message}`),
    }),
  );
  const restored = useRef(false);
  const saveRef = useRef(save.mutate);
  saveRef.current = save.mutate;

  useEffect(() => {
    const content = contentRef.current;
    const el = scroll.current;
    if (!enabled || restored.current || !saved.isFetched || !content || !el)
      return;
    restored.current = true;
    const offset = saved.data?.offset ?? 0;
    const range =
      offset > 0 ? rangeForOffsets(content, offset, offset + 1) : null;
    if (range)
      el.scrollTop +=
        range.getBoundingClientRect().top -
        el.getBoundingClientRect().top -
        TOP_MARGIN;
  }, [enabled, saved.isFetched, saved.data, contentRef, scroll]);

  useEffect(() => {
    const el = scroll.current;
    if (!el) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onScroll = (): void => {
      setPercent(scrollPercent(el));
      if (!enabled || !contentRef.current) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        const content = contentRef.current;
        if (!content) return;
        const offset = firstVisibleOffset(
          content,
          el.getBoundingClientRect().top + TOP_MARGIN,
        );
        saveRef.current({
          bookmarkId,
          readingProgressOffset: offset,
          readingProgressPercent: scrollPercent(el),
        });
      }, SAVE_DELAY_MS);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      el.removeEventListener("scroll", onScroll);
    };
  }, [bookmarkId, enabled, contentRef, scroll]);

  return percent;
}
