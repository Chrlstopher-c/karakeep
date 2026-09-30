import type { ZBookmark } from "@karakeep/shared/types/bookmarks";
import { getBookmarkTitle } from "@karakeep/shared/utils/bookmarkUtils";

export type SourceKind = "lien" | "note" | "image" | "pdf";

export const KIND_LABEL: Record<SourceKind, string> = {
  lien: "Lien",
  note: "Note",
  image: "Image",
  pdf: "PDF",
};

export interface SourceView {
  id: string;
  kind: SourceKind;
  title: string;
  domain: string;
  excerpt: string | null;
  imageUrl: string | null;
  imageAssetId: string | null;
  createdAt: Date;
}

function hostOf(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function bannerAsset(bookmark: ZBookmark): string | null {
  return bookmark.assets.find((a) => a.assetType === "bannerImage")?.id ?? null;
}

function stripMarkdown(text: string): string {
  return text
    .replace(/[#>*_`=[\]()|-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function toSourceView(bookmark: ZBookmark): SourceView {
  const base = {
    id: bookmark.id,
    title: getBookmarkTitle(bookmark) ?? "Sans titre",
    createdAt: bookmark.createdAt,
  };
  const content = bookmark.content;
  if (content.type === "link") {
    return {
      ...base,
      kind: "lien",
      domain: hostOf(content.url),
      excerpt: content.description ?? null,
      imageUrl: content.imageUrl ?? null,
      imageAssetId: bannerAsset(bookmark) ?? content.imageAssetId ?? null,
    };
  }
  if (content.type === "text") {
    return {
      ...base,
      kind: "note",
      domain: "Note",
      excerpt: stripMarkdown(content.text).slice(0, 220),
      imageUrl: null,
      imageAssetId: bannerAsset(bookmark),
    };
  }
  if (content.type === "asset") {
    const kind = content.assetType === "pdf" ? "pdf" : "image";
    return {
      ...base,
      kind,
      domain: content.fileName ?? KIND_LABEL[kind],
      excerpt: null,
      imageUrl: null,
      imageAssetId: kind === "image" ? content.assetId : bannerAsset(bookmark),
    };
  }
  return {
    ...base,
    kind: "lien",
    domain: "",
    excerpt: null,
    imageUrl: null,
    imageAssetId: null,
  };
}
