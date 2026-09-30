import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "@karakeep/shared-react/trpc";
import type { ZHighlight, ZHighlightColor } from "@karakeep/shared/types/highlights";

import { useProvenance } from "../claude/useAgentActivity";
import { log } from "../shared/log";
import type { PaintedHighlight } from "./highlightDom";

const LIVE_POLL_MS = 3_000;

interface Selection {
  start: number;
  end: number;
  text: string;
}

interface HighlightMutations {
  create: (sel: Selection, color: ZHighlightColor, note: string | null) => void;
  update: (id: string, color: ZHighlightColor, note: string | null) => void;
  remove: (id: string) => void;
}

export interface ReaderHighlights extends HighlightMutations {
  list: ZHighlight[];
  painted: PaintedHighlight[];
  fresh: Set<string>;
  byClaude: (id: string) => boolean;
  doneFresh: (id: string) => void;
}

// Tout surlignage apparu depuis l'ouverture (de Chris ou de Claude, en direct)
// reste « frais » le temps de son balayage.
function useFreshHighlights(list: ZHighlight[], loaded: boolean): { fresh: Set<string>; done: (id: string) => void } {
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const known = useRef<Set<string> | null>(null);
  useEffect(() => {
    if (!loaded) return;
    const previous = known.current;
    if (previous) {
      const added = list.filter((h) => !previous.has(h.id)).map((h) => h.id);
      if (added.length) setFresh((f) => new Set([...f, ...added]));
    }
    known.current = new Set(list.map((h) => h.id));
  }, [list, loaded]);
  const done = useCallback((id: string) => {
    setFresh((f) => new Set([...f].filter((x) => x !== id)));
  }, []);
  return { fresh, done };
}

function useHighlightMutations(bookmarkId: string): HighlightMutations {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const onSuccess = (): void => {
    void queryClient.invalidateQueries(trpc.highlights.pathFilter());
    void queryClient.invalidateQueries(trpc.agentActivity.provenance.pathFilter());
  };
  const onError = (cause: unknown): void => log.error("surlignage", cause);
  const createM = useMutation(trpc.highlights.create.mutationOptions({ onSuccess, onError }));
  const updateM = useMutation(trpc.highlights.update.mutationOptions({ onSuccess, onError }));
  const deleteM = useMutation(trpc.highlights.delete.mutationOptions({ onSuccess, onError }));
  return {
    create: (sel, color, note) =>
      createM.mutate({ bookmarkId, startOffset: sel.start, endOffset: sel.end, text: sel.text, color, note }),
    update: (id, color, note) => updateM.mutate({ highlightId: id, color, note }),
    remove: (id) => deleteM.mutate({ highlightId: id }),
  };
}

// Surlignages d'une source, rafraîchis en continu pour montrer ceux de Claude en direct.
export function useReaderHighlights(bookmarkId: string): ReaderHighlights {
  const trpc = useTRPC();
  const provenance = useProvenance();
  const query = useQuery({
    ...trpc.highlights.getForBookmark.queryOptions({ bookmarkId }),
    refetchInterval: LIVE_POLL_MS,
  });
  const list = useMemo(() => query.data?.highlights ?? [], [query.data]);
  const { fresh, done } = useFreshHighlights(list, !!query.data);
  const mutations = useHighlightMutations(bookmarkId);
  const byClaude = useCallback((id: string) => provenance.highlightIds.has(id), [provenance.highlightIds]);
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
  return { list, painted, fresh, byClaude, doneFresh: done, ...mutations };
}
