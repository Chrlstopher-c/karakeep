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

interface UploadedAsset {
  assetId: string;
  contentType: string;
  fileName: string;
}

export function captureKind(text: string, file: File | null): CaptureKind {
  if (file) return "FICHIER";
  return /^https?:\/\/\S+$/i.test(text.trim()) ? "LIEN" : "NOTE";
}

async function uploadAsset(address: string, apiKey: string, file: File): Promise<UploadedAsset> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch(`${address}/api/assets`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body,
  });
  if (!res.ok) throw new Error(`téléversement refusé (${res.status})`);
  return (await res.json()) as UploadedAsset; // réponse de POST /api/assets
}

type CreateBookmark = ReturnType<typeof useCreateMutation>["mutateAsync"];

function useCreateMutation() {
  const trpc = useTRPC();
  return useMutation(trpc.bookmarks.createBookmark.mutationOptions());
}

async function createCaptured(
  input: CaptureInput,
  create: CreateBookmark,
  upload: (f: File) => Promise<UploadedAsset>,
): Promise<{ id: string }> {
  if (captureKind(input.text, input.file) === "LIEN")
    return create({ type: BookmarkTypes.LINK, url: input.text.trim() });
  if (!input.file) return create({ type: BookmarkTypes.TEXT, text: input.text });
  const asset = await upload(input.file);
  const assetType = asset.contentType === "application/pdf" ? "pdf" : "image";
  return create({ type: BookmarkTypes.ASSET, assetType, assetId: asset.assetId, fileName: asset.fileName });
}

// Enregistre la capture : favori (lien, note ou fichier téléversé), puis liste et tags.
export function useCapture(): { save: (input: CaptureInput) => Promise<string>; saving: boolean } {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { address, apiKey } = useActiveConnection();
  const create = useCreateMutation();
  const addToList = useMutation(trpc.lists.addToList.mutationOptions());
  const updateTags = useMutation(trpc.bookmarks.updateTags.mutationOptions());

  const save = async (input: CaptureInput): Promise<string> => {
    try {
      const { id } = await createCaptured(input, create.mutateAsync, (file) => uploadAsset(address, apiKey, file));
      if (input.listId) await addToList.mutateAsync({ listId: input.listId, bookmarkId: id });
      const attach = input.tags.map((tagName) => ({ tagName }));
      if (attach.length) await updateTags.mutateAsync({ bookmarkId: id, attach, detach: [] });
      void queryClient.invalidateQueries(trpc.bookmarks.pathFilter());
      return id;
    } catch (cause) {
      log.error("capture", cause);
      throw cause;
    }
  };

  return { save, saving: create.isPending || addToList.isPending };
}
