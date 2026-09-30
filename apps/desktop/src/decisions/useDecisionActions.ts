import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "@karakeep/shared-react/trpc";
import type { ZBookmark } from "@karakeep/shared/types/bookmarks";
import { BookmarkTypes } from "@karakeep/shared/types/bookmarks";

import type { DecisionStatus } from "../knowledge/conventions";
import { log } from "../shared/log";
import { SHEET_TEMPLATE, decisionLine, replaceSection } from "./sheetModel";

export interface DecisionActions {
  decide: (bookmark: ZBookmark, option: string) => Promise<void>;
  reopen: (bookmark: ZBookmark, previousText: string) => Promise<void>;
  saveText: (bookmarkId: string, text: string) => Promise<void>;
  createSheet: (title: string, listId: string, project: string | null) => Promise<string>;
}

function noteText(bookmark: ZBookmark): string {
  return bookmark.content.type === "text" ? bookmark.content.text : "";
}

interface SheetMutations {
  setText: (bookmarkId: string, text: string) => Promise<unknown>;
  setStatus: (bookmark: ZBookmark, status: DecisionStatus) => Promise<unknown>;
  create: (title: string, listId: string, project: string | null) => Promise<string>;
  refresh: () => void;
}

function useSheetMutations(): SheetMutations {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const onError = (cause: unknown): void => log.error("fiche de décision", cause);
  const updateText = useMutation(trpc.bookmarks.updateBookmarkText.mutationOptions({ onError }));
  const updateTags = useMutation(trpc.bookmarks.updateTags.mutationOptions({ onError }));
  const createBm = useMutation(trpc.bookmarks.createBookmark.mutationOptions({ onError }));
  const rename = useMutation(trpc.bookmarks.updateBookmark.mutationOptions({ onError }));
  const addToList = useMutation(trpc.lists.addToList.mutationOptions({ onError }));
  const tag = (bookmarkId: string, attach: string[], detachIds: string[] = []): Promise<unknown> =>
    updateTags.mutateAsync({
      bookmarkId,
      attach: attach.map((tagName) => ({ tagName })),
      detach: detachIds.map((tagId) => ({ tagId })),
    });
  return {
    setText: (bookmarkId, text) => updateText.mutateAsync({ bookmarkId, text }),
    setStatus: (bookmark, status) =>
      tag(
        bookmark.id,
        [`statut:${status}`],
        bookmark.tags.filter((t) => t.name.startsWith("statut:")).map((t) => t.id),
      ),
    create: async (title, listId, project) => {
      const { id } = await createBm.mutateAsync({ type: BookmarkTypes.TEXT, text: SHEET_TEMPLATE });
      await rename.mutateAsync({ bookmarkId: id, title });
      await addToList.mutateAsync({ listId, bookmarkId: id });
      await tag(id, ["statut:ouverte", ...(project ? [`projet:${project}`] : [])]);
      return id;
    },
    refresh: () => void queryClient.invalidateQueries(trpc.bookmarks.pathFilter()),
  };
}

// Retenir une option réécrit la section Décision et passe la fiche en « tranchée ».
export function useDecisionActions(): DecisionActions {
  const m = useSheetMutations();
  const then = async (work: Promise<unknown>): Promise<void> => {
    await work;
    m.refresh();
  };
  return {
    decide: (bookmark, option) => {
      const text = replaceSection(noteText(bookmark), "decision", decisionLine(option, new Date(), "Chris"));
      return then(m.setText(bookmark.id, text).then(() => m.setStatus(bookmark, "tranchée")));
    },
    reopen: (bookmark, previousText) =>
      then(m.setText(bookmark.id, previousText).then(() => m.setStatus(bookmark, "ouverte"))),
    saveText: (bookmarkId, text) => then(m.setText(bookmarkId, text)),
    createSheet: async (title, listId, project) => {
      const id = await m.create(title, listId, project);
      m.refresh();
      return id;
    },
  };
}
