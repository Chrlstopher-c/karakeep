import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "@karakeep/shared-react/trpc";
import { BookmarkTypes } from "@karakeep/shared/types/bookmarks";

import { useActiveConnection } from "../connection/ConnectionContext";
import { log } from "../shared/log";

export type CaptureKind = "LIEN" | "NOTE" | "FICHIER";

export interface CaptureInput {
  text: string;
  file: File | null;
  listId: string | null;
  tags: string[];
}

export function captureKind(text: string, file: File | null): CaptureKind {
  if (file) return "FICHIER";
  return /^https?:\/\/\S+$/i.test(text.trim()) ? "LIEN" : "NOTE";
}

interface UploadedAsset {
  assetId: string;
  contentType: string;
  fileName: string;
}

// Enregistre la capture : favori (lien, note ou fichier téléversé), puis liste et tags.
export function useCapture(): {
  save: (input: CaptureInput) => Promise<string>;
  saving: boolean;
} {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { address, apiKey } = useActiveConnection();
  const create = useMutation(trpc.bookmarks.createBookmark.mutationOptions());
  const addToList = useMutation(trpc.lists.addToList.mutationOptions());
  const updateTags = useMutation(trpc.bookmarks.updateTags.mutationOptions());

  const upload = async (file: File): Promise<UploadedAsset> => {
    const body = new FormData();
    body.append("file", file);
    const res = await fetch(`${address}/api/assets`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body,
    });
    if (!res.ok) throw new Error(`téléversement refusé (${res.status})`);
    return (await res.json()) as UploadedAsset; // réponse de POST /api/assets
  };

  const createBookmark = async (
    input: CaptureInput,
  ): Promise<{ id: string }> => {
    const kind = captureKind(input.text, input.file);
    if (kind === "LIEN")
      return create.mutateAsync({
        type: BookmarkTypes.LINK,
        url: input.text.trim(),
      });
    if (kind === "NOTE")
      return create.mutateAsync({ type: BookmarkTypes.TEXT, text: input.text });
    const asset = await upload(input.file as File); // kind FICHIER implique un fichier
    const assetType = asset.contentType === "application/pdf" ? "pdf" : "image";
    return create.mutateAsync({
      type: BookmarkTypes.ASSET,
      assetType,
      assetId: asset.assetId,
      fileName: asset.fileName,
    });
  };

  const save = async (input: CaptureInput): Promise<string> => {
    try {
      const bookmark = await createBookmark(input);
      if (input.listId)
        await addToList.mutateAsync({
          listId: input.listId,
          bookmarkId: bookmark.id,
        });
      if (input.tags.length) {
        await updateTags.mutateAsync({
          bookmarkId: bookmark.id,
          attach: input.tags.map((tagName) => ({ tagName })),
          detach: [],
        });
      }
      void queryClient.invalidateQueries(trpc.bookmarks.pathFilter());
      return bookmark.id;
    } catch (cause) {
      log.error("capture", cause);
      throw cause;
    }
  };

  return { save, saving: create.isPending || addToList.isPending };
}
