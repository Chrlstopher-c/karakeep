import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "@karakeep/shared-react/trpc";
import type {
  ZHighlight,
  ZHighlightColor,
} from "@karakeep/shared/types/highlights";

import { useProvenance } from "../claude/useAgentActivity";
import { log } from "../shared/log";
import type { PaintedHighlight } from "./highlightDom";

const LIVE_POLL_MS = 3_000;

export interface ReaderHighlights {
  list: ZHighlight[];
  painted: PaintedHighlight[];
  fresh: Set<string>;
  byClaude: (id: string) => boolean;
  doneFresh: (id: string) => void;
  create: (
    sel: { start: number; end: number; text: string },
    color: ZHighlightColor,
    note: string | null,
  ) => void;
  update: (id: string, color: ZHighlightColor, note: string | null) => void;
  remove: (id: string) => void;
}

// Surlignages d'une source ; tout surlignage nouveau (de Chris ou de Claude, en
// direct) est « frais » le temps de son balayage.
export function useReaderHighlights(bookmarkId: string): ReaderHighlights {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const provenance = useProvenance();
  const query = useQuery({
    ...trpc.highlights.getForBookmark.queryOptions({ bookmarkId }),
    refetchInterval: LIVE_POLL_MS,
  });
  const list = useMemo(() => query.data?.highlights ?? [], [query.data]);
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const known = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (!query.data) return;
    const ids = new Set(list.map((h) => h.id));
    if (known.current) {
      const added = list
        .filter((h) => !known.current?.has(h.id))
        .map((h) => h.id);
      if (added.length) setFresh((f) => new Set([...f, ...added]));
    }
    known.current = ids;
  }, [list, query.data]);

  const invalidate = useCallback(() => {
    void queryClient.invalidateQueries(trpc.highlights.pathFilter());
    void queryClient.invalidateQueries(
      trpc.agentActivity.provenance.pathFilter(),
    );
  }, [queryClient, trpc]);
  const onError = (what: string) => (cause: unknown) =>
    log.error(`surlignage : ${what}`, cause);
  const createM = useMutation(
    trpc.highlights.create.mutationOptions({
      onSuccess: invalidate,
      onError: onError("création"),
    }),
  );
  const updateM = useMutation(
    trpc.highlights.update.mutationOptions({
      onSuccess: invalidate,
      onError: onError("modification"),
    }),
  );
  const deleteM = useMutation(
    trpc.highlights.delete.mutationOptions({
      onSuccess: invalidate,
      onError: onError("suppression"),
    }),
  );

  const byClaude = useCallback(
    (id: string) => provenance.highlightIds.has(id),
    [provenance.highlightIds],
  );
  const painted = useMemo(
    () =>
      list.map((h) => ({
        id: h.id,
        startOffset: h.startOffset,
        endOffset: h.endOffset,
        color: h.color,
        byClaude: byClaude(h.id),
      })),
    [list, byClaude],
  );

  return {
    list,
    painted,
    fresh,
    byClaude,
    doneFresh: useCallback(
      (id: string) =>
        setFresh((f) => {
          const n = new Set(f);
          n.delete(id);
          return n;
        }),
      [],
    ),
    create: (sel, color, note) =>
      createM.mutate({
        bookmarkId,
        startOffset: sel.start,
        endOffset: sel.end,
        text: sel.text,
        color,
        note,
      }),
    update: (id, color, note) =>
      updateM.mutate({ highlightId: id, color, note }),
    remove: (id) => deleteM.mutate({ highlightId: id }),
  };
}
