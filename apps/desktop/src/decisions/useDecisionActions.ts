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
  createSheet: (
    title: string,
    listId: string,
    project: string | null,
  ) => Promise<string>;
}

function noteText(bookmark: ZBookmark): string {
  return bookmark.content.type === "text" ? bookmark.content.text : "";
}

export function useDecisionActions(): DecisionActions {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const refresh = (): void =>
    void queryClient.invalidateQueries(trpc.bookmarks.pathFilter());
  const onError = (cause: unknown): void =>
    log.error("fiche de décision", cause);
  const updateText = useMutation(
    trpc.bookmarks.updateBookmarkText.mutationOptions({ onError }),
  );
  const updateTags = useMutation(
    trpc.bookmarks.updateTags.mutationOptions({ onError }),
  );
  const create = useMutation(
    trpc.bookmarks.createBookmark.mutationOptions({ onError }),
  );
  const update = useMutation(
    trpc.bookmarks.updateBookmark.mutationOptions({ onError }),
  );
  const addToList = useMutation(
    trpc.lists.addToList.mutationOptions({ onError }),
  );

  const setStatus = async (
    bookmark: ZBookmark,
    status: DecisionStatus,
  ): Promise<void> => {
    const detach = bookmark.tags
      .filter((t) => t.name.startsWith("statut:"))
      .map((t) => ({ tagId: t.id }));
    await updateTags.mutateAsync({
      bookmarkId: bookmark.id,
      attach: [{ tagName: `statut:${status}` }],
      detach,
    });
  };

  return {
    decide: async (bookmark, option) => {
      const text = replaceSection(
        noteText(bookmark),
        "decision",
        decisionLine(option, new Date(), "Chris"),
      );
      await updateText.mutateAsync({ bookmarkId: bookmark.id, text });
      await setStatus(bookmark, "tranchée");
      refresh();
    },
    reopen: async (bookmark, previousText) => {
      await updateText.mutateAsync({
        bookmarkId: bookmark.id,
        text: previousText,
      });
      await setStatus(bookmark, "ouverte");
      refresh();
    },
    saveText: async (bookmarkId, text) => {
      await updateText.mutateAsync({ bookmarkId, text });
      refresh();
    },
    createSheet: async (title, listId, project) => {
      const created = await create.mutateAsync({
        type: BookmarkTypes.TEXT,
        text: SHEET_TEMPLATE,
      });
      await update.mutateAsync({ bookmarkId: created.id, title });
      await addToList.mutateAsync({ listId, bookmarkId: created.id });
      const tags = [
        { tagName: "statut:ouverte" },
        ...(project ? [{ tagName: `projet:${project}` }] : []),
      ];
      await updateTags.mutateAsync({
        bookmarkId: created.id,
        attach: tags,
        detach: [],
      });
      refresh();
      return created.id;
    },
  };
}
